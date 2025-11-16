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
import { join } from 'node:path';
import { SfCommand, convertToNewTableAPI, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import fs from 'fs-extra';
import ansis from 'ansis';
import { getCurrentStateFolderFilePath } from '../../../../../utils/stateFolderHandler.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'trackingget');

export default class RevisionInfo extends SfCommand<AnyJson> {
  public static readonly summary = messages.getMessage('summary');

  public static readonly examples = [
    `$ sfdx jayree:source:tracking:store:get
$ sfdx jayree:source:tracking:store:get -u me@my.org`,
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
  };

  public static readonly requiresProject = true;

  public static readonly deprecateAliases = true;
  public static readonly aliases = ['jayree:source:tracking:store:get'];

  public async run(): Promise<AnyJson> {
    const { flags } = await this.parse(RevisionInfo);
    const org = flags['target-org'];

    const { serverMaxRevisionCounter } = (await fs.readJSON(
      getCurrentStateFolderFilePath(
        this.project?.getPath(),
        join('orgs', org.getOrgId(), 'jayreeStoredMaxRevision.json'),
      ),
      { throws: false },
    )) as { serverMaxRevisionCounter: number };
    this.styledHeader(ansis.blue('Get stored SourceMember revision counter number'));
    this.table(
      convertToNewTableAPI(
        [
          {
            username: org.getUsername(),
            orgid: org.getOrgId(),
            serverMaxRevisionCounter: serverMaxRevisionCounter.toString(),
          },
        ],
        {
          Username: {
            header: 'Username',
            get: (row) => row.username,
          },
          OrgId: {
            header: 'OrgId',
            get: (row) => row.orgid,
          },
          RevisionCounter: {
            header: 'RevisionCounter',
            get: (row) => row.serverMaxRevisionCounter,
          },
        },
      ),
    );
    return {
      revision: serverMaxRevisionCounter,
      username: org.getUsername(),
    };
  }
}
