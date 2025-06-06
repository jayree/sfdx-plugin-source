/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { SfProject } from '@salesforce/core';
import kit from '@salesforce/kit';
import { convertToNewTableAPI, Ux } from '@salesforce/sf-plugins-core';
import { globby } from 'globby';
import { Org, ConfigAggregator, OrgConfigProperties } from '@salesforce/core';
import ansis from 'ansis';
import { ComponentSet, MetadataResolver, NodeFSTreeContainer, RegistryAccess, } from '@salesforce/source-deploy-retrieve';
import Debug from 'debug';
import { JsToXml } from '@salesforce/source-deploy-retrieve/lib/src/convert/streams.js';
import config from './config.js';
import { objectPath, ObjectPathResolver, compareobj } from './object-path.js';
const ux = new Ux();
const traverse = {
    /**
     * Searches a file path in an ascending manner (until reaching the filesystem root) for the first occurrence a
     * specific file name.  Resolves with the directory path containing the located file, or `null` if the file was
     * not found.
     *
     * @param dir The directory path in which to start the upward search.
     * @param file The file name to look for.
     */
    forFile: async (dir, file) => {
        let foundProjectDir;
        try {
            fs.statSync(path.join(dir, file));
            foundProjectDir = dir;
        }
        catch (err) {
            if (err && err.code === 'ENOENT') {
                const nextDir = path.resolve(dir, '..');
                if (nextDir !== dir) {
                    // stop at root
                    foundProjectDir = await traverse.forFile(nextDir, file);
                }
            }
        }
        return foundProjectDir;
    },
};
export const isOutputEnabled = !(process.argv.find((arg) => arg === '--json') ?? kit.env.getString('SFDX_CONTENT_TYPE', '').toUpperCase() === 'JSON');
let debug;
let argvConnection;
let resolver;
let projectPath = '';
export function setDebug(dbgString) {
    debug = Debug([dbgString, 'utils'].join(':'));
}
async function resolve(fpath) {
    resolver = new MetadataResolver(new RegistryAccess(), new NodeFSTreeContainer());
    const [c] = resolver.getComponentsFromPath(fpath);
    return c.parseXml();
}
function write(fpath, data) {
    const readableStream = new JsToXml(data);
    const writeStream = fs.createWriteStream(fpath);
    readableStream.pipe(writeStream);
}
export async function getProjectPath() {
    if (projectPath.length > 0) {
        return projectPath;
    }
    projectPath = (await SfProject.resolveProjectPath()).split(path.sep).join(path.posix.sep);
    return projectPath;
}
export async function profileElementInjection(profiles, customObjectsFilter = []) {
    const ensureUserPermissions = (await config(await getProjectPath())).ensureUserPermissions;
    let ensureObjectPermissions = (await config(await getProjectPath())).ensureObjectPermissions;
    if (customObjectsFilter.length) {
        ensureObjectPermissions = ensureObjectPermissions.filter((el) => customObjectsFilter.includes(el));
    }
    if (ensureObjectPermissions.length === 0) {
        process.once('exit', () => {
            ux.warn('no ensureObjectPermissions list configured');
        });
    }
    for await (const file of profiles) {
        if (await fs.pathExists(file)) {
            const data = (await resolve(file));
            if (data.Profile.custom === 'true') {
                const objectPermissions = kit.ensureArray(data.Profile.objectPermissions);
                const injectedObjectPermission = [];
                ensureObjectPermissions.forEach((object) => {
                    if (objectPermissions && !objectPermissions.some((e) => compareobj(e.object, object))) {
                        injectedObjectPermission.push({
                            allowCreate: ['false'],
                            allowDelete: ['false'],
                            allowEdit: ['false'],
                            allowRead: ['false'],
                            modifyAllRecords: ['false'],
                            object: [object],
                            viewAllRecords: ['false'],
                        });
                    }
                });
                data.Profile.objectPermissions = objectPermissions.concat(injectedObjectPermission);
                const userPermissions = kit.ensureArray(data.Profile.userPermissions);
                const injectedUserPermission = [];
                ensureUserPermissions.forEach((name) => {
                    if (userPermissions && !userPermissions.some((e) => compareobj(e.name, name))) {
                        injectedUserPermission.push({ enabled: ['false'], name: [name] });
                    }
                });
                data.Profile.userPermissions = userPermissions.concat(injectedUserPermission);
                if (data.Profile.objectPermissions) {
                    data.Profile.objectPermissions.sort((a, b) => (a.object > b.object ? 1 : -1));
                }
                if (data.Profile.userPermissions) {
                    data.Profile.userPermissions.sort((a, b) => (a.name > b.name ? 1 : -1));
                }
                data.Profile = Object.keys(data.Profile)
                    .sort()
                    .reduce((acc, key) => {
                    acc[key] = data.Profile[key];
                    return acc;
                }, {
                    custom: '',
                    objectPermissions: [],
                    userPermissions: [],
                });
                write(file, data);
                debug({
                    profile: file,
                    injectedObjectPermission: JSON.stringify(injectedObjectPermission),
                    injectedUserPermission: JSON.stringify(injectedUserPermission),
                });
            }
        }
    }
}
export async function logFixes(updatedfiles) {
    if (isOutputEnabled) {
        const root = (await getProjectPath());
        Object.keys(updatedfiles).forEach((task) => {
            if (updatedfiles[task].length) {
                ux.styledHeader(ansis.blue(`Fixed Source: ${task}`));
                ux.table(convertToNewTableAPI(updatedfiles[task], {
                    filePath: {
                        header: 'FILEPATH',
                        get: (row) => path.relative(root, row.filePath),
                    },
                    operation: {
                        header: 'OPERATION',
                    },
                    message: {
                        header: 'MESSAGE',
                    },
                }));
            }
        });
    }
}
async function getGlobbyBaseDirectory(globbypath) {
    try {
        (await fs.lstat(globbypath)).isDirectory();
        return globbypath;
    }
    catch (error) {
        return getGlobbyBaseDirectory(path.dirname(globbypath));
    }
}
async function sourcemove(movesources, root, filter) {
    const array = [];
    if (movesources) {
        for await (const filepath of movesources) {
            let files = await globby(path.posix.join(root.split(path.sep).join(path.posix.sep), filepath[0]));
            if (filter.length > 0) {
                files = files.filter((el) => filter.map((f) => f.split(path.sep).join(path.posix.sep)).includes(el));
            }
            const from = await getGlobbyBaseDirectory(filepath[0]);
            for await (const file of files) {
                if (await fs.pathExists(file)) {
                    const destinationFile = path.join(filepath[1], path.relative(from, file));
                    debug(`move file: ${file} to ${destinationFile}`);
                    await fs.ensureDir(path.dirname(destinationFile));
                    await fs.rename(file, destinationFile);
                    array.push({ filePath: file, operation: 'moveFile', message: destinationFile });
                }
                else {
                    debug(`${file} not found`);
                }
            }
        }
    }
    return array;
}
async function sourcedelete(deletesources, root, filter) {
    const array = [];
    if (deletesources) {
        for await (const filepath of deletesources) {
            let files = await globby(path.posix.join(root.split(path.sep).join(path.posix.sep), filepath));
            if (filter.length > 0) {
                files = files.filter((el) => filter.map((f) => f.split(path.sep).join(path.posix.sep)).includes(el));
            }
            for await (const file of files) {
                if (await fs.pathExists(file)) {
                    debug(`delete file: ${file}`);
                    await fs.remove(file);
                    array.push({ filePath: file, operation: 'deleteFile', message: '' });
                }
                else {
                    debug(`${file} not found`);
                }
            }
        }
    }
    return array;
}
async function getConnectionFromArgv() {
    if (argvConnection)
        return argvConnection;
    const argv = [...process.argv];
    let aliasOrUsername = '';
    while (argv.length && aliasOrUsername.length === 0) {
        const input = argv.shift();
        if (input.startsWith('-u') ||
            input.startsWith('--targetusername') ||
            input.startsWith('-o') ||
            input.startsWith('--target-org')) {
            const i = input.indexOf('=');
            if (i !== -1) {
                aliasOrUsername = input.slice(i + 1, input.length);
            }
            else {
                aliasOrUsername = argv.shift();
            }
        }
    }
    aliasOrUsername =
        aliasOrUsername || (await ConfigAggregator.create()).getInfo(OrgConfigProperties.TARGET_ORG).value;
    if (aliasOrUsername) {
        const org = await Org.create({ aliasOrUsername });
        argvConnection = org.getConnection();
        return argvConnection;
    }
}
function fnDelete(fndelete, file, data) {
    const array = [];
    for (const deltask of fndelete) {
        const deltaskpaths = new ObjectPathResolver(data).resolveString(deltask).value();
        for (const deltaskpath of deltaskpaths.reverse()) {
            if (typeof deltaskpath !== 'undefined') {
                debug(`delete: ${deltaskpath}`);
                objectPath.del(data, deltaskpath);
                write(file, data);
                array.push({
                    filePath: file,
                    operation: 'delete',
                    message: deltask,
                });
            }
            else {
                debug(`delete: '${deltask} not found`);
            }
        }
    }
    return array;
}
function fnInsert(fninsert, file, data) {
    const array = [];
    for (const inserttask of fninsert) {
        if (inserttask.object) {
            const inserttaskpaths = new ObjectPathResolver(data).resolveString(inserttask.path).value();
            if (inserttaskpaths.length > 0) {
                let match = '';
                for (const inserttaskpath of inserttaskpaths) {
                    if (typeof inserttaskpath !== 'undefined') {
                        if (JSON.stringify(objectPath.get(data, inserttaskpath)).includes(JSON.stringify(inserttask.object).replace('{', '').replace('}', ''))) {
                            match = inserttaskpath;
                        }
                    }
                }
                if (!match) {
                    const lastItem = inserttaskpaths.pop();
                    const index = lastItem?.split('.').pop();
                    let inserttaskpath;
                    if (lastItem) {
                        if (Number(index)) {
                            inserttaskpath = lastItem.split('.').slice(0, -1).join('.');
                            debug(`insert: ${JSON.stringify(inserttask.object)} at ${inserttaskpath}`);
                            objectPath.insert(data, inserttaskpath, inserttask.object, inserttask.at);
                        }
                        else {
                            inserttaskpath = lastItem;
                            debug(`insert: ${JSON.stringify(inserttask.object)} at ${inserttaskpath}`);
                            Object.keys(inserttask.object).forEach((key) => {
                                objectPath.set(data, `${inserttaskpath}.${String(key)}`, inserttask.object[key]);
                            });
                        }
                        write(file, data);
                        array.push({
                            filePath: file,
                            operation: 'insert',
                            message: `${JSON.stringify(inserttask.object)} at ${inserttaskpath}`,
                        });
                    }
                }
                else {
                    debug(`insert: Object ${JSON.stringify(inserttask.object)} found at ${match}`);
                }
            }
        }
    }
    return array;
}
async function updateValue(value) {
    if (value) {
        if (JSON.stringify(value).includes('<mydomain>')) {
            value = JSON.parse(JSON.stringify(value).replace(/<mydomain>/i, (await getConnectionFromArgv())?.instanceUrl.substring(8).split('.')[0] ?? 'no connection'));
        }
        if (JSON.stringify(value).includes('<instance>')) {
            value = JSON.parse(JSON.stringify(value).replace(/<instance>/i, (await getConnectionFromArgv())?.instanceUrl.substring(8).split('.')[1] ?? 'no connection'));
        }
        if (JSON.stringify(value).includes('<username>')) {
            value = JSON.parse(JSON.stringify(value).replace(/<username>/i, (await getConnectionFromArgv())?.getUsername()));
        }
    }
    return value;
}
async function updateObject(object) {
    if (object) {
        const validate = async (node) => {
            const replaceArray = [];
            const recursive = (n, attpath) => {
                // eslint-disable-next-line guard-for-in
                for (const attributename in n) {
                    if (attpath.length === 0) {
                        attpath = attributename;
                    }
                    else {
                        attpath = attpath + '.' + attributename;
                    }
                    if (typeof n[attributename] === 'object') {
                        recursive(n[attributename], attpath);
                    }
                    else if (n[attributename] === '<username>') {
                        replaceArray.push([n[attributename], attpath]);
                    }
                }
            };
            recursive(node, '');
            for await (const element of replaceArray) {
                if (element[0] === '<username>') {
                    objectPath.set(node, element[1], (await getConnectionFromArgv())?.getUsername());
                }
            }
            return node;
        };
        object = await validate(object);
    }
    return object;
}
async function fnSet(fnset, file, data) {
    const array = [];
    for await (const settask of fnset) {
        const settaskpaths = kit.ensureArray(new ObjectPathResolver(data).resolveString(settask.path).value());
        for await (const settaskpath of settaskpaths) {
            if (typeof settaskpath !== 'undefined') {
                settask.value = await updateValue(settask.value);
                if (settask.value && !compareobj(objectPath.get(data, settaskpath), settask.value)) {
                    debug(`Set: ${JSON.stringify(settask.value)} at ${settaskpath}`);
                    objectPath.set(data, settaskpath, `${settask.value}`);
                    write(file, data);
                    array.push({
                        filePath: file,
                        operation: 'set',
                        message: `${settask.path} => ${JSON.stringify(settask.value)}`,
                    });
                }
                else {
                    debug(`Set: value ${JSON.stringify(settask.value)} found at ${settaskpath}`);
                }
                settask.object = await updateObject(settask.object);
                if (settask.object && !compareobj(settask.object, objectPath.get(data, settaskpath))) {
                    debug(`set: ${JSON.stringify(settask.object)} at ${settaskpath}`);
                    let modifiedPath = '';
                    Object.keys(settask.object).forEach((k) => {
                        debug(`${settaskpath}.${String(k)}`);
                        if (objectPath.has(data, `${settaskpath}.${String(k)}`)) {
                            debug(settask.object[k]);
                            if (!compareobj(objectPath.get(data, `${settaskpath}.${k}`), settask.object[k])) {
                                modifiedPath = settaskpath;
                                objectPath.set(data, `${settaskpath}.${String(k)}`, settask.object[k]);
                                debug({ modifiedPath });
                            }
                            debug(objectPath.get(data, settaskpath));
                        }
                    });
                    if (modifiedPath) {
                        write(file, data);
                        array.push({
                            filePath: file,
                            operation: 'set',
                            message: `${modifiedPath} ==> ${JSON.stringify(settask.object)}`,
                        });
                    }
                }
                else {
                    debug(`Set: value ${JSON.stringify(settask.object)} found at ${settaskpath}`);
                }
            }
        }
    }
    return array;
}
async function sourcefix(fixsources, root, filter) {
    let array = [];
    if (fixsources) {
        for await (const filename of Object.keys(fixsources)) {
            let files = await globby(path.posix.join(root.split(path.sep).join(path.posix.sep), filename));
            if (filter.length > 0) {
                files = files.filter((el) => filter.map((f) => f.split(path.sep).join(path.posix.sep)).includes(el));
            }
            const fn = fixsources[filename];
            for await (const file of files) {
                if (await fs.pathExists(file)) {
                    const data = await resolve(file);
                    debug(`modify file: ${file}`);
                    if (fn.delete) {
                        array = array.concat(fnDelete(fn.delete, file, data));
                    }
                    if (fn.set) {
                        array = array.concat(await fnSet(fn.set, file, data));
                    }
                    if (fn.insert) {
                        array = array.concat(fnInsert(fn.insert, file, data));
                    }
                }
                else {
                    debug(`modify file: ${file} not found`);
                }
            }
        }
    }
    return array;
}
async function readFixesFromProject(projectDir) {
    const proj = await SfProject.resolve(projectDir);
    const projJson = (await proj.resolveProjectConfig());
    return (projJson.plugins?.['jayree/sfdx-plugin-project']?.fixes ??
        projJson.plugins?.['jayree/sfdx-plugin-source']?.fixes ??
        {});
}
export async function getFixes(tags, onlyActive) {
    const configPath = (await traverse.forFile(process.cwd(), '.sfdx-jayree.json'));
    if (!configPath) {
        const allTasks = await readFixesFromProject(await getProjectPath());
        return Object.fromEntries(Object.entries(allTasks).filter(([taskName, taskConfig]) => (tags.includes(taskName) || !tags.length) && (!onlyActive || taskConfig.isActive)));
    }
    else {
        const fixesWithoutLabel = {};
        const cfg = await config(configPath);
        if (Boolean(cfg.runHooks) && !kit.env.getBoolean('SFDX_DISABLE_JAYREE_HOOKS', false)) {
            if (onlyActive) {
                tags = cfg.applySourceFixes;
            }
            for await (const tag of tags) {
                debug({ tag });
                const fixesWithLabel = cfg[tag];
                if (fixesWithLabel) {
                    for (const [label, tasks] of Object.entries(fixesWithLabel)) {
                        for (const [taskName, taskConfig] of Object.entries(tasks)) {
                            if (taskConfig.isactive) {
                                const key = `${label}/${taskName}`;
                                fixesWithoutLabel[key] = taskConfig;
                            }
                        }
                    }
                }
            }
        }
        return fixesWithoutLabel;
    }
}
export async function applyFixes(fixes, filter = []) {
    const root = (await getProjectPath());
    const updatedfiles = {};
    for await (const task of Object.keys(fixes)) {
        if (!Array.isArray(updatedfiles[task])) {
            updatedfiles[task] = [];
        }
        updatedfiles[task] = updatedfiles[task].concat(await sourcedelete(fixes[task].files?.delete, root, filter));
    }
    for await (const task of Object.keys(fixes)) {
        updatedfiles[task] = updatedfiles[task].concat(await sourcemove(fixes[task].files?.move, root, filter));
    }
    for await (const task of Object.keys(fixes)) {
        updatedfiles[task] = updatedfiles[task].concat(await sourcefix(fixes[task].files?.modify, root, filter));
    }
    return updatedfiles;
}
export async function updateProfiles(profiles, customObjects, forceSourcePull) {
    if (forceSourcePull) {
        debug('force:source:pull detected');
        const targetDir = process.env.SFDX_MDAPI_TEMP_DIR ?? os.tmpdir();
        const destRoot = path.join(targetDir, 'reRetrieveProfiles');
        debug({ destRoot });
        const ComponentSetArray = [
            { fullName: '*', type: 'ApexClass' },
            { fullName: '*', type: 'ApexPage' },
            { fullName: '*', type: 'Community' },
            { fullName: '*', type: 'CustomApplication' },
            { fullName: '*', type: 'CustomObject' },
            { fullName: '*', type: 'CustomPermission' },
            { fullName: '*', type: 'CustomTab' },
            { fullName: '*', type: 'DataCategoryGroup' },
            { fullName: '*', type: 'ExternalDataSource' },
            { fullName: '*', type: 'Flow' },
            { fullName: '*', type: 'Layout' },
            { fullName: '*', type: 'NamedCredential' },
            { fullName: '*', type: 'Profile' },
            { fullName: '*', type: 'ProfilePasswordPolicy' },
            { fullName: '*', type: 'ProfileSessionSetting' },
            { fullName: '*', type: 'ServicePresenceStatus' },
        ];
        (await config(await getProjectPath())).ensureObjectPermissions.forEach((fullName) => {
            ComponentSetArray.push({ fullName, type: 'CustomObject' });
        });
        const componentSet = new ComponentSet(ComponentSetArray);
        const mdapiRetrieve = await componentSet.retrieve({
            usernameOrConnection: (await getConnectionFromArgv())?.getUsername(),
            merge: true,
            output: destRoot,
        });
        const retrieveResult = await mdapiRetrieve.pollStatus();
        customObjects = retrieveResult.getFileResponses().filter((el) => el.type === 'CustomObject');
        for await (const retrieveProfile of retrieveResult
            .getFileResponses()
            .filter((component) => component.type === 'Profile')) {
            const index = profiles.findIndex((profile) => profile.fullName === retrieveProfile.fullName);
            if (index >= 0) {
                await fs.rename(retrieveProfile.filePath, profiles[index].filePath);
            }
        }
        await fs.remove(destRoot);
    }
    let customObjectsFilter = [];
    if (customObjects.length) {
        customObjectsFilter = customObjects.map((el) => el.fullName).filter(Boolean);
    }
    debug({ profiles, customObjectsFilter });
    await profileElementInjection(profiles.map((profile) => profile.filePath).filter(Boolean), customObjectsFilter);
}
//# sourceMappingURL=souceUtils.js.map