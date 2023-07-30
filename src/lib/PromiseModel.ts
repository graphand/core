import Model from "./Model";
import { JSONQuery } from "../types";
import Thenable from "./Thenable";
import { isObjectId } from "./utils";

class PromiseModel<T extends Model> extends Thenable<T> {
  __model: typeof Model;
  __query: string | JSONQuery;

  constructor(
    params: ConstructorParameters<typeof Promise<T>>,
    model: typeof Model,
    query: string | JSONQuery
  ) {
    super(params);
    this.__model = model;
    this.__query = query;

    Object.defineProperty(this, "__model", { enumerable: false });
    Object.defineProperty(this, "__query", { enumerable: false });
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
    return this.__model;
  }

  get query() {
    return this.__query;
  }

  get [Symbol.toStringTag]() {
    return `PromiseModel<${this.model.__name}>(${this._id})`;
  }
}

export default PromiseModel;
