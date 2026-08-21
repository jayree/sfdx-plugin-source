import { FixConfig } from './types.js';
export type Config = {
    [index: string]: FixConfig | {
        [label: string]: FixConfig;
    } | string[] | boolean;
    ensureUserPermissions: string[];
    ensureObjectPermissions: string[];
    applySourceFixes: string[];
    runHooks: boolean;
};
export default _default;
declare function _default(path?: string): Promise<Config>;
