/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* istanbul ignore file */
import { join } from 'path';
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
      'The ".sfdx-jayree.json" config has been deprecated. Use "sfdx-project.json" instead.'
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
