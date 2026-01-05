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
import { env } from '@salesforce/kit';
import { SfProject } from '@salesforce/core';
import { ComponentStatus } from '@salesforce/source-deploy-retrieve';
import Debug from 'debug';
import { Ux } from '@salesforce/sf-plugins-core';
import { logFixes, isOutputEnabled, getFixes, applyFixes, setDebug } from '../utils/souceUtils.js';
const ux = new Ux();
export const scopedPostRetrieve = async function (options) {
    const dbgString = [this.config.bin, '@jayree/sfdx-plugin-source', 'hooks', 'scopedPostRetrieve'].join(':');
    const debug = Debug(dbgString);
    debug(`called by: ${options.Command.id}`);
    if (!options.result?.retrieveResult.response.status) {
        return;
    }
    const result = options.result.retrieveResult
        .getFileResponses()
        .reduce((acc, el) => {
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
        const inboundFiles = [];
        if (Object.keys(fixes).length) {
            const updatedfiles = await applyFixes(fixes, result.map((el) => el.filePath));
            debug({ updatedfiles });
            const removed = Object.values(updatedfiles)
                .flat()
                .filter((value) => value.operation === 'deleteFile')
                .map((value) => value.filePath);
            debug({ removed });
            const moved = {};
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
                    inboundFiles.push(path.relative(projectPath, moved[element.filePath] ? moved[element.filePath] : element.filePath));
                }
            });
            debug({ inboundFiles });
            if (isOutputEnabled) {
                void logFixes(updatedfiles);
            }
            else if (env.getBoolean('SFDX_ENABLE_JAYREE_HOOKS_JSON_OUTPUT', false)) {
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
//# sourceMappingURL=scopedPostRetrieve.js.map