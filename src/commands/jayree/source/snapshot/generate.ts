/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import os from 'os';
import { flags, FlagsConfig } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import fs from 'fs-extra';
import { JayreeSfdxCommand } from '../../../../jayreeSfdxCommand.js';

Messages.importMessagesDirectory(new URL('./', import.meta.url).pathname);

const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'generate');

export default class GenerateSourceSnapshot extends JayreeSfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  protected static flagsConfig: FlagsConfig = {
    filepath: flags.string({
      description: messages.getMessage('filepath'),
      default: './sfdx-source-snapshot.json',
    }),
  };

  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const filePath = this.getFlag<string>('filepath');

    const results = await this.getParsedSourceComponents();

    await fs.writeJSON(filePath, results, { spaces: 4 });
    this.ux.log(`Generated snapshot file "${filePath}"`);
    return results;
  }
}
