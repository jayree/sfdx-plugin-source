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
import { detailedDiff } from 'deep-object-diff';
import chalk from 'chalk';
import { JayreeSfdxCommand } from '../../../../jayreeSfdxCommand.js';
Messages.importMessagesDirectory(new URL('./', import.meta.url).pathname);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'compare');
export default class CompareSourceSnapshot extends JayreeSfdxCommand {
    // eslint-disable-next-line @typescript-eslint/require-await
    async run() {
        const orig = (await fs.readJSON('sfdx-source-snapshot.json'));
        const results = await this.getParsedSourceComponents();
        const diff = detailedDiff(orig, results);
        const addedMetadata = Object.keys(diff.added);
        const removedMetadata = Object.keys(diff.deleted);
        const modifiedMetadata = Object.keys(diff.updated);
        if (addedMetadata.length === 0 && removedMetadata.length === 0 && modifiedMetadata.length === 0) {
            this.ux.log('No changes have been detected.');
            return {};
        }
        process.exitCode = 1;
        this.ux.log(`The following source files have been modified: (${chalk.green('A')} added, ${chalk.red('D')} removed, ${chalk.yellow('M')} modified)${os.EOL}`);
        removedMetadata.forEach((metadata) => {
            this.ux.log(chalk.red(`D\t${metadata}`));
        });
        addedMetadata.forEach((metadata) => {
            this.ux.log(chalk.green(`A\t${metadata}`));
        });
        modifiedMetadata.forEach((metadata) => {
            this.ux.log(chalk.yellow(`M\t${metadata}`));
        });
        this.ux.log(`${os.EOL}Source files differences detected. If intended, please update the snapshot file and run again.`);
        return { addedMetadata, removedMetadata, modifiedMetadata };
    }
}
CompareSourceSnapshot.description = messages.getMessage('commandDescription');
CompareSourceSnapshot.examples = messages.getMessage('examples').split(os.EOL);
CompareSourceSnapshot.flagsConfig = {
    filepath: flags.string({
        description: messages.getMessage('filepath'),
        default: './sfdx-source-snapshot.json',
    }),
};
CompareSourceSnapshot.requiresUsername = false;
CompareSourceSnapshot.supportsDevhubUsername = false;
CompareSourceSnapshot.requiresProject = true;
//# sourceMappingURL=compare.js.map