import { JSONQuery } from "../types";
import Model from "./Model";

class ModelList<T extends Model> extends Array<T> {
  private __model: typeof Model;
  private __query: JSONQuery;
  private __count: number;
  private __reloadPromise: Promise<void>;

  constructor(
    model: typeof Model,
    list: Array<T> = [],
    query?: JSONQuery,
    count?: number
  ) {
    super(...list);

    this.__model = model;
    this.__query = query;
    this.__count = count ?? list.length;

    Object.defineProperty(this, "__model", { enumerable: false });
    Object.defineProperty(this, "__query", { enumerable: false });
    Object.defineProperty(this, "__count", { enumerable: false });
    Object.defineProperty(this, "__loading", { enumerable: false });
  }

  get model() {
    return this.__model;
  }

  get query() {
    return this.__query || {};
  }

  get count() {
    return this.__count || 0;
  }

  get loading() {
    return Boolean(this.__reloadPromise);
  }

  get reloadPromise() {
    return this.__reloadPromise || Promise.resolve();
  }

  // returns the last updated element in the list
  get lastUpdated(): Model | undefined {
    let _maxUpdated: Model | undefined;
    let _maxUpdatedTime: number | undefined;

    for (const i of this) {
      const _updatedTime = i._updatedAt?.getTime() ?? i._createdAt?.getTime();

      if (
        _maxUpdatedTime === undefined ||
        (_updatedTime !== undefined && _updatedTime > _maxUpdatedTime)
      ) {
        _maxUpdated = i;
        _maxUpdatedTime = _updatedTime;
      }
    }

    return _maxUpdated;
  }

  async reload() {
    const _this = this;

    this.__reloadPromise ??= new Promise<void>(async (resolve, reject) => {
      try {
        const { model, query } = _this;
        const list = (await model.getList(query)) as ModelList<T>;
        _this.splice(0, _this.length, ...list);
        _this.__count = list.count;
        resolve();
      } catch (e) {
        reject(e);
      }
    }).finally(() => {
      delete this.__reloadPromise;
    });

    return this.reloadPromise;
  }

  toArray() {
    const arr = [];
    for (const item of this) {
      arr.push(item);
    }
    return arr;
  }

  getIds(): Array<string> {
    const ids = [];
    for (const item of this) {
      ids.push(item._id);
    }
    return ids;
  }

  toJSON() {
    return {
      rows: this.toArray().map((r) => r.toJSON()),
      count: this.__count,
    };
  }
}

export default ModelList;
