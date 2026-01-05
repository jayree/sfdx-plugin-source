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
