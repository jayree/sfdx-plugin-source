/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'node:path';
import { Hook, Config } from '@oclif/core';
import { env } from '@salesforce/kit';
import { SfProject } from '@salesforce/core';
import { ComponentStatus, FileResponseSuccess, ScopedPostRetrieve } from '@salesforce/source-deploy-retrieve';
import Debug from 'debug';
import { Command } from '@oclif/core';
import { Ux } from '@salesforce/sf-plugins-core';
import { logFixes, isOutputEnabled, getFixes, applyFixes, setDebug } from '../utils/souceUtils.js';

const ux = new Ux();

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPostRetrieve;
  config: Config;
};

interface FileResponseSuccessWithRequiredPath extends FileResponseSuccess {
  filePath: string;
}

export const scopedPostRetrieve: HookFunction = async function (options) {
  const dbgString = [this.config.bin, '@jayree/sfdx-plugin-source', 'hooks', 'scopedPostRetrieve'].join(':');
  const debug = Debug(dbgString);
  debug(`called by: ${options.Command.id}`);

  if (!options.result?.retrieveResult.response.status) {
    return;
  }

  const result = options.result.retrieveResult
    .getFileResponses()
    .reduce<FileResponseSuccessWithRequiredPath[]>((acc, el) => {
      if (typeof el.filePath === 'string' && el.state !== ComponentStatus.Failed) {
        acc.push({ ...el, filePath: el.filePath });
      }
      return acc;
    }, []);
  debug({ result });

  if (result.length === 0) {
    return;
  }

  setDebug(dbgString);

  const fixes = await getFixes([], true);

  // const profiles = result.filter((el) => el.type === 'Profile');
  // if (profiles.length > 0) {
  //   const customObjects = result.filter((el) => el.type === 'CustomObject');
  //   await updateProfiles(profiles, customObjects, 'project:retrieve:start' === options.Command.id);
  // }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.once('beforeExit', async () => {
    const inboundFiles: string[] = [];

    if (Object.keys(fixes).length) {
      const updatedfiles = await applyFixes(
        fixes,
        result.map((el) => el.filePath),
      );
      debug({ updatedfiles });

      const removed = Object.values(updatedfiles)
        .flat()
        .filter((value) => value.operation === 'deleteFile')
        .map((value) => value.filePath);
      debug({ removed });

      const moved: { [path: string]: string } = {};
      Object.values(updatedfiles)
        .flat()
        .filter((value) => value.operation === 'moveFile')
        .forEach((value) => {
          moved[value.filePath] = value.message;
        });
      debug({ moved });

      const projectPath = await SfProject.resolveProjectPath();

      result.forEach((element) => {
        if (!removed.includes(element.filePath)) {
          inboundFiles.push(
            path.relative(projectPath, moved[element.filePath] ? moved[element.filePath] : element.filePath),
          );
        }
      });
      debug({ inboundFiles });

      if (isOutputEnabled) {
        void logFixes(updatedfiles);
      } else if (env.getBoolean('SFDX_ENABLE_JAYREE_HOOKS_JSON_OUTPUT', false)) {
        ux.log(',');
        ux.styledJSON({
          fixedFiles: Object.values(updatedfiles)
            .filter((value) => value.length > 0)
            .reduce((acc, val) => acc.concat(val), []),
        });
      }
    }

    void this.config.runHook('prettierFormat', {
      ...options,
      result: inboundFiles.length ? inboundFiles : result.map((el) => el.filePath).filter(Boolean),
    });
  });
};
