import { SfCommand } from '@salesforce/sf-plugins-core';
import { AnyJson } from '@salesforce/ts-types';
export default class ScratchOrgRevisionInfo extends SfCommand<AnyJson> {
    static readonly summary: string;
    static readonly examples: string[];
    static readonly flags: {
        'target-org': import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("@salesforce/core").Org, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static readonly requiresProject = true;
    run(): Promise<AnyJson>;
}
