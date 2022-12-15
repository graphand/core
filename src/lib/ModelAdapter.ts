import Model from "./Model";
import { ModelAdapterFetcher, ModelAdapterSerializer } from "../types";

class ModelAdapter<T extends typeof Model = typeof Model> {
  private __model: T;

  initWithModel(model: T) {
    if (this.__model) {
      throw new Error("ADAPTER_ALREADY_INIT");
    }

    this.__model = model;
  }

  toConstructor(): typeof ModelAdapter {
    return Object.getPrototypeOf(this).constructor as typeof ModelAdapter;
  }

  get model(): T {
    return this.__model;
  }

  fetcher: ModelAdapterFetcher<T>;

  serializer: ModelAdapterSerializer<T>;
}

export default ModelAdapter;
