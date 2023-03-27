import Model from "./Model";
import { JSONQuery } from "../types";

class PromiseModel<T extends Model> extends Promise<T> {
  __model: typeof Model;
  __query: string | JSONQuery;

  constructor(
    promiseParams: ConstructorParameters<typeof Promise<T>>,
    model: typeof Model,
    query: string | JSONQuery
  ) {
    if (!Array.isArray(promiseParams)) {
      // @ts-ignore
      return super(promiseParams);
    }

    super(...promiseParams);

    this.__model = model;
    this.__query = query;

    Object.defineProperty(this, "__model", { enumerable: false });
    Object.defineProperty(this, "__query", { enumerable: false });
  }

  get model() {
    return this.__model;
  }

  get query() {
    return this.__query;
  }
}

export default PromiseModel;
