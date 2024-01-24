import { JsonMap } from '@salesforce/ts-types';
export declare function getParsedSourceComponents(projectPath: string | undefined): Promise<{
    [key: string]: JsonMap;
}>;
