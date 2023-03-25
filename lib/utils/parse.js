/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { relative } from 'node:path';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
export async function getParsedSourceComponents(projectPath) {
    const componentSet = ComponentSet.fromSource(projectPath).getSourceComponents();
    const results = {};
    for await (const component of componentSet) {
        for await (const childComponent of component.getChildren()) {
            results[relative(projectPath, childComponent.xml)] = await childComponent.parseXml();
        }
        results[relative(projectPath, component.xml)] = await component.parseXml();
    }
    return results;
}
//# sourceMappingURL=parse.js.map