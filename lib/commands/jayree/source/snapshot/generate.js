/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import { JayreeSfdxCommand } from '../../../../jayreeSfdxCommand.js';
Messages.importMessagesDirectory(new URL('./', import.meta.url).pathname);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'generate');
export default class GenerateSourceSnapshot extends JayreeSfdxCommand {
    async run() {
        const filePath = this.getFlag('filepath');
        const results = await this.getParsedSourceComponents();
        await fs.writeJSON(filePath, results, { spaces: 4 });
        this.ux.log(`Generated snapshot file "${filePath}"`);
        return results;
    }
}
GenerateSourceSnapshot.description = messages.getMessage('commandDescription');
GenerateSourceSnapshot.examples = messages.getMessage('examples').split(os.EOL);
GenerateSourceSnapshot.flagsConfig = {
    filepath: flags.string({
        description: messages.getMessage('filepath'),
        default: './sfdx-source-snapshot.json',
    }),
};
GenerateSourceSnapshot.requiresUsername = false;
GenerateSourceSnapshot.supportsDevhubUsername = false;
GenerateSourceSnapshot.requiresProject = true;
//# sourceMappingURL=generate.js.map