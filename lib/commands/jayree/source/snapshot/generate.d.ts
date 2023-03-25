import { SfCommand } from '@salesforce/sf-plugins-core';
import { AnyJson } from '@salesforce/ts-types';
export default class GenerateSourceSnapshot extends SfCommand<AnyJson> {
    static readonly summary: string;
    static readonly flags: {
        filepath: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static readonly requiresProject = true;
    run(): Promise<AnyJson>;
}
