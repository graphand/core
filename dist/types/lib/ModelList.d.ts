import { JSONQuery } from "../types";
import Model from "./Model";
/**
 * ModelList is a class that extends the native Array class.
 * It is used to return a list of instances.
 * It could be used as an array (list.map(), list.filter(), etc.). and also exposes some useful properties and methods.
 */
declare class ModelList<T extends Model> extends Array<T> {
    #private;
    constructor(model: typeof Model, list?: Array<T>, query?: JSONQuery, count?: number);
    /**
     * Returns the model class.
     */
    get model(): typeof Model;
    /**
     * Returns the query used to fetch the list (JSONQuery).
     */
    get query(): JSONQuery;
    /**
     * Returns the total count of the list.
     * If the count is not available, it returns the length of the list.
     */
    get count(): number;
    /**
     * Returns if the list is loading.
     * When created, the list is not loading. The loading state is set to true when the reload() method is called.
     */
    get loading(): boolean;
    /**
     * Returns the last updated item of the list.
     */
    get lastUpdated(): Model | undefined;
    /**
     * Reload the list from the given model and query.
     * Returns a promise that resolves when the list is reloaded.
     */
    reload(): Promise<void>;
    /**
     * Returns a native array with the items of the list.
     * This method is useful to break the reference to the list (list.filter() will return an instance of ModelList but list.toArray().filter() will return an array).
     */
    toArray(): any[];
    /**
     * Returns an array of ids of the items of the list.
     */
    getIds(): Array<string>;
    /**
     * Returns a JSON representation of the list.
     */
    toJSON(): {
        rows: any[];
        count: number;
    };
}
export default ModelList;
