import Model from "./Model";
import ModelList from "./ModelList";
import { JSONQuery } from "../types";
import Thenable from "./Thenable";
/**
 * PromiseModelList is a class that extends the native Promise class.
 * It is used to return a promise that resolves to a ModelList instance.
 */
declare class PromiseModelList<T extends Model> extends Thenable<ModelList<T>> {
    #private;
    constructor(params: ConstructorParameters<typeof Promise<ModelList<T>>>, model: typeof Model, query: JSONQuery);
    get model(): typeof Model;
    get query(): JSONQuery;
    getIds(): string[];
    get [Symbol.toStringTag](): string;
}
export default PromiseModelList;
