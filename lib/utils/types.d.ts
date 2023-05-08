export type FixConfig = {
    [task: string]: {
        isactive: boolean;
        isActive: boolean;
        files?: {
            modify?: {
                [fileName: string]: {
                    delete?: string[];
                    insert?: Array<{
                        path: string;
                        object: object;
                        at: number;
                    }>;
                    set?: Array<{
                        path: string;
                        value: string;
                        object: object;
                    }>;
                };
            };
            move?: string[][];
            delete?: string[];
        };
    };
};
export type aggregatedFixResults = {
    [task: string]: fixResult[];
};
export type fixResult = {
    filePath: string;
    operation: string;
    message: string;
};
