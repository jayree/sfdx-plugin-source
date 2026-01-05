/*
 * Copyright 2026, jayree
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
/* istanbul ignore file */
import { join } from 'node:path';
import fs from 'fs-extra';
import { SfProject, SfError, Lifecycle } from '@salesforce/core';
import { FixConfig } from './types.js';

export type Config = {
  [index: string]: FixConfig | { [label: string]: FixConfig } | string[] | boolean;
  ensureUserPermissions: string[];
  ensureObjectPermissions: string[];
  applySourceFixes: string[];
  runHooks: boolean;
};

const CONFIG_DEFAULTS = {
  ensureUserPermissions: [],
  ensureObjectPermissions: [],
  applySourceFixes: [],
  runHooks: false,
};

const resolvedConfigs: Record<string, Config> = {};

export default async (path = SfProject.resolveProjectPathSync()): Promise<Config> => {
  if (path && resolvedConfigs[path]) {
    return resolvedConfigs[path];
  }

  const defaults = CONFIG_DEFAULTS;
  let configFromFile: Config;
  try {
    configFromFile = fs.readJsonSync(join(path, '.sfdx-jayree.json')) as Config;
    await Lifecycle.getInstance().emitWarning(
      'The ".sfdx-jayree.json" config has been deprecated. Use "sfdx-project.json" instead.',
    );
  } catch (err) {
    const error = err as SfError;
    if (error.code === 'ENOENT') {
      configFromFile = {} as Config;
    } else {
      throw error;
    }
  }

  const config = {
    ...configFromFile,
    ensureUserPermissions: configFromFile.ensureUserPermissions || defaults.ensureUserPermissions,
    ensureObjectPermissions: configFromFile.ensureObjectPermissions || defaults.ensureObjectPermissions,
    applySourceFixes: configFromFile.applySourceFixes || defaults.applySourceFixes,
    runHooks: configFromFile.runHooks || defaults.runHooks,
  };

  resolvedConfigs[path] = config;
  return config;
};
