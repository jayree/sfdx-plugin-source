/*
 * Copyright (c) 2021, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'node:path';
import Debug from 'debug';

const debug = Debug('jayree:state:folder');

export function getCurrentStateFolderFilePath(projectPath: string | undefined, file: string): string {
  const sfPath = path.join(projectPath as string, '.sf', file);
  debug('use sf state folder');
  return sfPath;
}
