import { SfdxCommand } from '@salesforce/command';
import { JsonMap } from '@salesforce/ts-types';
export declare abstract class JayreeSfdxCommand extends SfdxCommand {
    protected getFlag<T>(flagName: string, defaultVal?: unknown): T;
    protected getParsedSourceComponents(): Promise<{
        [key: string]: JsonMap;
    }>;
}
