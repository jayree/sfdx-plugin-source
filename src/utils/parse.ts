/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { relative } from 'node:path';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
import { JsonMap } from '@salesforce/ts-types';

export async function getParsedSourceComponents(projectPath: string | undefined): Promise<{ [key: string]: JsonMap }> {
  const componentSet = ComponentSet.fromSource(projectPath as string).getSourceComponents();
  const results: { [key: string]: JsonMap } = {};
  for await (const component of componentSet) {
    for await (const childComponent of component.getChildren()) {
      results[relative(projectPath as string, childComponent.xml as string)] = await childComponent.parseXml();
    }
    results[relative(projectPath as string, component.xml as string)] = await component.parseXml();
  }
  return results;
}
