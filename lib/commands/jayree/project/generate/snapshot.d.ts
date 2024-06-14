import { SfCommand } from '@salesforce/sf-plugins-core';
import { AnyJson } from '@salesforce/ts-types';
export default class GenerateSourceSnapshot extends SfCommand<AnyJson> {
    static readonly summary: string;
    static readonly flags: {
        filepath: import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
    };
    static readonly requiresProject = true;
    static readonly deprecateAliases = true;
    static readonly aliases: string[];
    run(): Promise<AnyJson>;
}
