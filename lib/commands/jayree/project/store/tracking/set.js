/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import { Flags, SfCommand, requiredOrgFlagWithDeprecations, orgApiVersionFlagWithDeprecations, } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import ansis from 'ansis';
import { getCurrentStateFolderFilePath } from '../../../../../utils/stateFolderHandler.js';
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'trackingset');
export default class RevisionInfo extends SfCommand {
    static summary = messages.getMessage('summary');
    static examples = [
        `$ sfdx jayree:source:tracking:store:set
$ sfdx jayree:source:tracking:store:set -u me@my.org
$ sfdx jayree:source:tracking:store:set -u MyTestOrg1 -r 101`,
    ];
    static flags = {
        'target-org': requiredOrgFlagWithDeprecations,
        'api-version': orgApiVersionFlagWithDeprecations,
        revision: Flags.integer({
            char: 'r',
            summary: messages.getMessage('flags.revision.summary'),
        }),
    };
    static requiresProject = true;
    static deprecateAliases = true;
    static aliases = ['jayree:source:tracking:store:set'];
    async run() {
        const { flags } = await this.parse(RevisionInfo);
        const org = flags['target-org'];
        const conn = org.getConnection(flags['api-version']);
        const { records: [{ maxCounter, maxNum }], } = await conn.tooling.query('SELECT MAX(RevisionCounter) maxCounter,MAX(RevisionNum) maxNum from SourceMember');
        let maxRev = maxCounter >= maxNum ? maxCounter : maxNum;
        if (!maxRev) {
            maxRev = 0;
        }
        const storedmaxrevpath = getCurrentStateFolderFilePath(this.project?.getPath(), join('orgs', org.getOrgId(), 'jayreeStoredMaxRevision.json'));
        const newMaxRev = flags['revision'] >= 0 ? flags['revision'] : maxRev;
        await fs.ensureFile(storedmaxrevpath);
        await fs.writeJSON(storedmaxrevpath, { serverMaxRevisionCounter: newMaxRev });
        this.styledHeader(ansis.blue('Set stored SourceMember revision counter number'));
        this.table([
            {
                username: org.getUsername(),
                orgid: org.getOrgId(),
                serverMaxRevisionCounter: newMaxRev.toString(),
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
            revision: newMaxRev,
            username: org.getUsername(),
        };
    }
}
//# sourceMappingURL=set.js.map