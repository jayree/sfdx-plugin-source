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
import { relative } from 'node:path';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
export async function getParsedSourceComponents(uniquePackageDirectories, projectPath) {
    const results = {};
    if (uniquePackageDirectories) {
        for await (const packageDirectory of uniquePackageDirectories) {
            const componentSet = ComponentSet.fromSource(packageDirectory).getSourceComponents();
            for await (const component of componentSet) {
                for await (const childComponent of component.getChildren()) {
                    results[relative(projectPath, childComponent.xml)] = await childComponent.parseXml();
                }
                results[relative(projectPath, component.xml)] = await component.parseXml();
            }
        }
    }
    return results;
}
//# sourceMappingURL=parse.js.map