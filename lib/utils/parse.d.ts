import { JsonMap } from '@salesforce/ts-types';
export declare function getParsedSourceComponents(projectPath: string): Promise<{
    [key: string]: JsonMap;
}>;
