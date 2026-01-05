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
import path from 'node:path';
import { Hook } from '@oclif/core';
import { Ux, prompts, StandardColors } from '@salesforce/sf-plugins-core';
import { env } from '@salesforce/kit';
import fs from 'fs-extra';
import { SourceTracking } from '@salesforce/source-tracking';
import { SfProject, Org, ConfigAggregator } from '@salesforce/core';
import Debug from 'debug';
import { Optional } from '@salesforce/ts-types';
import { getCurrentStateFolderFilePath } from '../utils/stateFolderHandler.js';

const ux = new Ux();

async function getConnectionFromArgv(argv: string[]): Promise<{
  username: Optional<string>;
  instanceUrl: string;
}> {
  let aliasOrUsername: string | undefined = '';
  while (argv.length && aliasOrUsername?.length === 0) {
    const input = argv.shift();
    if (
      input?.startsWith('-u') ??
      input?.startsWith('--targetusername') ??
      input?.startsWith('-o') ??
      input?.startsWith('--target-org')
    ) {
      const i = input.indexOf('=');
      if (i !== -1) {
        aliasOrUsername = input.slice(i + 1, input.length);
      } else {
        aliasOrUsername = argv.shift();
      }
    }
  }

  if (aliasOrUsername?.length === 0) {
    try {
      const aggregator = await ConfigAggregator.create();
      aliasOrUsername = aggregator.getPropertyValue('target-org')?.toString();
    } catch {
      throw new Error(
        'This command requires a username to apply <mydomain> or <username>. Specify it with the -u (-o) parameter or with the "sfdx config:set defaultusername=<username>" command.',
      );
    }
  }

  const org = await Org.create({ aliasOrUsername });
  return { instanceUrl: org.getConnection().instanceUrl, username: org.getConnection().getUsername() };
}

export const prerun: Hook<'prerun'> = async function (options) {
  const debug = Debug([this.config.bin, '@jayree/sfdx-plugin-source', 'hooks', 'prerun'].join(':'));
  if (['force:source:pull', 'project:retrieve:start'].includes(options.Command.id)) {
    if (env.getBoolean('SFDX_ENABLE_JAYREE_HOOKS_RESET_BEFORE_PULL', false)) {
      let storedServerMaxRevisionCounter: number | undefined;
      let storedServerMaxRevisionCounterPath;
      const projectPath = await SfProject.resolveProjectPath();
      const project = SfProject.getInstance(projectPath);
      const userName = (await getConnectionFromArgv(options.argv)).username;
      const org = await Org.create({ aliasOrUsername: userName });
      try {
        storedServerMaxRevisionCounterPath = getCurrentStateFolderFilePath(
          projectPath,
          path.join('orgs', org.getOrgId(), 'jayreeStoredMaxRevision.json'),
        );

        try {
          const { serverMaxRevisionCounter } = (await fs.readJSON(storedServerMaxRevisionCounterPath)) as {
            serverMaxRevisionCounter: number;
          };
          storedServerMaxRevisionCounter = serverMaxRevisionCounter;
        } catch (error) {
          debug(error);
          storedServerMaxRevisionCounter = undefined;
        }

        if (storedServerMaxRevisionCounter !== undefined && storedServerMaxRevisionCounter >= 0) {
          try {
            const sourceTracking = await SourceTracking.create({ project, org });
            await Promise.all([
              sourceTracking.resetRemoteTracking(storedServerMaxRevisionCounter),
              sourceTracking.resetLocalTracking(),
            ]);

            ux.log(`Reset local tracking files to revision ${storedServerMaxRevisionCounter}.`);
          } catch (error) {
            debug(error);
          }
        } else {
          let localServerMaxRevisionCounter: number;
          try {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const { serverMaxRevisionCounter } = (await fs.readJSON(
              getCurrentStateFolderFilePath(
                projectPath,
                path.join('orgs', (await Org.create({ aliasOrUsername: userName })).getOrgId(), 'maxRevision.json'),
              ),
            )) as { serverMaxRevisionCounter: number };
            localServerMaxRevisionCounter = serverMaxRevisionCounter;
          } catch (error) {
            debug(error);
            localServerMaxRevisionCounter = 0;
          }
          const answer = await prompts.confirm({
            message: StandardColors.info(
              `WARNING: No stored revision found for scratch org with name: ${userName as string}.
  Store current local revision: ${localServerMaxRevisionCounter}? (y/n)`,
            ),
            ms: 30_000,
            defaultAnswer: false,
          });
          if (answer) {
            await fs.ensureFile(storedServerMaxRevisionCounterPath);
            await fs.writeJSON(storedServerMaxRevisionCounterPath, {
              serverMaxRevisionCounter: localServerMaxRevisionCounter,
            });
          }
        }
      } catch (error) {
        debug(error);
      }
    }
  }
};
