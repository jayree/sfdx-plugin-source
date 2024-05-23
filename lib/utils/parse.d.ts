import { JsonMap } from '@salesforce/ts-types';
export declare function getParsedSourceComponents(uniquePackageDirectories: string[] | undefined, projectPath: string | undefined): Promise<{
    [key: string]: JsonMap;
}>;
