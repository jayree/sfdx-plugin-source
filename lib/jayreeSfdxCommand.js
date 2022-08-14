/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'path';
import { SfdxCommand } from '@salesforce/command';
import { get } from '@salesforce/ts-types';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
export class JayreeSfdxCommand extends SfdxCommand {
    getFlag(flagName, defaultVal) {
        return get(this.flags, flagName, defaultVal);
    }
    async getParsedSourceComponents() {
        const projectPath = this.project.getPath();
        const componentSet = ComponentSet.fromSource(projectPath).getSourceComponents();
        const results = {};
        for await (const component of componentSet) {
            for await (const childComponent of component.getChildren()) {
                results[path.relative(projectPath, childComponent.xml)] = await childComponent.parseXml();
            }
            results[path.relative(projectPath, component.xml)] = await component.parseXml();
        }
        return results;
    }
}
//# sourceMappingURL=jayreeSfdxCommand.js.map