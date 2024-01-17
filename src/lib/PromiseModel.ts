import Model from "@/lib/Model";
import { JSONQuery } from "@/types";
import Thenable from "@/lib/Thenable";
import { isObjectId } from "@/lib/utils";

/**
 * PromiseModel is a class that extends the native Promise class.
 * It is used to return a promise that resolves to a Model instance.
 */
class PromiseModel<T extends Model> extends Thenable<T> {
  #model: typeof Model;
  #query: string | JSONQuery;

  constructor(
    params: ConstructorParameters<typeof Promise<T>>,
    model: typeof Model,
    query: string | JSONQuery,
  ) {
    super(params);
    this.#model = model;
    this.#query = query;
  }

  get _id() {
    const query = this.query as any;

    if (isObjectId(query as any)) {
      return query;
    }

    if ("_id" in query && isObjectId(query._id)) {
      return query._id;
    }

    return null;
  }

  get model() {
    return this.#model;
  }

  get query() {
    return this.#query;
  }

  get [Symbol.toStringTag]() {
    return `PromiseModel<${this.model.__name}>(${this._id})`;
  }
}

export default PromiseModel;
