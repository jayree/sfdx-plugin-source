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
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import { getParsedSourceComponents } from '../../../../utils/parse.js';
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'generate');
// eslint-disable-next-line sf-plugin/command-example
export default class GenerateSourceSnapshot extends SfCommand {
    static summary = messages.getMessage('summary');
    static flags = {
        filepath: Flags.string({
            summary: messages.getMessage('flags.filepath.summary'),
            default: './sfdx-source-snapshot.json',
        }),
    };
    static requiresProject = true;
    static deprecateAliases = true;
    static aliases = ['jayree:source:snapshot:generate'];
    async run() {
        const { flags } = await this.parse(GenerateSourceSnapshot);
        const results = await getParsedSourceComponents(this.project?.getUniquePackageDirectories().map((pDir) => pDir.fullPath), this.project?.getPath());
        await fs.writeJSON(flags.filepath, results, { spaces: 4 });
        this.log(`Generated snapshot file "${flags.filepath}"`);
        return results;
    }
}
//# sourceMappingURL=snapshot.js.map