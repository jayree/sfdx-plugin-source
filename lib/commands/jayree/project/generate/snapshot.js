/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
        const results = await getParsedSourceComponents(this.project?.getPath());
        await fs.writeJSON(flags.filepath, results, { spaces: 4 });
        this.log(`Generated snapshot file "${flags.filepath}"`);
        return results;
    }
}
//# sourceMappingURL=snapshot.js.map