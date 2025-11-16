import objectPath from 'object-path';
declare function compareobj<T extends object>(obj1: T | string, obj2: T | string): boolean;
type QueryParameters = {
    path: string;
    key?: string[];
    value?: string[] | string;
};
declare class ObjectPathResolver {
    private path;
    private object;
    private returnPathBefore;
    constructor(object: Record<string, unknown>);
    value(): string[];
    resolve({ path, key, value }: QueryParameters): this;
    resolveString(string: string): this;
    private findMatchingPath;
    private findIndexedPath;
    private findSinglePath;
}
export { ObjectPathResolver, objectPath, compareobj };
