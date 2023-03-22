import ModelEnvScopes from "../enums/model-env-scopes";
import Field from "./Field";
import PromiseModel from "./PromiseModel";
import PromiseModelList from "./PromiseModelList";
import { fieldDecorator } from "./fieldDecorator";
import FieldTypes from "../enums/field-types";
import {
  AdapterFetcher,
  DocumentDefinition,
  FieldsDefinition,
  Hook,
  HookCallbackArgs,
  HookPhase,
  InputModelPayload,
  JSONQuery,
  Module,
  ValidatorsDefinition,
} from "../types";
import SerializerFormat from "../enums/serializer-format";
import Adapter from "./Adapter";
import Validator from "./Validator";
import {
  createFieldFromDefinition,
  createValidatorFromDefinition,
  getFieldFromPath,
  getRecursiveFieldsFromModel,
  getRecursiveHooksFromModel,
  getRecursiveValidatorsFromModel,
  getValueFromPath,
  setValueOnPath,
  validateDocs,
} from "./utils";
import CoreError from "./CoreError";
import ErrorCodes from "../enums/error-codes";

class Model {
  static extendable: boolean = false;
  static slug: string;
  static scope: ModelEnvScopes;
  static fields: FieldsDefinition;
  static validators: ValidatorsDefinition;
  static configKey?: string;

  static __name: string = "Model";
  static __hooks: Set<Hook<any, any, any>>;
  static __initPromise: Promise<void>;
  static __adapter: Adapter;
  static __fieldsMap: Map<string, Field>;
  static __validatorsArray: Array<Validator>;
  static __fieldsKeys: string[];
  static __fieldsProperties: any;
  static __baseClass: typeof Model;

  __doc: DocumentDefinition;

  @fieldDecorator(FieldTypes.ID)
  _id: FieldDefinitionId;

