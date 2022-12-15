import ModelEnvScopes from "../enums/model-env-scopes";
import Field from "./Field";
import ModelAdapter from "./ModelAdapter";
import PromiseModel from "./PromiseModel";
import PromiseModelList from "./PromiseModelList";
import { fieldDecorator } from "./fieldDecorator";
import { models } from "../index";
import FieldTypes from "../enums/field-types";
import { FieldDateDefinition, InputModelPayload, JSONQuery } from "../types";
import SerializerFormat from "../enums/serializer-format";
import field from "./Field";

class Model {
  static extendable: boolean = false;
  static __name: string;
  static slug: string;
  static scope: ModelEnvScopes;
  static __fields: Map<string, Field>;
  static __initPromise: Promise<void>;
  static __adapter: ModelAdapter;

  private __doc: any;

  @fieldDecorator(FieldTypes.ID)
  _id;

  @fieldDecorator(FieldTypes.DATE)
  createdAt: FieldDateDefinition;

  @fieldDecorator(FieldTypes.RELATION, { ref: "accounts", multiple: false })
  createdBy;

  @fieldDecorator(FieldTypes.DATE)
  updatedAt: FieldDateDefinition;

  @fieldDecorator(FieldTypes.RELATION, { ref: "accounts", multiple: false })
  updatedBy;

  constructor(doc: any = {}) {
    this.setDoc(doc);

    Object.defineProperty(this, "__doc", { enumerable: false });
  }

  get model() {
    return this.constructor as typeof Model;
  }

  static getAdapter<T extends typeof Model>(this: T): ModelAdapter<T> {
    return this.__adapter as ModelAdapter<T>;
  }

  static withAdapter<T extends typeof Model>(
    this: T,
    adapter: typeof ModelAdapter<any>
  ): T {
    const model = this;
    const adapterInstance = new adapter();

    // @ts-ignore
    const modelWithAdapter = class extends model {
      static __adapter = adapterInstance;
    };

    adapterInstance.initWithModel(modelWithAdapter);

    Object.defineProperty(modelWithAdapter, "name", { value: model.__name });

    return modelWithAdapter;
  }

  static async initialize() {
    const model = this;

    this.__initPromise ??= new Promise(async (resolve, reject) => {
      if (model.extendable) {
        try {
          const fields = await model.getAdapter().fetcher.getFields();
          fields.forEach((f) => {
            this.__fields.set(f.slug, new Field(f.type, f.options));
          });
        } catch (e) {
          reject(e);
        }
      }

      resolve();
    });

    await this.__initPromise;
  }

  static getRecursiveFields(): Map<string, Field> {
    let fields = new Map<string, Field>();

    let model = this;
    do {
      if (model.__fields) {
        Array.from(model.__fields.keys()).forEach((key) => {
          fields.set(key, model.__fields.get(key));
        });
      }

      // @ts-ignore
      model = model.__proto__;
    } while (model);

    return fields;
  }

  defineFieldsProperties() {
    const fields = this.model.getRecursiveFields();

    const properties = Array.from(fields.keys()).reduce((f: any, slug) => {
      f[slug] = {
        enumerable: true,
        configurable: true,
        get: function () {
          return this.get(slug);
        },
        set(v) {
          return this.set(slug, v);
        },
      };

      return f;
    }, {});

    Object.defineProperties(this, properties);
  }

  setDoc(doc: any) {
    this.__doc = doc;
  }

  static verifyAdapter() {
    if (!this.__adapter || !(this.__adapter instanceof ModelAdapter)) {
      throw new Error("INVALID_MODEL_ADAPTER");
    }
  }

  static getFromSlug(slug: string): typeof Model {
    return Object.values(models).find((m) => m.slug === slug);
  }

  /**
   * Model instance getter. Returns the value for the specified key
   * @param slug {string} - The key (field slug) to get
   * @param format {json|object|document} - Serializer format
   */
  get(slug, format = SerializerFormat.OBJECT) {
    const field = this.model.getRecursiveFields().get(slug) as Field<any>;
    if (!field) {
      return undefined;
    }

    let value = this.__doc[slug];

    if (value === undefined && "default" in field.options) {
      value = field.options.default;
    }

    value = field.serialize(value, format, this);

    return value;
  }

