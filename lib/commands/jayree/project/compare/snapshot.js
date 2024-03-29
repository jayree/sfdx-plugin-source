/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'node:os';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import { detailedDiff } from 'deep-object-diff';
import chalk from 'chalk';
import { getParsedSourceComponents } from '../../../../utils/parse.js';
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'compare');
// eslint-disable-next-line sf-plugin/command-example
export default class CompareSourceSnapshot extends SfCommand {
    static summary = messages.getMessage('summary');
    static flags = {
        filepath: Flags.string({
            summary: messages.getMessage('flags.filepath.summary'),
            default: './sfdx-source-snapshot.json',
        }),
    };
    static requiresProject = true;
    static deprecateAliases = true;
    static aliases = ['jayree:source:snapshot:compare'];
    // eslint-disable-next-line @typescript-eslint/require-await
    async run() {
        const { flags } = await this.parse(CompareSourceSnapshot);
        const orig = (await fs.readJSON(flags.filepath));
        const results = await getParsedSourceComponents(this.project?.getPath());
        const diff = detailedDiff(orig, results);
        const addedMetadata = Object.keys(diff.added);
        const removedMetadata = Object.keys(diff.deleted);
        const modifiedMetadata = Object.keys(diff.updated);
        if (addedMetadata.length === 0 && removedMetadata.length === 0 && modifiedMetadata.length === 0) {
            this.log('No changes have been detected.');
            return {};
        }
        process.exitCode = 1;
        this.log(`The following source files have been modified: (${chalk.green('A')} added, ${chalk.red('D')} removed, ${chalk.yellow('M')} modified)${os.EOL}`);
        removedMetadata.forEach((metadata) => {
            this.log(chalk.red(`D\t${metadata}`));
        });
        addedMetadata.forEach((metadata) => {
            this.log(chalk.green(`A\t${metadata}`));
        });
        modifiedMetadata.forEach((metadata) => {
            this.log(chalk.yellow(`M\t${metadata}`));
        });
        this.log(`${os.EOL}Source files differences detected. If intended, please update the snapshot file and run again.`);
        return { addedMetadata, removedMetadata, modifiedMetadata };
    }
}
//# sourceMappingURL=snapshot.js.map