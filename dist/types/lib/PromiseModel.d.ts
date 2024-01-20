import Model from "./Model";
import { JSONQuery } from "../types";
import Thenable from "./Thenable";
/**
 * PromiseModel is a class that extends the native Promise class.
 * It is used to return a promise that resolves to a Model instance.
 */
declare class PromiseModel<T extends Model> extends Thenable<T> {
    #private;
    constructor(params: ConstructorParameters<typeof Promise<T>>, model: typeof Model, query: string | JSONQuery);
    get _id(): any;
    get model(): typeof Model;
    get query(): string | JSONQuery;
    get [Symbol.toStringTag](): string;
}
export default PromiseModel;
