import ModelEnvScopes from "../enums/model-env-scopes";
import Field from "./Field";
import PromiseModel from "./PromiseModel";
import PromiseModelList from "./PromiseModelList";
import { fieldDecorator } from "./fieldDecorator";
import FieldTypes from "../enums/field-types";
import {
  AdapterFetcher,
  FieldDateDefinition,
  Hook,
  HookCallbackArgs,
  HookPhase,
  JSONQuery,
  Module,
  InputModelPayload,
} from "../types";
import SerializerFormat from "../enums/serializer-format";
import Adapter from "./Adapter";

class Model {
  static extendable: boolean = false;
  static slug: string;
  static scope: ModelEnvScopes;

  static __name: string;
  static __fields: Map<string, Field>;
  static __initPromise: Promise<void>;
  static __hooks: Set<Hook<any, any>>;
  static __adapter: Adapter;

  __doc: any;

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
    if (!doc._id) {
      doc._id = "";
    }

    this.setDoc(doc);

    Object.defineProperty(this, "__doc", { enumerable: false });
  }

  get model() {
    return this.constructor as typeof Model;
  }

  clone() {
    const clonedDoc = JSON.parse(JSON.stringify(this.__doc));
    return new this.model(clonedDoc);
  }

  static withAdapter<T extends typeof Model>(
    this: T,
    adapterClass: typeof Adapter,
    modules?: Array<Module>
  ): T {
    // @ts-ignore
    const modelWithAdapter = class extends this {};

    Object.defineProperty(modelWithAdapter, "name", { value: this.__name });

    modelWithAdapter.__adapter = new adapterClass(modelWithAdapter);

    modules?.forEach((module) => module(modelWithAdapter));

    return modelWithAdapter;
  }

  static async initialize() {
    const model = this;

    this.__initPromise ??= new Promise(async (resolve, reject) => {
      if (model.extendable) {
        try {
          if (!model.hasOwnProperty("__fields") || !model.__fields) {
            model.__fields = new Map();
          }

          const fields = await model.execute("getFields");
          fields.forEach((f) => {
            model.__fields.set(f.slug, Field.fromDefinition(f));
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
      if (model.hasOwnProperty("__fields")) {
        Array.from(model.__fields.keys()).forEach((key) => {
          fields.set(key, model.__fields.get(key));
        });
      }

      // @ts-ignore
      model = model.__proto__;
    } while (model);

    return fields;
  }

  static getRecursiveHooks<A extends keyof AdapterFetcher>(
    action: A,
    phase: HookPhase
  ): Array<Hook<any, A>> {
    let _hooks = [];

    let model = this;
    do {
      if (model.hasOwnProperty("__hooks")) {
        const _modelHooks = Array.from(model.__hooks || []).filter(
          (hook) => hook.action === action && hook.phase === phase
        );
        if (_modelHooks?.length) {
          _hooks = _hooks.concat(_modelHooks);
        }
      }

      // @ts-ignore
      model = model.__proto__;
    } while (model);

    return _hooks.sort((a, b) => a.order - b.order);
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
    if (!this.__adapter || !(this.__adapter instanceof Adapter)) {
      throw new Error("INVALID_ADAPTER");
    }
  }

  static getFromSlug(slug: string): typeof Model {
    const models = require("../index").models as {
      [name: string]: typeof Model;
    };
    const model = Object.values(models).find((m) => m.slug === slug);
    if (!model) {
      return null;
    }

    if (!this.__adapter) {
      return model;
    }

    const adapter = this.__adapter.constructor as typeof Adapter;
    return model.withAdapter(adapter);
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

    return field.serialize(this.__doc[slug], format, this);
  }

  /**
   * Model instance setter. Set value for the specified key
   * @param slug {string} - The key (field slug) to get
   * @param value {*}
   * @param upsert {boolean=} - Define if the setter will trigger a store upsert action
   */
  set<T extends Model, S extends keyof T | string>(
    this: T,
    slug: S,
    value: S extends keyof T ? T[S] | any : any,
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

    return this.execute("count", query);
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

            const i = await this.execute("get", query);
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

            const list = await this.execute("getList", query);
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

    return await this.execute("createOne", payload);
  }

  static async createMultiple<T extends typeof Model>(
    this: T,
    payload: Array<InputModelPayload<T>>
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();
    await this.initialize();

    return await this.execute("createMultiple", payload);
  }

  async update(update: any): Promise<this> {
    this.model.verifyAdapter();

    const res = await this.model.execute("updateOne", String(this._id), update);

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
      const updated = await this.execute("updateOne", query, update);
      return [updated];
    }

    return await this.execute("updateMultiple", query, update);
  }

  async delete(): Promise<this> {
    this.model.verifyAdapter();

    await this.model.execute("deleteOne", String(this._id));

    return this;
  }

  static async delete<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {}
  ): Promise<string[]> {
    this.verifyAdapter();
    await this.initialize();

    if (typeof query === "string") {
      const deleted = await this.execute("deleteOne", query);
      if (deleted) {
        return [query];
      }

      return [];
    }

    return await this.execute("deleteMultiple", query);
  }

  static hook<P extends HookPhase, A extends keyof AdapterFetcher>(
    phase: P,
    action: A,
    fn: Hook<P, A>["fn"],
    order: number = 0
  ) {
    if (!this.hasOwnProperty("__hooks") || !this.__hooks) {
      this.__hooks = new Set();
    }

    const hook: Hook<P, A> = { phase, action, fn, order };

    this.__hooks.add(hook);
  }

  static async execute<
    M extends typeof Model,
    A extends keyof AdapterFetcher<M>,
    Args extends Parameters<AdapterFetcher[A]>[0]
  >(
    this: M,
    action: A,
    ...args: Args
  ): Promise<ReturnType<AdapterFetcher<M>[A]>> {
    const adapter = this.__adapter;
    const fn = adapter.fetcher[action];
    const hooksBefore = this.getRecursiveHooks(action, "before");

    const ctx = { adapter, fn };

    const hookPayloadBefore: HookCallbackArgs<"before", A> = { args, ctx };

    const beforeErr = [];
    await hooksBefore.reduce(async (p, hook) => {
      await p;
      try {
        await hook.fn.call(this, hookPayloadBefore);
      } catch (err) {
        beforeErr.push(err);
      }
    }, Promise.resolve());

    if (beforeErr.length) {
      throw beforeErr;
    }

    let res;
    let err;

    try {
      res = await fn.apply(fn, [hookPayloadBefore.args, hookPayloadBefore.ctx]);
    } catch (e) {
      err = [e];
    }

    const hookPayloadAfter = { ...hookPayloadBefore, res, err };

    const hooksAfter = this.getRecursiveHooks(action, "after");
    await hooksAfter.reduce(async (p, hook) => {
      await p;
      try {
        await hook.fn.call(this, hookPayloadAfter);
      } catch (err) {
        hookPayloadAfter.err ??= [];
        hookPayloadAfter.err.push(err);
      }
    }, Promise.resolve());

    if (hookPayloadAfter.err?.length) {
      throw hookPayloadAfter.err;
    }

    return hookPayloadAfter.res as ReturnType<AdapterFetcher<M>[A]>;
  }
}

export default Model;
