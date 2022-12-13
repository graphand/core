import Model from "./Model";
import ModelList from "./ModelList";
import { ModelAdapterQuery } from "./ModelAdapter";

class PromiseModelList<T extends Model> extends Promise<ModelList<T>> {
  __model: typeof Model;
  __query: ModelAdapterQuery;

  constructor(
    promiseParams: ConstructorParameters<typeof Promise<ModelList<T>>>,
    model: typeof Model,
    query: ModelAdapterQuery
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

  getIds() {
    if (this.query?.ids) {
      return Array.isArray(this.query.ids) ? this.query.ids : [this.query.ids];
    }

    return [];
  }
}

export default PromiseModelList;
