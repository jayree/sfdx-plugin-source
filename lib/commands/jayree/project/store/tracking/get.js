/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import chalk from 'chalk';
import { getCurrentStateFolderFilePath } from '../../../../../utils/stateFolderHandler.js';
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'trackingget');
export default class RevisionInfo extends SfCommand {
    static summary = messages.getMessage('summary');
    static examples = [
        `$ sfdx jayree:source:tracking:store:get
$ sfdx jayree:source:tracking:store:get -u me@my.org`,
    ];
    static flags = {
        'target-org': requiredOrgFlagWithDeprecations,
    };
    static requiresProject = true;
    static deprecateAliases = true;
    static aliases = ['jayree:source:tracking:store:get'];
    async run() {
        const { flags } = await this.parse(RevisionInfo);
        const org = flags['target-org'];
        const { serverMaxRevisionCounter } = (await fs.readJSON(await getCurrentStateFolderFilePath(this.project.getPath(), join('orgs', org.getOrgId(), 'jayreeStoredMaxRevision.json'), true), { throws: false }));
        this.styledHeader(chalk.blue('Get stored SourceMember revision counter number'));
        this.table([
            {
                username: org.getUsername(),
                orgid: org.getOrgId(),
                serverMaxRevisionCounter: serverMaxRevisionCounter.toString(),
            },
        ], {
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
        });
        return {
            revision: serverMaxRevisionCounter,
            username: org.getUsername(),
        };
    }
}
//# sourceMappingURL=get.js.map