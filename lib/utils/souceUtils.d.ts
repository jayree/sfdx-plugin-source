import { FileResponse } from '@salesforce/source-deploy-retrieve';
import { FixConfig, aggregatedFixResults } from './types.js';
export declare const isOutputEnabled: boolean;
export declare function setDebug(dbgString: string): void;
export declare function getProjectPath(): Promise<string | undefined>;
export declare function profileElementInjection(profiles: string[], customObjectsFilter?: string[]): Promise<void>;
export declare function logFixes(updatedfiles: aggregatedFixResults): Promise<void>;
export declare function getFixes(tags: string[], onlyActive: boolean): Promise<FixConfig>;
export declare function applyFixes(fixes: FixConfig, filter?: string[]): Promise<aggregatedFixResults>;
export declare function updateProfiles(profiles: FileResponse[], customObjects: FileResponse[], forceSourcePull: boolean): Promise<void>;
