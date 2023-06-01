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
declare const _default: (path?: string) => Promise<Config>;
export default _default;
