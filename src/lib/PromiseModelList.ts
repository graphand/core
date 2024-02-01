import Model from "@/lib/Model";
import ModelList from "@/lib/ModelList";
import { JSONQuery } from "@/types";
import Thenable from "@/lib/Thenable";

/**
 * PromiseModelList is a class that extends the native Promise class.
 * It is used to return a promise that resolves to a ModelList instance.
 */
class PromiseModelList<T extends typeof Model> extends Thenable<ModelList<T>> {
  #model: typeof Model;
  #query: JSONQuery;

  constructor(
    params: ConstructorParameters<typeof Promise<ModelList<T>>>,
    model: typeof Model,
    query: JSONQuery,
  ) {
    super(params);

    this.#model = model;
    this.#query = query;
  }

  get model() {
    return this.#model;
  }

  get query() {
    return this.#query;
  }

  getIds(): Array<string> {
    if (this.query?.ids) {
      return Array.isArray(this.query.ids) ? this.query.ids : [this.query.ids];
    }

    return [];
  }

  get [Symbol.toStringTag]() {
    return `PromiseModelList<${this.model.__name}>(${JSON.stringify(this.#query)})`;
  }

  *[Symbol.iterator]() {
    for (const id of this.getIds()) {
      yield this.model.get(id);
    }
  }
}

export default PromiseModelList;
