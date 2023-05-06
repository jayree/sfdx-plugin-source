/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import fs from 'fs-extra';
import { getParsedSourceComponents } from '../../../../utils/parse.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'generate');

// eslint-disable-next-line sf-plugin/command-example
export default class GenerateSourceSnapshot extends SfCommand<AnyJson> {
  public static readonly summary = messages.getMessage('summary');

  public static readonly flags = {
    filepath: Flags.string({
      summary: messages.getMessage('flags.filepath.summary'),
      default: './sfdx-source-snapshot.json',
    }),
  };

  public static readonly requiresProject = true;

  public async run(): Promise<AnyJson> {
    const { flags } = await this.parse(GenerateSourceSnapshot);

    const results = await getParsedSourceComponents(this.project.getPath());

    await fs.writeJSON(flags.filepath, results, { spaces: 4 });
    this.log(`Generated snapshot file "${flags.filepath}"`);
    return results;
  }
}
