import Model from "./Model";

class ModelList<T extends Model> extends Array<T> {
  private __model: typeof Model;
  private __count: number;

  constructor(model: typeof Model, list: Array<T>, count?: number) {
    super(...list);

    this.__model = model;
    this.__count = (count ?? list.length) || 0;

    Object.defineProperty(this, "__model", { enumerable: false });
    Object.defineProperty(this, "__count", { enumerable: false });
  }

  get model() {
    return this.__model;
  }

  get count() {
    return this.__count;
  }

  getIds() {
    return this.toArray().map((i) => i._id);
  }

  toArray() {
    return Array.from(this);
  }

  toJSON() {
    return {
      rows: this.toArray().map((r) => r.toJSON()),
      count: this.__count,
    };
  }
}

export default ModelList;
