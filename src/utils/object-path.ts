/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import objectPath from 'object-path';

function compareobj<T extends object>(obj1: T | string, obj2: T | string): boolean {
  if (typeof obj1 === 'string' && typeof obj2 === 'string') {
    return obj1 === obj2;
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1) as Array<keyof T>;
    const keys2 = Object.keys(obj2) as Array<keyof T>;
    return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
  }

  return false;
}

interface QueryParameters {
  path: string;
  key?: string[];
  value?: string[] | string;
}

class ObjectPathResolver {
  private path: string[] = [];
  private object;
  private returnPathBefore = '';

  public constructor(object: Record<string, unknown>) {
    this.object = object;
  }

  public value(): string[] {
    if (this.returnPathBefore) {
      return this.path.map((x) => {
        const split = x.split('.');
        const indexReturnPathBefore = split.indexOf(this.returnPathBefore);
        return split.slice(0, indexReturnPathBefore).join('.');
      });
    } else {
      return this.path;
    }
  }

  public resolve({ path, key, value }: QueryParameters): this {
    if (this.path.length > 0) {
      for (const [i, v] of this.path.entries()) {
        if (Array.isArray(objectPath.get(this.object, v))) {
          this.path[i] = `${v}.${i}.${path}`;
        } else {
          this.path[i] = v + '.' + path;
        }
      }
    } else {
      if (objectPath.get(this.object, path)) {
        this.path.push(path);
      }
      if (value === undefined) {
        return this;
      }
    }

    this.path = this.findMatchingPath(key, value);
    return this;
  }

  public resolveString(string: string): this {
    string.match(/(?:[^.']+|'[^']*')+/g)?.forEach((element) => {
      const query = {} as QueryParameters;
      const e = element.split(/(\[.*\])/);
      if (e.length === 1) {
        query.path = e[0];
      } else {
        query.path = e[0];
        const params = JSON.parse(e[1].replace(/'/g, '"')) as string[];
        if (params.length >= 2) {
          if (Array.isArray(params[0])) {
            query.key = params.map((x) => x[0]);
            query.value = params.map((x) => x[1]);
          } else {
            query.key = [params[0]];
            query.value = [params[1]];
          }
        }
        if (params.length === 1) {
          query.value = params[0];
        }
      }
      if (query.path.startsWith('?')) {
        query.path = query.path.slice(1);

        this.returnPathBefore = query.path;
      }
      this.resolve(query);
    });

    return this;
  }

  private findMatchingPath(key: string[] | undefined, value: string | string[] | undefined): string[] {
    let matchingPath: string[] = [];
    for (const currenpath of this.path) {
      const currentvalue: string | object = objectPath.get(this.object, currenpath) as object | string;
      if (currentvalue) {
        if (value === undefined) {
          if (Array.isArray(currentvalue)) {
            for (let i = 0; i < currentvalue.length; i++) {
              matchingPath.push(`${currenpath}.${i}`);
            }
          } else {
            matchingPath.push(currenpath);
          }
        } else if (key === undefined) {
          if (compareobj(currentvalue, value)) {
            matchingPath.push(`${currenpath}`);
          } else if (typeof currentvalue === 'string' && typeof value === 'string' && currentvalue.includes(value)) {
            matchingPath.push(`${currenpath}.${currentvalue.indexOf(value)}`);
          }
        } else if (Array.isArray(currentvalue) && currentvalue.length > 0) {
          matchingPath = matchingPath.concat(this.findIndexedPath(currenpath, currentvalue as object[], key, value));
        } else {
          matchingPath = matchingPath.concat(this.findSinglePath(currenpath, key, value));
        }
      }
    }
    return matchingPath;
  }

  private findIndexedPath(
    currenpath: string,
    currentvalue: object[],
    key: string[],
    value: string | string[],
  ): string[] {
    const matchingPath: string[] = [];

    for (let i = 0; i < currentvalue.length; i++) {
      let match = true;
      for (const [k, v] of key.entries()) {
        const obj2compare = objectPath.get(this.object, `${currenpath}.${i}.${v}`) as object | string;
        if (obj2compare) {
          if (!compareobj(obj2compare, value[k])) {
            match = false;
          }
        } else if (value[k] !== 'undefined') {
          match = false;
        }
      }
      if (match) {
        matchingPath.push(`${currenpath}.${i}`);
      }
    }
    return matchingPath;
  }

  private findSinglePath(currenpath: string, key: string[], value: string | string[]): string[] {
    const matchingPath: string[] = [];
    let match = true;
    for (const [k, v] of key.entries()) {
      const obj2compare = objectPath.get(this.object, `${currenpath}.${v}`) as object | string;
      if (obj2compare) {
        if (!compareobj(obj2compare, value[k])) {
          match = false;
        }
      } else if (value[k] !== 'undefined') {
        match = false;
      }
    }
    if (match) {
      matchingPath.push(currenpath);
    }
    return matchingPath;
  }
}

export { ObjectPathResolver, objectPath, compareobj };
