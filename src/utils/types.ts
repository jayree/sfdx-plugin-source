/*
 * Copyright (c) 2022, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export type FixConfig = {
  [task: string]: {
    isactive: boolean;
    isActive: boolean;
    files?: {
      modify?: {
        [fileName: string]: {
          delete?: string[];
          insert?: Array<{ path: string; object: object; at: number }>;
          set?: Array<{ path: string; value: string; object: object }>;
        };
      };
      move?: string[][];
      delete?: string[];
    };
  };
};

export type aggregatedFixResults = {
  [task: string]: fixResult[];
};

export type fixResult = { filePath: string; operation: string; message: string };
