/*
 * Copyright 2025, jayree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import objectPath from 'object-path';
function compareobj(obj1, obj2) {
    if (typeof obj1 === 'string' && typeof obj2 === 'string') {
        return obj1 === obj2;
    }
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
    }
    return false;
}
class ObjectPathResolver {
    path = [];
    object;
    returnPathBefore = '';
    constructor(object) {
        this.object = object;
    }
    value() {
        if (this.returnPathBefore) {
            return this.path.map((x) => {
                const split = x.split('.');
                const indexReturnPathBefore = split.indexOf(this.returnPathBefore);
                return split.slice(0, indexReturnPathBefore).join('.');
            });
        }
        else {
            return this.path;
        }
    }
    resolve({ path, key, value }) {
        if (this.path.length > 0) {
            for (const [i, v] of this.path.entries()) {
                if (Array.isArray(objectPath.get(this.object, v))) {
                    this.path[i] = `${v}.${i}.${path}`;
                }
                else {
                    this.path[i] = v + '.' + path;
                }
            }
        }
        else {
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
    resolveString(string) {
        string.match(/(?:[^.']+|'[^']*')+/g)?.forEach((element) => {
            const query = {};
            const e = element.split(/(\[.*\])/);
            if (e.length === 1) {
                query.path = e[0];
            }
            else {
                query.path = e[0];
                const params = JSON.parse(e[1].replace(/'/g, '"'));
                if (params.length >= 2) {
                    if (Array.isArray(params[0])) {
                        query.key = params.map((x) => x[0]);
                        query.value = params.map((x) => x[1]);
                    }
                    else {
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
    findMatchingPath(key, value) {
        let matchingPath = [];
        for (const currenpath of this.path) {
            const currentvalue = objectPath.get(this.object, currenpath);
            if (currentvalue) {
                if (value === undefined) {
                    if (Array.isArray(currentvalue)) {
                        for (let i = 0; i < currentvalue.length; i++) {
                            matchingPath.push(`${currenpath}.${i}`);
                        }
                    }
                    else {
                        matchingPath.push(currenpath);
                    }
                }
                else if (key === undefined) {
                    if (compareobj(currentvalue, value)) {
                        matchingPath.push(`${currenpath}`);
                    }
                    else if (typeof currentvalue === 'string' && typeof value === 'string' && currentvalue.includes(value)) {
                        matchingPath.push(`${currenpath}.${currentvalue.indexOf(value)}`);
                    }
                }
                else if (Array.isArray(currentvalue) && currentvalue.length > 0) {
                    matchingPath = matchingPath.concat(this.findIndexedPath(currenpath, currentvalue, key, value));
                }
                else {
                    matchingPath = matchingPath.concat(this.findSinglePath(currenpath, key, value));
                }
            }
        }
        return matchingPath;
    }
    findIndexedPath(currenpath, currentvalue, key, value) {
        const matchingPath = [];
        for (let i = 0; i < currentvalue.length; i++) {
            let match = true;
            for (const [k, v] of key.entries()) {
                const obj2compare = objectPath.get(this.object, `${currenpath}.${i}.${v}`);
                if (obj2compare) {
                    if (!compareobj(obj2compare, value[k])) {
                        match = false;
                    }
                }
                else if (value[k] !== 'undefined') {
                    match = false;
                }
            }
            if (match) {
                matchingPath.push(`${currenpath}.${i}`);
            }
        }
        return matchingPath;
    }
    findSinglePath(currenpath, key, value) {
        const matchingPath = [];
        let match = true;
        for (const [k, v] of key.entries()) {
            const obj2compare = objectPath.get(this.object, `${currenpath}.${v}`);
            if (obj2compare) {
                if (!compareobj(obj2compare, value[k])) {
                    match = false;
                }
            }
            else if (value[k] !== 'undefined') {
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
//# sourceMappingURL=object-path.js.map