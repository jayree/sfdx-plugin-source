/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, optionalOrgFlagWithDeprecations, arrayWithDeprecation } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { applyFixes, getFixes, logFixes, setDebug } from '../../../utils/souceUtils.js';
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
Messages.importMessagesDirectory(__dirname);
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