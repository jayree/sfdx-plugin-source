/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import {
  Flags,
  SfCommand,
  requiredOrgFlagWithDeprecations,
  orgApiVersionFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import fs from 'fs-extra';
import chalk from 'chalk';
import { getCurrentStateFolderFilePath } from '../../../../../utils/stateFolderHandler.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'trackingset');

export default class RevisionInfo extends SfCommand<AnyJson> {
  public static readonly summary = messages.getMessage('summary');

  public static readonly examples = [
    `$ sfdx jayree:source:tracking:store:set
$ sfdx jayree:source:tracking:store:set -u me@my.org
$ sfdx jayree:source:tracking:store:set -u MyTestOrg1 -r 101`,
  ];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    revision: Flags.integer({
      char: 'r',
      summary: messages.getMessage('flags.revision.summary'),
    }),
  };

  public static readonly requiresProject = true;

  public static readonly deprecateAliases = true;
  public static readonly aliases = ['jayree:source:tracking:store:set'];

  public async run(): Promise<AnyJson> {
    const { flags } = await this.parse(RevisionInfo);
    const org = flags['target-org'];
    const conn = org.getConnection(flags['api-version']);

    const {
      records: [{ maxCounter, maxNum }],
    } = await conn.tooling.query<{ maxCounter: number; maxNum: number }>(
      'SELECT MAX(RevisionCounter) maxCounter,MAX(RevisionNum) maxNum from SourceMember',
    );

    let maxRev = maxCounter >= maxNum ? maxCounter : maxNum;

    if (!maxRev) {
      maxRev = 0;
    }

    const storedmaxrevpath = await getCurrentStateFolderFilePath(
      this.project?.getPath(),
      join('orgs', org.getOrgId(), 'jayreeStoredMaxRevision.json'),
      true,
    );

    const newMaxRev: number = (flags['revision'] as number) >= 0 ? (flags['revision'] as number) : maxRev;

    await fs.ensureFile(storedmaxrevpath);
    await fs.writeJSON(storedmaxrevpath, { serverMaxRevisionCounter: newMaxRev });

    this.styledHeader(chalk.blue('Set stored SourceMember revision counter number'));
    this.table(
      [
        {
          username: org.getUsername(),
          orgid: org.getOrgId(),
          serverMaxRevisionCounter: newMaxRev.toString(),
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
    );

    return {
      revision: newMaxRev,
      username: org.getUsername(),
    };
  }
}
