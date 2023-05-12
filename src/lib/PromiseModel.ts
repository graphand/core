import Model from "./Model";
import { JSONQuery } from "../types";
import Thenable from "./Thenable";

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
    if (typeof this.__query === "string") {
      return this.__query;
    }

    if ("_id" in this.__query && typeof this.__query._id === "string") {
      return this.__query._id;
    }

    return null;
  }

  get model() {
    return this.__model;
  }

  get query() {
    return this.__query;
  }
}

export default PromiseModel;
