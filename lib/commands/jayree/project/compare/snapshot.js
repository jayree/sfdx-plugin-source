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
import os from 'node:os';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import { detailedDiff } from 'deep-object-diff';
import ansis from 'ansis';
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
        const results = await getParsedSourceComponents(this.project?.getUniquePackageDirectories().map((pDir) => pDir.fullPath), this.project?.getPath());
        const diff = detailedDiff(orig, results);
        const addedMetadata = Object.keys(diff.added).filter((k) => !(k in orig));
        const removedMetadata = Object.keys(diff.deleted).filter((k) => !(k in results));
        const modifiedMetadata = [
            ...Object.keys(diff.updated),
            ...Object.keys(diff.added).filter((k) => k in orig),
            ...Object.keys(diff.deleted).filter((k) => k in results),
        ].filter((value, index, self) => self.indexOf(value) === index);
        if (addedMetadata.length === 0 && removedMetadata.length === 0 && modifiedMetadata.length === 0) {
            this.log('No changes have been detected.');
            return {};
        }
        process.exitCode = 1;
        this.log(`The following source files have been modified: (${ansis.green('A')} added, ${ansis.red('D')} removed, ${ansis.yellow('M')} modified)${os.EOL}`);
        removedMetadata.forEach((metadata) => {
            this.log(ansis.red(`D\t${metadata}`));
        });
        addedMetadata.forEach((metadata) => {
            this.log(ansis.green(`A\t${metadata}`));
        });
        modifiedMetadata.forEach((metadata) => {
            this.log(ansis.yellow(`M\t${metadata}`));
        });
        this.log(`${os.EOL}Source files differences detected. If intended, please update the snapshot file and run again.`);
        return { addedMetadata, removedMetadata, modifiedMetadata };
    }
}
//# sourceMappingURL=snapshot.js.map