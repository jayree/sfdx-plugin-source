/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Hook, Config } from '@oclif/core';
import { env } from '@salesforce/kit';
import Debug from 'debug';
import { ScopedPreRetrieve } from '@salesforce/source-deploy-retrieve';
import { Command } from '@oclif/core';

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPreRetrieve;
  config: Config;
};

// eslint-disable-next-line @typescript-eslint/require-await
export const scopedPreRetrieve: HookFunction = async function (options) {
  const debug = Debug([this.config.bin, '@jayree/sfdx-plugin-source', 'hooks', 'scopedPreRetrieve'].join(':'));
  debug(`called by: ${options.Command.id}`);

  env.setBoolean('SFDX_DISABLE_PRETTIER', true);
  debug('set: SFDX_DISABLE_PRETTIER=true');
};
