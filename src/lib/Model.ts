import ModelEnvScopes from "../enums/model-env-scopes";
import Field from "./Field";
import ModelAdapter, { ModelAdapterQuery } from "./ModelAdapter";
import { FieldIdDefinition } from "./fields/FieldId";
import PromiseModel from "./PromiseModel";
import PromiseModelList from "./PromiseModelList";
import { fieldDecorator } from "./fieldDecorator";
import { models } from "../index";
import { FieldRelationDefinition } from "./fields/FieldRelation";
import Account from "../models/Account";
import { FieldDateDefinition } from "./fields/FieldDate";

class Model {
  static extendable: boolean = false;
  static __name: string;
  static slug: string;
  static scope: ModelEnvScopes;
  static __fields: Map<string, Field>;
  static __initPromise: Promise<void>;
  static __adapter: ModelAdapter;

  private __doc: any;

  @fieldDecorator("Id")
  _id: FieldIdDefinition;

  @fieldDecorator("Date")
  createdAt: FieldDateDefinition;

  @fieldDecorator("Relation", { ref: "Account", multiple: false })
  createdBy: FieldRelationDefinition<{ model: Account; multiple: false }>;

  @fieldDecorator("Date")
  updatedAt: FieldDateDefinition;

  @fieldDecorator("Relation", { ref: "Account", multiple: false })
  updatedBy: FieldRelationDefinition<{ model: Account; multiple: false }>;

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

    this.__initPromise ??= new Promise(async (resolve) => {
      const schema = await model.getAdapter().loadSchema();
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

  static getFromScope(scope: string): typeof Model {
    return models[scope];
  }

  /**
   * Model instance getter. Returns the value for the specified key
   * @param slug {string} - The key (field slug) to get
   * @param raw {boolean=} - Default false. Get raw value
   */
  get(slug, raw = false) {
    const field = this.model.getRecursiveFields().get(slug) as Field<any>;
    if (!field) {
      return undefined;
    }

    let value = this.__doc[slug];

    if (!raw) {
      if (value === undefined && "default" in field.options) {
        value = field.options.default;
      }

      if (field.isSerialized(value)) {
        value = field.deserialize(value, this);
      }
    }

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

    if (!field.isSerialized(value)) {
      value = field.serialize(value, this);
    }

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

  toJSON() {
    const fields = this.model.getRecursiveFields();

    let json = {};

    for (let fieldKey of fields.keys()) {
      const field = fields.get(fieldKey);
      if (field) {
        let value = this.__doc[fieldKey];
        if (!field.isSerialized(value)) {
          value = field.serialize(value, this);
        }

        json[fieldKey] = value;
      }
    }

    return json;
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
    query: string | ModelAdapterQuery = {}
  ): Promise<number> {
    this.verifyAdapter();

    await this.initialize();

    return this.getAdapter().count(query);
  }

  static get<T extends typeof Model>(
    this: T,
    query: string | ModelAdapterQuery = {}
  ): PromiseModel<InstanceType<T> | null> {
    const model = this;
    model.verifyAdapter();

    return new PromiseModel(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            const i = await this.getAdapter().get(query);
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
    query: ModelAdapterQuery = {}
  ): PromiseModelList<InstanceType<T>> {
    const model = this;
    model.verifyAdapter();

    return new PromiseModelList<InstanceType<T>>(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            const list = await this.getAdapter().getList(query);
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

    return await this.getAdapter().createOne(payload);
  }

  static async createMultiple<T extends typeof Model>(
    this: T,
    payload: Array<InputModelPayload<T>>
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();
    await this.initialize();

    return await this.getAdapter().createMultiple(payload);
  }

  async update(update: any): Promise<this> {
    this.model.verifyAdapter();

    const res = await this.model.getAdapter().updateOne(this._id, update);

    this.setDoc(res.__doc);

    return this;
  }

  static async update<T extends typeof Model>(
    this: T,
    query: string | ModelAdapterQuery = {},
    update: any
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();
    await this.initialize();

    if (typeof query === "string") {
      const updated = await this.getAdapter().updateOne(query, update);
      return [updated];
    }

    return await this.getAdapter().updateMultiple(query, update);
  }

  async delete(): Promise<this> {
    this.model.verifyAdapter();

    await this.model.getAdapter().deleteOne(this._id);

    return this;
  }

  static async delete<T extends typeof Model>(
    this: T,
    query: string | ModelAdapterQuery = {}
  ): Promise<number> {
    this.verifyAdapter();
    await this.initialize();

    if (typeof query === "string") {
      const deleted = await this.getAdapter().deleteOne(query);
      if (deleted) {
        return 1;
      }

      return 0;
    }

    return await this.getAdapter().deleteMultiple(query);
  }
}

export type InputModelPayload<M extends typeof Model> = Omit<
  Partial<InstanceType<M>>,
  "_id"
>;

export default Model;
