import Model, { InputModelPayload } from "./Model";
import ModelList from "./ModelList";
import FieldTypes from "../enums/field-types";

export type SchemaType = {
  [slug: string]: {
    type: FieldTypes;
    configuration: any;
  };
};

export type ModelAdapterQuery = {
  filter?: any;
  populate?: any;
  sort?: any;
  socket?: string;
  count?: boolean;
  ids?: string[];
  limit?: number;
  skip?: number;
  page?: number;
  pageSize?: number;
};

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

  async count(query?: string | ModelAdapterQuery): Promise<number | null> {
    return null;
  }

  async get(query: string | ModelAdapterQuery = {}): Promise<InstanceType<T>> {
    return null;
  }

  async getList(
    query: ModelAdapterQuery = {}
  ): Promise<ModelList<InstanceType<T>>> {
    return null;
  }

  async createOne(payload: InputModelPayload<T>): Promise<InstanceType<T>> {
    return null;
  }

  async createMultiple(
    payload: Array<InputModelPayload<T>>
  ): Promise<Array<InstanceType<T>>> {
    return [];
  }

  async updateOne(
    query: string | ModelAdapterQuery = {},
    update: any
  ): Promise<InstanceType<T>> {
    return null;
  }

  async updateMultiple(
    query: ModelAdapterQuery = {},
    update: any
  ): Promise<Array<InstanceType<T>>> {
    return [];
  }

  async deleteOne(query: string | ModelAdapterQuery = {}): Promise<boolean> {
    return null;
  }

  async deleteMultiple(query: ModelAdapterQuery = {}): Promise<number> {
    return null;
  }

  async loadSchema(): Promise<SchemaType | null> {
    if (!this.model.extendable) {
      return null;
    }

    return null;
  }
}

export default ModelAdapter;
