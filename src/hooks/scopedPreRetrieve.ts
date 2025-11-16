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
  debug(`called by: ${options.Command.id as string}`);

  env.setBoolean('SFDX_DISABLE_PRETTIER', true);
  debug('set: SFDX_DISABLE_PRETTIER=true');
};
