import { SfCommand } from '@salesforce/sf-plugins-core';
type CompareResponse = {
    addedMetadata?: string[];
    removedMetadata?: string[];
    modifiedMetadata?: string[];
};
export default class CompareSourceSnapshot extends SfCommand<CompareResponse> {
    static readonly summary: string;
    static readonly flags: {
        filepath: import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
    };
    static readonly requiresProject = true;
    static readonly deprecateAliases = true;
    static readonly aliases: string[];
    run(): Promise<CompareResponse>;
}
export {};