  @fieldDecorator(FieldTypes.DATE)
  _createdAt: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.IDENTITY)
  _createdBy;

  @fieldDecorator(FieldTypes.DATE)
  _updatedAt: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.IDENTITY)
  _updatedBy;

  constructor(doc: any = {}) {
    doc._id ??= Date.now();
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

  static getBaseClass() {
    if (!this.hasAdapter()) {
      return this;
    }

    return this.__baseClass ?? this;
  }

  static hasAdapter() {
    return Boolean(this.__adapter);
  }

  static withAdapter<T extends typeof Model>(
    this: T,
    adapterClass: typeof Adapter,
    modules?: Array<Module>
  ): T {
    const baseClass = this.getBaseClass();

    // @ts-ignore
    const modelWithAdapter = class extends this {
      static __baseClass = baseClass;
    };

    Object.defineProperty(modelWithAdapter, "name", { value: this.__name });

    modelWithAdapter.__adapter = new adapterClass(modelWithAdapter);

    modules?.forEach((module) => module(modelWithAdapter));

    return modelWithAdapter;
  }

  static async initialize(force: boolean = false, ctx?: ExecutorCtx) {
    const model = this;

    if (force) {
      this.__initPromise = undefined;
    }

    this.__initPromise ??= new Promise(async (resolve, reject) => {
      try {
        const hooksBefore = getRecursiveHooksFromModel(
          this,
          "initialize",
          "before"
        );

        await hooksBefore.reduce(async (p, hook) => {
          await p;
          await hook.fn.call(this, { ctx });
        }, Promise.resolve());

        if (model.extendable) {
          await model.reloadModel(ctx);
        }

        const hooksAfter = getRecursiveHooksFromModel(
          this,
          "initialize",
          "after"
        );

        await hooksAfter.reduce(async (p, hook) => {
          await p;
          await hook.fn.call(this, { ctx });
        }, Promise.resolve());
      } catch (e) {
        reject(e);
      }

      resolve();
    });

    await this.__initPromise;
  }

  static async reloadModel(ctx?: ExecutorCtx) {
    if (!this.extendable) {
      return;
    }

    if (!this.__adapter) {
      throw new CoreError({
        code: ErrorCodes.INVALID_MODEL_ADAPTER,
        message: `model ${this.slug} is initialized without adapter`,
      });
    }

    let modelFields = getRecursiveFieldsFromModel(this);
    let modelValidators = getRecursiveValidatorsFromModel(this);

    const modelDefinition = await this.execute(
      "getModelDefinition",
      undefined as never,
      ctx
    );

    this.configKey = modelDefinition?.configKey ?? this.configKey;

    const fields = modelDefinition?.fields || {};
    modelFields = { ...modelFields, ...fields };

    const validators = modelDefinition?.validators || [];
    modelValidators = [...modelValidators, ...validators];

    const fieldsEntries: Array<[string, Field]> = Object.entries(
      modelFields
    ).map(([slug, def]) => {
      return [slug, createFieldFromDefinition(def, this.__adapter)];
    });

    const validatorsArray: Array<Validator> = modelValidators.map((def) => {
      return createValidatorFromDefinition(def, this.__adapter);
    });

    this.__fieldsMap = new Map(fieldsEntries);
    this.__validatorsArray = validatorsArray;

    delete this.__fieldsProperties;
    delete this.__fieldsKeys;
  }

  static get fieldsMap() {
    if (!this.__fieldsMap) {
      let modelFields = getRecursiveFieldsFromModel(this);

      const fieldsEntries: Array<[string, Field]> = Object.entries(
        modelFields
      ).map(([slug, def]) => {
        return [slug, createFieldFromDefinition(def, this.__adapter)];
      });

      this.__fieldsMap = new Map(fieldsEntries);
    }

    return this.__fieldsMap;
  }

  static get validatorsArray() {
    if (!this.__validatorsArray) {
      let modelValidators = getRecursiveValidatorsFromModel(this);

      this.__validatorsArray = modelValidators.map((def) =>
        createValidatorFromDefinition(def, this.__adapter)
      );
    }

    return this.__validatorsArray;
  }

  static get fieldsKeys() {
    if (!this.__fieldsKeys) {
      this.__fieldsKeys = Array.from(this.fieldsMap.keys());
    }

    return this.__fieldsKeys;
  }

  defineFieldsProperties() {
    if (!this.model.__fieldsProperties) {
      const propEntries = this.model.fieldsKeys.map((slug) => {
        return [
          slug,
          {
            enumerable: true,
            configurable: true,
            get: function () {
              return this.get(slug);
            },
            set(v) {
              if (v === undefined) {
                console.warn(
                  "cannot set undefined value with = operator. Please use .set method instead"
                );
                return;
              }

              return this.set(slug, v);
            },
          },
        ];
      });

      this.model.__fieldsProperties = Object.fromEntries(propEntries);
    }

    Object.defineProperties(this, this.model.__fieldsProperties);
  }

  setDoc(doc: any) {
    this.__doc = doc;
  }

  static verifyAdapter() {
    if (!this.__adapter) {
      throw new CoreError({
        code: ErrorCodes.INVALID_ADAPTER,
        message: `model ${this.slug} has invalid adapter`,
      });
    }
  }

  static getFromSlug<M extends typeof Model = typeof Model>(
    slug: string,
    adapter?: typeof Adapter,
    fallbackData: boolean = true
  ): M {
    if (!adapter) {
      adapter = this.__adapter?.constructor as typeof Adapter;
    }

    if (adapter) {
      adapter.__modelsMap ??= new Map();
    }

    const models = require("../index").models as Record<string, typeof Model>;
    let model: M = Object.values(models).find((m) => m.slug === slug) as M;
    if (model) {
      let adaptedModel = adapter?.__modelsMap.get(model.slug) as M;
      if (!adaptedModel && adapter) {
        adaptedModel = model.withAdapter(adapter);
        adapter.__modelsMap.set(model.slug, adaptedModel);
      }

      model = adaptedModel || model;
    } else if (fallbackData) {
      const Data = require("./Data").default;
      model = Data.__getFromSlug(slug, adapter);
    }

    return model;
  }

  static getAdaptedModel<M extends typeof Model = typeof Model>(
    model: M,
    adapter?: typeof Adapter,
    override?: boolean
  ): M {
    if (!adapter) {
      adapter = this.__adapter?.constructor as typeof Adapter;
    }

    if (!adapter) {
      throw new CoreError({
        message: "Adapter is required in getAdaptedModel method",
      });
    }

    adapter.__modelsMap ??= new Map();

    let adaptedModel: M;

    if (!override) {
      adaptedModel = adapter?.__modelsMap.get(model.slug) as M;
    }

    if (!adaptedModel) {
      adaptedModel = model.withAdapter(adapter);
      adapter.__modelsMap.set(model.slug, adaptedModel);
    }

    return adaptedModel;
  }

  /**
   * Model instance getter. Returns the value for the specified key
   * @param path {string} - The path to the field get
   * @param format {json|object|document} - Serializer format
   * @param ctx {ExecutorCtx} - Executor context
   */
  get(path: string, format = SerializerFormat.OBJECT, ctx: ExecutorCtx = {}) {
    const field = getFieldFromPath(this.model, path);
    if (!field) {
      return undefined;
    }

    let value = getValueFromPath(this.__doc, path);

    if (value === undefined && "default" in field.options) {
      value = field.options.default as typeof value;
    }

    if (value !== undefined && value !== null) {
      value = field.serialize(value, format, this, path, ctx);
    }

    return value;
  }

  /**
   * Model instance setter. Set value for the specified key
   * @param path {string} - The path to the field get
   * @param value {*}
   */
  set<T extends Model, S extends keyof T | string>(
    this: T,
    path: S,
    value: S extends keyof T ? T[S] | any : any,
    ctx: ExecutorCtx = {}
  ) {
    const _path = String(path);
    const field = getFieldFromPath(this.model, _path);
    if (!field) {
      return;
    }

    if (value === undefined && "default" in field.options) {
      value = field.options.default as typeof value;
    }

    if (value !== undefined && value !== null) {
      value = field.serialize(
        value,
        SerializerFormat.DOCUMENT,
        this,
        _path,
        ctx
      );
    }

    setValueOnPath(this.__doc, String(path), value);

    return this;
  }

  to(format: SerializerFormat) {
    this.defineFieldsProperties();

    const entries = this.model.fieldsKeys.map((slug) => {
      return [slug, this.get(slug, format)];
    });

    return Object.fromEntries(entries);
  }

  toJSON() {
    return this.to(SerializerFormat.JSON);
  }

  toObject() {
    return this.to(SerializerFormat.OBJECT);
  }

  toDocument() {
    return this.to(SerializerFormat.DOCUMENT);
  }

  toString() {
    return JSON.stringify(this.__doc);
  }

  static fromString<T extends typeof Model>(
    this: T,
    str: string,
    cleanPayload = true
  ) {
    const model = this;
    const parsed = JSON.parse(str);
    let payload = parsed;

    if (cleanPayload) {
      const payloadEntries = this.fieldsKeys.map((slug) => {
        return [slug, parsed[slug]];
      });

      payload = Object.fromEntries(payloadEntries);
    }

    return new model(payload);
  }

  static async count<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: ExecutorCtx
  ): Promise<number> {
    this.verifyAdapter();

    await this.initialize();

    return this.execute("count", [query], ctx);
  }

  static get<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: ExecutorCtx
  ): PromiseModel<InstanceType<T>> {
    const model = this;
    model.verifyAdapter();

    return new PromiseModel(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            const i = await this.execute("get", [query], ctx);
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
    query: JSONQuery = {},
    ctx?: ExecutorCtx
  ): PromiseModelList<InstanceType<T>> {
    const model = this;
    model.verifyAdapter();

    return new PromiseModelList<InstanceType<T>>(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            const list = await this.execute("getList", [query], ctx);
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
    payload: InputModelPayload<T>,
    ctx?: ExecutorCtx
  ): Promise<InstanceType<T>> {
    this.verifyAdapter();

    await this.initialize();

    return await this.execute("createOne", [payload], ctx);
  }

  static async createMultiple<T extends typeof Model>(
    this: T,
    payload: Array<InputModelPayload<T>>,
    ctx?: ExecutorCtx
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();

    await this.initialize();

    return await this.execute("createMultiple", [payload], ctx);
  }

  async update(update: any, ctx?: ExecutorCtx): Promise<this> {
    this.model.verifyAdapter();

    const res = await this.model.execute(
      "updateOne",
      [String(this._id), update],
      ctx
    );

    this.setDoc(res.__doc);

    return this;
  }

  static async update<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    update: any,
    ctx?: ExecutorCtx
  ): Promise<Array<InstanceType<T>>> {
    this.verifyAdapter();

    await this.initialize();

    if (typeof query === "string") {
      const updated = await this.execute("updateOne", [query, update], ctx);
      return [updated];
    }

    return await this.execute("updateMultiple", [query, update], ctx);
  }

  async delete(ctx?: ExecutorCtx): Promise<this> {
    this.model.verifyAdapter();

    await this.model.execute("deleteOne", [String(this._id)], ctx);

    return this;
  }

  static async delete<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: ExecutorCtx
  ): Promise<string[]> {
    this.verifyAdapter();

    await this.initialize();

    if (typeof query === "string") {
      const deleted = await this.execute("deleteOne", [query], ctx);
      if (deleted) {
        return [query];
      }

      return [];
    }

    return await this.execute("deleteMultiple", [query], ctx);
  }

  static hook<
    P extends HookPhase,
    A extends keyof AdapterFetcher,
    T extends typeof Model
  >(this: T, phase: P, action: A, fn: Hook<P, A, T>["fn"], order: number = 0) {
    const baseClass = this.getBaseClass();

    if (!baseClass.hasOwnProperty("__hooks") || !baseClass.__hooks) {
      baseClass.__hooks = new Set();
    }

    const hook: Hook<P, A, T> = { phase, action, fn, order };

    baseClass.__hooks.add(hook);
  }

  static async validate<T extends typeof Model>(
    this: T,
    input: Array<InstanceType<T> | DocumentDefinition>,
    ctx: ExecutorCtx = {}
  ) {
    const docs = input.map((i) => (i instanceof Model ? i.__doc : i));

    return await validateDocs(
      docs,
      { ...ctx, model: this },
      this.validatorsArray,
      Array.from(this.fieldsMap.entries())
    );
  }

  static async execute<
    M extends typeof Model,
    A extends keyof AdapterFetcher<M>,
    Args extends Parameters<AdapterFetcher[A]>[0]
  >(
    this: M,
    action: A,
    args: Args,
    bindCtx?: ExecutorCtx
  ): Promise<ReturnType<AdapterFetcher<M>[A]>> {
    const adapter = this.__adapter;
    const fn = adapter.fetcher[action];
    const retryToken = Symbol();
    const hooksBefore = getRecursiveHooksFromModel(this, action, "before");

    const ctx = { ...(bindCtx || {}), adapter, fn, retryToken } as ExecutorCtx;

    const hookPayloadBefore: HookCallbackArgs<"before", A, M> = { args, ctx };

    let beforeErr;
    await hooksBefore.reduce(async (p, hook) => {
      await p;
      try {
        await hook.fn.call(this, hookPayloadBefore);
      } catch (err) {
        beforeErr = Array.prototype.concat.apply(beforeErr ?? [], [err]);
      }
    }, Promise.resolve());

    let res;
    let err = beforeErr;

    if (!err?.length) {
      try {
        res = await fn.apply(fn, [
          hookPayloadBefore.args,
          hookPayloadBefore.ctx,
        ]);
      } catch (e) {
        err ??= [];
        err.push(e);
      }
    }

    if (err?.includes(retryToken)) {
      return await this.execute(action, args, bindCtx);
    }

    const hookPayloadAfter = { ...hookPayloadBefore, res, err };

    const hooksAfter = getRecursiveHooksFromModel(this, action, "after");
    await hooksAfter.reduce(async (p, hook) => {
      await p;
      try {
        await hook.fn.call(this, hookPayloadAfter);
      } catch (err) {
        hookPayloadAfter.err = Array.prototype.concat.apply(
          hookPayloadAfter.err ?? [],
          [err]
        );
      }
    }, Promise.resolve());

    if (hookPayloadAfter.err?.length) {
      if (hookPayloadAfter.err.includes(retryToken)) {
        return await this.execute(action, args, bindCtx);
      }

      throw hookPayloadAfter.err[0];
    }

    return hookPayloadAfter.res as ReturnType<AdapterFetcher<M>[A]>;
  }
}

Model.hook(
  "after",
  "createOne",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate([res], payload.ctx);
      }
    }
  },
  -1
);

Model.hook(
  "after",
  "createMultiple",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate(res, payload.ctx);
      }
    }
  },
  -1
);

Model.hook(
  "after",
  "updateOne",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate([res], payload.ctx);
      }
    }
  },
  -1
);

Model.hook(
  "after",
  "updateMultiple",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate(res, payload.ctx);
      }
    }
  },
  -1
);

export default Model;
