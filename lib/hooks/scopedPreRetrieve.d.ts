import { Hook, Config } from '@oclif/core';
import { ScopedPreRetrieve } from '@salesforce/source-deploy-retrieve';
import { Command } from '@oclif/core';
type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;
type HookOptions = {
    Command: Command;
    argv: string[];
    commandId: string;
    result?: ScopedPreRetrieve;
    config: Config;
};
export declare const scopedPreRetrieve: HookFunction;
export {};
