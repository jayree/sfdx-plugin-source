import { FlagsConfig } from '@salesforce/command';
import { JayreeSfdxCommand } from '../../../../jayreeSfdxCommand.js';
declare type CompareResponse = {
    addedMetadata?: string[];
    removedMetadata?: string[];
    modifiedMetadata?: string[];
};
export default class CompareSourceSnapshot extends JayreeSfdxCommand {
    static description: string;
    static examples: string[];
    protected static flagsConfig: FlagsConfig;
    protected static requiresUsername: boolean;
    protected static supportsDevhubUsername: boolean;
    protected static requiresProject: boolean;
    run(): Promise<CompareResponse>;
}
export {};