  /**
   * Model instance setter. Set value for the specified key
   * @param slug {string} - The key (field slug) to get
   * @param value {*}
   * @param upsert {boolean=} - Define if the setter will trigger a store upsert action
   */
  set<T extends Model, S extends keyof T>(
    this: T,
    slug: S,
    value: T[S],
    upsert?: boolean
  ) {
    const field = this.model.getRecursiveFields().get(String(slug));

    if (!field) {
      return;
    }

    value = field.serialize(value, SerializerFormat.DOCUMENT, this);

    upsert ??= ![
      "_id",
      "createdAt",
      "createdBy",
      "updatedAt",
      "updatedBy",
    ].includes(String(slug));

    this.__doc[slug] = value;

    return this;
  }

  toPromise() {
    const i = this;
    return new PromiseModel([(resolve) => resolve(i)], this.model, this._id);
  }

  to(format: SerializerFormat) {
    const fields = this.model.getRecursiveFields();

    let obj = {};

    for (let fieldKey of fields.keys()) {
      obj[fieldKey] = this.get(fieldKey, format);
    }

    return obj;
  }

  toJSON() {
    return this.to(SerializerFormat.JSON);
  }

  toObject() {
    return this.to(SerializerFormat.OBJECT);
  }

  toString() {
    return JSON.stringify(this.__doc);
  }

  static fromString<T extends typeof Model>(this: T, str: string) {
    const model = this;
    const i = new model();
    const fields = i.model.getRecursiveFields();
    const parsed = JSON.parse(str);

    Array.from(fields.keys()).forEach((key) => {
      i.set(key as any, parsed[key]);
    });

    return i;
  }

  static async count<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {}
  ): Promise<number> {
    this.verifyAdapter();

    await this.initialize();

    return this.getAdapter().fetcher.count(query);
  }

  static get<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {}
  ): PromiseModel<InstanceType<T>> {
    const model = this;
    model.verifyAdapter();

    return new PromiseModel(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            const i = await this.getAdapter().fetcher.get(query);
            resolve(i);
          } catch (e) {
            reject(e);
          }
        },
      ],
      this,
      query
    );
  }

  static getList<T extends typeof Model>(
    this: T,
    query: JSONQuery = {}
  ): PromiseModelList<InstanceType<T>> {
    const model = this;
    model.verifyAdapter();

    return new PromiseModelList<InstanceType<T>>(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            const list = await this.getAdapter().fetcher.getList(query);
            resolve(list);
          } catch (e) {
            reject(e);
          }
        },
      ],
      this,
      query
    );
  }

  static async create<T extends typeof Model>(
    this: T,
    payload: InputModelPayload<T>
  ): Promise<InstanceType<T>> {
    this.verifyAdapter();
    await this.initialize();

    return await this.getAdapter().fetcher.createOne(payload);
  }

  static async createMultiple<T extends typeof Model>(
    this: T,
    payload: Array<InputModelPayload<T>>
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();
    await this.initialize();

    return await this.getAdapter().fetcher.createMultiple(payload);
  }

  async update(update: any): Promise<this> {
    this.model.verifyAdapter();

    const res = await this.model
      .getAdapter()
      .fetcher.updateOne(this._id, update);

    this.setDoc(res.__doc);

    return this;
  }

  static async update<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    update: any
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();
    await this.initialize();

    if (typeof query === "string") {
      const updated = await this.getAdapter().fetcher.updateOne(query, update);
      return [updated];
    }

    return await this.getAdapter().fetcher.updateMultiple(query, update);
  }

  async delete(): Promise<this> {
    this.model.verifyAdapter();

    await this.model.getAdapter().fetcher.deleteOne(this._id);

    return this;
  }

  static async delete<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {}
  ): Promise<string[]> {
    this.verifyAdapter();
    await this.initialize();

    if (typeof query === "string") {
      const deleted = await this.getAdapter().fetcher.deleteOne(query);
      if (deleted) {
        return [query];
      }

      return [];
    }

    return await this.getAdapter().fetcher.deleteMultiple(query);
  }
}

export default Model;
