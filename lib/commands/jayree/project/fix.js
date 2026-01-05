/*
 * Copyright 2026, jayree
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
import { SfCommand, optionalOrgFlagWithDeprecations, arrayWithDeprecation } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { applyFixes, getFixes, logFixes, setDebug } from '../../../utils/souceUtils.js';
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'sourcefix');
// eslint-disable-next-line sf-plugin/command-example
export default class FixMetadata extends SfCommand {
    static summary = messages.getMessage('commandDescription');
    /*   public static examples = [
      `$ sfdx jayree:flowtestcoverage
  === Flow Test Coverage
  Coverage: 82%
  ...
  `
    ]; */
    static flags = {
        'target-org': optionalOrgFlagWithDeprecations,
        task: arrayWithDeprecation({
            char: 't',
            summary: messages.getMessage('task'),
            aliases: ['tag'],
            deprecateAliases: true,
        }),
    };
    static requiresProject = true;
    static deprecateAliases = true;
    static aliases = ['jayree:source:fix'];
    async run() {
        const { flags } = await this.parse(FixMetadata);
        setDebug([this.config.bin, 'jayree', 'project', 'fix'].join(':'));
        const updatedfiles = await applyFixes(await getFixes(flags.task ?? [], false));
        await logFixes(updatedfiles);
        return {
            fixedFiles: Object.values(updatedfiles)
                .filter((value) => value.length > 0)
                .reduce((acc, val) => acc.concat(val), []),
            details: updatedfiles,
        };
    }
}
//# sourceMappingURL=fix.js.map