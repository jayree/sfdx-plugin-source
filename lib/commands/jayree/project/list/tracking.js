/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import { Flags, SfCommand, requiredOrgFlagWithDeprecations, orgApiVersionFlagWithDeprecations, convertToNewTableAPI, } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import fs from 'fs-extra';
import ansis from 'ansis';
import { getCurrentStateFolderFilePath } from '../../../../utils/stateFolderHandler.js';
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@jayree/sfdx-plugin-source', 'trackinglist');
export default class SourceTrackingList extends SfCommand {
    static summary = messages.getMessage('summary');
    static examples = [
        `$ sfdx jayree:source:tracking:list
$ sfdx jayree:source:tracking:list -u me@my.org
$ sfdx jayree:source:tracking:list -u me@my.org -r 101`,
    ];
    static flags = {
        'target-org': requiredOrgFlagWithDeprecations,
        'api-version': orgApiVersionFlagWithDeprecations,
        revision: Flags.integer({
            char: 'r',
            summary: messages.getMessage('flags.revision.summary'),
            default: 0,
        }),
    };
    static requiresProject = true;
    static deprecateAliases = true;
    static aliases = ['jayree:source:tracking:list'];
    async run() {
        const { flags } = await this.parse(SourceTrackingList);
        const org = flags['target-org'];
        const conn = org.getConnection(flags['api-version']);
        const { records: [{ maxCounter, maxNum }], } = await conn.tooling.query('SELECT MAX(RevisionCounter) maxCounter,MAX(RevisionNum) maxNum from SourceMember');
        const maxRev = maxCounter >= maxNum ? maxCounter : maxNum;
        const maxrevpath = getCurrentStateFolderFilePath(this.project?.getPath(), join('orgs', org.getOrgId(), 'maxRevision.json'));
        let maxrevfile;
        try {
            const json = (await fs.readJSON(maxrevpath));
            if (Object.keys(json.sourceMembers).length > 0) {
                maxrevfile = Math.max(0, ...Object.keys(json.sourceMembers).map((key) => json.sourceMembers[key].lastRetrievedFromServer));
                if (maxrevfile === 0) {
                    maxrevfile = Math.min(...Object.keys(json.sourceMembers).map((key) => json.sourceMembers[key].serverRevisionCounter));
                    if (maxrevfile !== 0) {
                        maxrevfile = maxrevfile - 1;
                    }
                }
            }
            else {
                // support resetting local source tracking with sourceMembers={}
                maxrevfile = json.serverMaxRevisionCounter;
            }
        }
        catch {
            maxrevfile = 0;
        }
        let storedServerMaxRevisionCounter;
        try {
            const { serverMaxRevisionCounter } = (await fs.readJSON(getCurrentStateFolderFilePath(this.project?.getPath(), join('orgs', org.getOrgId(), 'jayreeStoredMaxRevision.json')), { throws: false }));
            storedServerMaxRevisionCounter = serverMaxRevisionCounter;
            // eslint-disable-next-line no-empty
        }
        catch { }
        const { records } = await conn.tooling.query(`SELECT RevisionCounter,RevisionNum,Id,MemberType,MemberName,IsNameObsolete from SourceMember where RevisionCounter >= ${flags.revision > 0 ? flags.revision : storedServerMaxRevisionCounter ? storedServerMaxRevisionCounter : 0}`);
        let sourceMemberResults = records.map((SourceMember) => {
            const RevisionCounter = SourceMember.RevisionCounter >= SourceMember.RevisionNum
                ? SourceMember.RevisionCounter
                : SourceMember.RevisionNum;
            return {
                ...SourceMember,
                RevisionCounter,
                RevisionCounterString: `${RevisionCounter}${RevisionCounter === maxRev ? ' [remote]' : ''}${RevisionCounter === maxrevfile ? ' [local]' : ''}${RevisionCounter === storedServerMaxRevisionCounter ? ' [stored]' : ''}`,
            };
        });
        if (!sourceMemberResults.find((SourceMember) => SourceMember.RevisionCounter === maxrevfile)) {
            sourceMemberResults.push({
                RevisionCounter: maxrevfile,
                RevisionCounterString: `${maxrevfile} [local]${maxrevfile === storedServerMaxRevisionCounter ? ' [stored]' : ''}`,
                RevisionNum: maxrevfile,
                Id: 'unknown',
                MemberType: 'unknown',
                IsNameObsolete: 'unknown',
                MemberName: 'unknown',
            });
        }
        if (storedServerMaxRevisionCounter) {
            if (!sourceMemberResults.find((SourceMember) => SourceMember.RevisionCounter === storedServerMaxRevisionCounter)) {
                sourceMemberResults.push({
                    RevisionCounter: storedServerMaxRevisionCounter,
                    RevisionCounterString: `${storedServerMaxRevisionCounter} [stored]`,
                    RevisionNum: storedServerMaxRevisionCounter,
                    Id: 'unknown',
                    MemberType: 'unknown',
                    IsNameObsolete: 'unknown',
                    MemberName: 'unknown',
                });
            }
        }
        sourceMemberResults = sourceMemberResults.sort((a, b) => {
            const x = a.RevisionCounter;
            const y = b.RevisionCounter;
            return x < y ? -1 : x > y ? 1 : 0;
        });
        this.styledHeader(ansis.blue(`SourceMember revision counter numbers list for: ${org.getUsername()}/${org.getOrgId()}`));
        this.table(convertToNewTableAPI(sourceMemberResults, {
            REVISIONCOUNTER: {
                header: 'REVISIONCOUNTER',
                get: (row) => row.RevisionCounterString,
            },
            ID: {
                header: 'ID',
                get: (row) => row.Id,
            },
            'FULL NAME': {
                header: 'FULL NAME',
                get: (row) => row.MemberName,
            },
            TYPE: {
                header: 'TYPE',
                get: (row) => row.MemberType,
            },
            OBSOLETE: {
                header: 'OBSOLETE',
                get: (row) => row.IsNameObsolete.toString(),
            },
        }));
        sourceMemberResults.forEach((sourceMember) => {
            delete sourceMember.RevisionNum;
            delete sourceMember.RevisionCounterString;
        });
        const maxRevision = {
            remote: maxRev,
            local: maxrevfile,
            stored: undefined,
        };
        if (storedServerMaxRevisionCounter) {
            maxRevision.stored = storedServerMaxRevisionCounter;
        }
        return {
            maxRevision,
            sourceMemberResults,
            username: org.getUsername(),
        };
    }
}
//# sourceMappingURL=tracking.js.map