import { SfCommand } from '@salesforce/sf-plugins-core';
import { AnyJson } from '@salesforce/ts-types';
export default class SourceTrackingList extends SfCommand<AnyJson> {
    static readonly summary: string;
    static readonly description: string;
    static readonly examples: string[];
    static readonly flags: {
        'target-org': import("@oclif/core/lib/interfaces/parser.js").OptionFlag<import("@salesforce/core").Org, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        'api-version': import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        revision: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    static readonly requiresProject = true;
    run(): Promise<AnyJson>;
}
