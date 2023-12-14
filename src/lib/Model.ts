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
  FieldsPathItem,
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
  createFieldsMap,
  createValidatorsArray,
  getFieldsPathsFromPath,
  getRecursiveHooksFromModel,
  defineFieldsProperties,
  getAdaptedModel,
  _getter,
  _setter,
  validateModel,
} from "./utils";
import CoreError from "./CoreError";
import ErrorCodes from "../enums/error-codes";

class Model {
  static extendable: boolean = false; // Whether the model can be extended with a DataModel with its slug
  static searchable: boolean = false; // Whether the model is usable as a search config source
  static single: boolean = false; // Single model (only one instance of the model can exist)
  static exposed: boolean = true; // Whether the model is exposed in the API or not
  static systemFields: boolean = true; // Include system field (_id, _createdAt, _createdBy, _updatedAt, _updatedBy) in the model fields
  static allowMultipleOperations: boolean = true; // Whether to allow multiple operations (updateMultiple, deleteMultiple) on the model. createMultiple is always allowed.
  static slug: string; // The slug of the model used to identify it
  static scope: ModelEnvScopes; // The scope of the model (global/project). Project scope could be global on project (project) or specific to an environment (env)
  static controllersScope: "global" | "project"; // The scope for CRUD controllers. Default calculated from model.scope
  static fields: FieldsDefinition; // The fields of the model
  static validators: ValidatorsDefinition; // The validators of the model
  static keyField?: string; // The key field of the model (used to identify instances of the model, in addition to _id)
  static freeMode: boolean = false; // Whether the model is free

  static __name: string = "Model";
  static __hooks: Set<Hook<any, any, any>>;
  static __initPromise: Promise<void>;
  static __localAdapter: Adapter;
  static __globalAdapter: Adapter;
  static __fieldsMap: Map<string, Field>;
  static __validatorsArray: Array<Validator>;
  static __fieldsKeys: string[];
  static __fieldsProperties: any;
  static __baseClass: typeof Model;

  #doc: DocumentDefinition; // The document

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
    if (!doc || typeof doc !== "object") {
      throw new CoreError({
        message: `Invalid document: ${doc}`,
      });
    }

    this.#doc = doc;
    this.#doc._id ??= Date.now();
  }

  /**
   * Returns the current instance model constructor as a typeof Model.
   * instance.model is an alias for instance.constructor.
   */
  get model() {
    return this.constructor as typeof Model;
  }

  /**
   * Returns the current instance doc (raw data)
   */
  getDoc() {
    return this.#doc;
  }

  /**
   * Set the current instance doc (raw data)
   * @param doc
   */
  setDoc(doc: any) {
    this.#doc = doc;
  }

  /**
   * Clone the current model instance.
   * @example
   * const account = await models.Account.get();
   * const clonedAccount = account.clone();
   * console.log(account === clonedAccount); // false
   */
  clone() {
    const clonedDoc = JSON.parse(JSON.stringify(this.#doc));
    return new this.model(clonedDoc);
  }

  /**
   * Returns the base class of the model.
   * When a model is extended with an adapter, the base class is the original model.
   * @example
   * const Account = models.Account.withAdapter(MyAdapter);
   * console.log(Account === models.Account); // false
   * console.log(Account.getBaseClass() === models.Account); // true
   * console.log(models.Account.getBaseClass() === models.Account); // true
   */
  static getBaseClass() {
    if (!this.__localAdapter) {
      return this;
    }

    return this.__baseClass ?? this;
  }

  /**
   * Returns a new model class with the given adapter.
   * @param adapterClass
   * @param modules
   * @example
   * const Account = models.Account.withAdapter(MyAdapter); // Account is now usable with MyAdapter
   * const account = await Account.getList({}); // returns a PromiseModelList
   */
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

    modelWithAdapter.__localAdapter = new adapterClass(modelWithAdapter);
    modelWithAdapter.__globalAdapter = modelWithAdapter.__localAdapter;

    modules?.forEach((module) => module(modelWithAdapter));

    return modelWithAdapter;
  }

  /**
   * Returns a promises that resolves when the model is initialized.
   * @param force - Force model initialization even if it's already initialized.
   * @param ctx
   */
  static async initialize(force: boolean = false, ctx?: ExecutorCtx) {
    const model = this;

    if (this.hasOwnProperty("__initPromise") && !force) {
      return this.__initPromise;
    }

    this.__initPromise = new Promise(async (resolve, reject) => {
      try {
        const hooksBefore = getRecursiveHooksFromModel(
          model,
          "initialize",
          "before"
        );

        await hooksBefore.reduce(async (p, hook) => {
          await p;
          return hook.fn.call(model, { ctx });
        }, Promise.resolve());

        if (model.extendable) {
          await model.reloadModel(ctx);
        }

        const hooksAfter = getRecursiveHooksFromModel(
          model,
          "initialize",
          "after"
        );

        await hooksAfter.reduce(async (p, hook) => {
          await p;
          return hook.fn.call(model, { ctx });
        }, Promise.resolve());
      } catch (e) {
        reject(e);
      }

      resolve();
    });

    await this.__initPromise;
  }

  /**
   * Reload model from its definition (fields, validators, etc).
   * If the model is not extendable (Role, Token, etc.), this method does nothing.
   * @param ctx
   * @returns
   */
  static async reloadModel(ctx?: ExecutorCtx) {
    const adapter = this.getAdapter();

    const DataModel = require("../models/DataModel").default;
    const datamodel = await getAdaptedModel(DataModel, adapter.base).get(
      {
        filter: {
          slug: this.slug,
        },
      },
      ctx
    );

    if (!datamodel) {
      return;
    }

    this.keyField = datamodel.keyField;
    this.single = datamodel.single;

    this.__fieldsMap = createFieldsMap(this, datamodel.fields);
    this.__validatorsArray = createValidatorsArray(this, datamodel.validators);

    delete this.__fieldsProperties;
    delete this.__fieldsKeys;
  }

  /**
   * Returns the fields map of the model.
   * The fields map could be incomplete if the model is extendable and is not initialized.
   */
  static get fieldsMap() {
    this.__fieldsMap ??= createFieldsMap(this);
    return this.__fieldsMap;
  }

  /**
   * Returns the keys of the fields map of the model.
   * Equivalent to Array.from(model.fieldsMap.keys()).
   */
  static get fieldsKeys() {
    this.__fieldsKeys ??= Array.from(this.fieldsMap.keys());
    return this.__fieldsKeys;
  }

  /**
   * Returns an array of all validators of the model and its parents.
   * The validators array could be incomplete if the model is extendable and is not initialized.
   */
  static get validatorsArray() {
    this.__validatorsArray ??= createValidatorsArray(this);
    return this.__validatorsArray;
  }

  /**
   * Returns the model from its slug.
   * If the model is not existing in core models, a model extending Data will be returned and will be
   * initialized from the datamodel with this slug.
   * @param slug
   * @param adapter
   * @param fallbackData - Whether to return a Data model if the model is not found in core models.
   * @returns
   */
  static getFromSlug<M extends typeof Model = typeof Model>(
    slug: string,
    adapter?: typeof Adapter,
    fallbackData: boolean = true
  ): M {
    if (!adapter) {
      adapter = this.getAdapter(false)?.base;
    }

    const models = require("../index").models as Record<string, typeof Model>;
    let model: M = Object.values(models).find((m) => m.slug === slug) as M;
    if (model) {
      let adaptedModel = adapter?.__modelsMap?.get(model.slug) as M;
      if (!adaptedModel && adapter) {
        adaptedModel = model.withAdapter(adapter);
        adapter.__modelsMap ??= new Map();
        adapter.__modelsMap.set(model.slug, adaptedModel);
      }

      model = adaptedModel || model;
    } else if (fallbackData) {
      const Data = require("./Data").default;
      model = Data.__getFromSlug(slug, adapter);
    }

    return model;
  }

  /**
   * Get value for a specific field. model.get("field") is an equivalent to `model.field`
   * @param path - The path to the field
   * @param format - The format to serialize the value (default object)
   * @example
   * console.log(model.get("field"));
   * console.log(model.get("field.subfield.arr.nested"));
   * console.log(model.get("field.subfield.arr.[1].nested"));
   */
  get(
    path: string,
    format: SerializerFormat | string = SerializerFormat.OBJECT,
    ctx: SerializerCtx = {}
  ) {
    let fieldsPaths: Array<FieldsPathItem>;

    ctx.outputFormat = format;

    if (path.includes(".")) {
      const pathArr = path.split(".");
      fieldsPaths = getFieldsPathsFromPath(this.model, [...pathArr]);
    } else {
      const field = this.model.fieldsMap.get(path);
      if (field) {
        fieldsPaths = [
          {
            field,
            key: path,
          },
        ];
      }
    }

    if (!fieldsPaths?.length) {
      if (this.model.freeMode) {
        return this.#doc[path];
      }

      return undefined;
    }

    const firstField = fieldsPaths[0].field;
    let value = this.#doc[firstField.path];

    if (
      format !== SerializerFormat.DOCUMENT &&
      value === undefined &&
      "default" in firstField.options
    ) {
      value = firstField.options.default as typeof value;
    }

    if (value === undefined || value === null) {
      return value;
    }

    if (fieldsPaths.length === 1) {
      return firstField.serialize(value, format, this, ctx);
    } else {
      const noFieldSymbol = Symbol("noField");

      const _value = firstField.serialize(
        value,
        SerializerFormat.NEXT_FIELD,
        this,
        ctx
      );

      let res = _getter({
        _value,
        _fieldsPaths: fieldsPaths.splice(1),
        format,
        ctx,
        noFieldSymbol,
        from: this,
      });

      return res === noFieldSymbol ? undefined : res;
    }
  }

  /**
   * Set value for a specific field. Model.set("field", "value") is an equivalent to `model.field = value`
   * @param path - The path to the field
   * @param value - The value to set
   * @example
   * model.set("field", "value");
   * console.log(model.get("field")); // value
   */
  set<T extends Model, S extends keyof T | string>(
    this: T,
    path: S,
    value: S extends keyof T ? T[S] | any : any,
    ctx: ExecutorCtx = {}
  ) {
    const _path = path as string;
    let fieldsPaths;
    const _throw = () => {
      throw new CoreError({
        message: `Field ${_path} is not found in model ${this.model.slug}`,
      });
    };

    if (_path.includes(".")) {
      const pathArr = _path.split(".");
      fieldsPaths = getFieldsPathsFromPath(this.model, [...pathArr]);

      if (fieldsPaths.includes(null)) {
        _throw();
      }
    } else {
      fieldsPaths = [
        {
          key: _path,
          field: this.model.fieldsMap.get(_path),
        },
      ];
    }

    return _setter({
      _assignTo: this.#doc,
      _value: value,
      _fieldsPaths: fieldsPaths,
      _throw,
      ctx,
      from: this,
    });
  }

  /**
   * Get the document representation of the current instance with the given format
   * @param format
   * @param ctx
   * @param clean - if true, the result object will be cleaned from undefined values
   * @param fieldsKeys - an array of fields to serialize. If not provided, all fields will be serialized
   * @example
   * console.log(instance.serialize(SerializerFormat.JSON)); // equivalent to instance.toJSON()
   */
  serialize(
    format: SerializerFormat | string,
    ctx: SerializerCtx = {},
    clean = false,
    fieldsKeys?: Array<string>
  ) {
    defineFieldsProperties(this);

    const keys = fieldsKeys ?? this.model.fieldsKeys;
    const res: any = {};

    keys.forEach((slug) => {
      const v = this.get(slug, format, ctx);
      if (clean && v === undefined) {
        return;
      }

      res[slug] = v;
    });

    return res;
  }

  /**
   * Get the document representation of the current instance as JSON
   * @example
   * console.log(instance.toJSON()); // equivalent to instance.to(SerializerFormat.JSON)
   */
  toJSON() {
    return this.serialize(SerializerFormat.JSON);
  }

  /**
   * Get the document representation of the current instance as an object
   * @example
   * console.log(instance.toObject()); // equivalent to instance.to(SerializerFormat.OBJECT)
   */
  toObject() {
    return this.serialize(SerializerFormat.OBJECT);
  }

  /**
   * Get the document representation of the current instance as a document
   * @example
   * console.log(instance.toDocument()); // equivalent to instance.to(SerializerFormat.DOCUMENT)
   */
  toDocument() {
    return this.serialize(SerializerFormat.DOCUMENT);
  }

  /**
   * Serialize the current instance to a string
   */
  toString() {
    return JSON.stringify(this.#doc);
  }

  /**
   * Hydrate a new instance of the current model from a string.
   * You can use Model.prototype.toString() to get the string representation of an instance and then use this method to hydrate a new instance.
   * @param str
   * @param cleanPayload
   * @example
   * const modelStr = instance.toString();
   * const instance = Model.fromString(modelStr);
   */
  static fromString<T extends typeof Model>(
    this: T,
    str: string,
    cleanPayload = true
  ) {
    const model = this;
    const parsed = JSON.parse(str);
    let payload = parsed;

    if (cleanPayload) {
      const cleaned: any = {};

      model.fieldsKeys.forEach((slug) => {
        cleaned[slug] = parsed[slug];
      });

      payload = cleaned;
    }

    return new model(payload);
  }

  /**
   * Count the number of documents with the given query.
   * If Model.single is true, the result will always be 1.
   * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
   * @example
   * const count = await Model.count({ filter: { title: { "$regex": "a" } } });
   */
  static async count<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: ExecutorCtx
  ): Promise<number> {
    await this.initialize();

    if (this.single) {
      return 1;
    }

    return this.execute("count", [query], ctx);
  }

  /**
   * Return a PromiseModel instance that will resolve to the first document that match the given query.
   * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
   * @example
   * const instance = await Model.get({ filter: { title: { "$regex": "a" } } });
   * console.log(instance.title); // "apple"
   */
  static get<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: ExecutorCtx
  ): PromiseModel<InstanceType<T>> {
    const model = this;

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

  /**
   * Return a PromiseModelList instance that will resolve to a ModelList instance that contains all documents that match the given query.
   * The default limit/pageSize is 100.
   * You cannot use this method on a single model, use Model.get instead.
   * @param query - a JSONQuery object that contains the filter to apply and other settings
   * @example
   * const list = await Model.getList({ filter: { title: { "$regex": "a" } } });
   * console.log(list.count); // 2
   * console.log(list[0].title); // "apple"
   * console.log(list[1].title); // "banana"
   */
  static getList<T extends typeof Model>(
    this: T,
    query: JSONQuery = {},
    ctx?: ExecutorCtx
  ): PromiseModelList<InstanceType<T>> {
    const model = this;

    return new PromiseModelList<InstanceType<T>>(
      [
        async (resolve, reject) => {
          try {
            await model.initialize();

            if (model.single) {
              throw new CoreError({
                code: ErrorCodes.INVALID_OPERATION,
                message: `Cannot use getList on a single model, use get instead`,
              });
            }

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

  /**
   * Create a new single document based on the current model.
   * @param payload - the content of the document to create
   * @example
   * const instance = await Model.create({ title: "apple" });
   * console.log(instance._id); // ...
   * console.log(instance.title); // "apple"
   */
  static async create<T extends typeof Model>(
    this: T,
    payload: InputModelPayload<T>,
    ctx?: ExecutorCtx
  ): Promise<InstanceType<T>> {
    if (Array.isArray(payload)) {
      throw new CoreError({
        code: ErrorCodes.INVALID_PARAMS,
        message: `Payload is an array, use createMultiple instead`,
      });
    }

    await this.initialize();

    if (this.single) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot use create on a single model, instance is already created`,
      });
    }

    return await this.execute("createOne", [payload], ctx);
  }

  /**
   * Create multiple documents based on the current model.
   * That method returns an array of created instances (not a ModelList).
   * Use this instead of calling Model.create multiple times.
   * @param payload - an array of documents content to create
   * @example
   * const instances = await Model.createMultiple([
   *  { title: "apple" },
   * { title: "banana" },
   * ]);
   * console.log(instances.length); // 2
   * console.log(instances[0].title); // "apple"
   * console.log(instances[1].title); // "banana"
   */
  static async createMultiple<T extends typeof Model>(
    this: T,
    payload: Array<InputModelPayload<T>>,
    ctx?: ExecutorCtx
  ): Promise<Array<InstanceType<T>>> {
    await this.initialize();

    if (this.single) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot use createMultiple on a single model, instance is already created`,
      });
    }

    return await this.execute("createMultiple", [payload], ctx);
  }

  /**
   * Update a single document (the current instance) with a mongodb update object.
   * @param update - The mongodb update object to apply (Contains only update operators expressions - https://www.mongodb.com/docs/manual/reference/operator/update/#update-operators-1)
   * @example
   * const instance = await Model.create({ title: "apple" });
   * await instance.update({ $set: { title: "banana" } });
   * console.log(instance.title); // "banana"
   * await instance.update({ $unset: { title: true } });
   * console.log(instance.title); // undefined
   */
  async update(update: any, ctx?: ExecutorCtx): Promise<this> {
    const res = await this.model.execute(
      "updateOne",
      [String(this._id), update],
      ctx
    );

    if (!res?.getDoc?.()) {
      throw new CoreError({
        message: `Unable to update model: ${res instanceof Model}`,
      });
    }

    this.#doc = res.#doc;

    return this;
  }

  /**
   * Update one or multiple documents that match the given query with a mongodb update object.
   * That method returns an array of updated instances (not a ModelList).
   * Use this instead of calling Model.prototype.update multiple times.
   * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
   * @param update- The mongodb update object to apply (Contains only update operators expressions - https://www.mongodb.com/docs/manual/reference/operator/update/#update-operators-1)
   * @example
   * const instances = await Model.createMultiple([
   * { title: "apple" },
   * { title: "banana" },
   * ]);
   * const list = await Model.update({ filter: { title: { "$regex": "a" } } }, { $set: { title: "pear" } });
   * console.log(list.length); // 2
   * console.log(list[0].title); // "pear"
   * console.log(list[1].title); // "pear"
   */
  static async update<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    update: any,
    ctx?: ExecutorCtx
  ): Promise<Array<InstanceType<T>>> {
    await this.initialize();

    if (this.single) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot use update on a single model, use instance of the model instead`,
      });
    }

    if (typeof query === "string") {
      const updated = await this.execute("updateOne", [query, update], ctx);
      return [updated];
    }

    if (!this.allowMultipleOperations) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot run updateMultiple operation on model ${this.slug}`,
      });
    }

    return await this.execute("updateMultiple", [query, update], ctx);
  }

  /**
   * Delete a single document (the current instance).
   * @example
   * const instance = await Model.create({ title: "apple" });
   * await instance.delete();
   */
  async delete(ctx?: ExecutorCtx): Promise<this> {
    await this.model.initialize();

    if (this.model.single) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot use delete on a single model, delete the model itself instead`,
      });
    }

    await this.model.execute("deleteOne", [String(this._id)], ctx);

    return this;
  }

  /**
   * Delete one or multiple documents that match the given query.
   * That method returns an array of deleted ids.
   * Use this instead of calling Model.prototype.delete multiple times.
   * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
   * @example
   * const instances = await Model.createMultiple([
   * { title: "apple" },
   * { title: "banana" },
   * ]);
   * const list = await Model.delete({ filter: { title: { "$regex": "a" } } });
   * console.log(list.length); // 2
   * console.log(list[0]); // ...
   * console.log(list[1]); // ...
   */
  static async delete<T extends typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: ExecutorCtx
  ): Promise<string[]> {
    await this.initialize();

    if (this.single) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot use delete on a single model, delete the model itself instead`,
      });
    }

    if (typeof query === "string") {
      const deleted = await this.execute("deleteOne", [query], ctx);
      if (deleted) {
        return [query];
      }

      return [];
    }

    if (!this.allowMultipleOperations) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot run deleteMultiple operation on model ${this.slug}`,
      });
    }

    return await this.execute("deleteMultiple", [query], ctx);
  }

  /**
   * Add hook to the current model baseClass (every adapted model with the same baseClass will inherit the hook).
   * @param phase - before | after
   * @param action - The action when the hook will be triggered. actions are keys of the adapter fetcher
   * @param fn - The hook function
   * @param order
   * @example
   * Account.hook("before", "createOne", async (payload, ctx) => {
   *  // will be triggered every time a single account is created with Account.create()
   * });
   */
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

  /**
   * Validate multiple documents with the current model validators.
   * This method will throw an error if one of the input documents is invalid.
   * @param list - An array of documents to validate
   * @example
   * const instances = await Model.createMultiple([
   * { title: "apple" },
   * { title: "banana" },
   * ]);
   * await Model.validate(instances); // will validate the two instances with the model validators and either throw an error or return true
   */
  static async validate<T extends typeof Model>(
    this: T,
    list: Array<InstanceType<T> | InputModelPayload<T>>,
    ctx: ExecutorCtx = {}
  ) {
    return await validateModel(this, list, ctx);
  }

  /**
   * Return the adapter of the current model.
   * If the model has no adapter set (Model.withAdapter  has not been called), it will try to use the global adapter (globalThis.__GLOBAL_ADAPTER__) and set on the model for the next call.
   * @param required - Whether to throw an error if model has no adapter and globalThis.__GLOBAL_ADAPTER__ is not defined
   */
  static getAdapter<T extends typeof Model>(this: T, required = true) {
    let adapter = this.__localAdapter;

    if (adapter) {
      return adapter;
    }

    const baseClass = this.getBaseClass();
    const globalAdapter = globalThis.__GLOBAL_ADAPTER__ as typeof Adapter;

    if (
      baseClass.hasOwnProperty("__globalAdapter") &&
      baseClass.__globalAdapter
    ) {
      if (baseClass.__globalAdapter.base === globalAdapter) {
        adapter = baseClass.__globalAdapter;
      } else {
        console.warn(
          `__GLOBAL_ADAPTER__ has changed. Updating adapter on model ${this.__name}`
        );
      }
    }

    if (!adapter && globalAdapter) {
      adapter = new globalAdapter(this);
      baseClass.__globalAdapter = adapter;

      globalAdapter.__modelsMap ??= new Map();
      globalAdapter.__modelsMap.set(this.slug, this);
    }

    if (!adapter && required) {
      throw new CoreError({
        code: ErrorCodes.INVALID_ADAPTER,
        message: `invalid adapter on model ${this.__name}. Please define an adapter for this model or declare __GLOBAL_ADAPTER__`,
      });
    }

    // if (
    //   globalThis.__GLOBAL_ADAPTER__ &&
    //   adapter?.base !== globalThis.__GLOBAL_ADAPTER__
    // ) {
    //   console.warn(
    //     `__GLOBAL_ADAPTER__ is declared but model ${this.__name} is using a different adapter. This may result in unexpected behavior`
    //   );
    // }

    return adapter;
  }

  static async executeHooks<
    M extends typeof Model,
    P extends HookPhase,
    A extends keyof AdapterFetcher<M>
  >(
    this: M,
    phase: P,
    action: A,
    payload: HookCallbackArgs<P, A, M>,
    abortToken?: symbol
  ): Promise<void> {
    await getRecursiveHooksFromModel(this, action, phase).reduce(
      async (p, hook) => {
        await p;

        try {
          await hook.fn.call(this, payload);
        } catch (err) {
          if (abortToken === err) {
            throw new CoreError({
              code: ErrorCodes.EXECUTION_ABORTED,
              message: `execution on model ${this.__name} has been aborted`,
            });
          }

          payload.err ??= [];
          payload.err.push(err);
        }
      },
      Promise.resolve()
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
    bindCtx: ExecutorCtx = {}
  ): Promise<ReturnType<AdapterFetcher<M>[A]>> {
    const retryToken = Symbol();
    const abortToken = Symbol();
    bindCtx.retryTimes ??= 0;

    const ctx = {
      ...bindCtx,
      retryToken,
      abortToken,
    } as ExecutorCtx;

    const payloadBefore: HookCallbackArgs<"before", A, M> = {
      args,
      ctx,
      err: undefined,
    };

    let res;
    await this.executeHooks("before", action, payloadBefore, abortToken);

    if (!payloadBefore.err?.length) {
      try {
        const fn = this.getAdapter().fetcher[action];
        res = await fn.apply(fn, [payloadBefore.args, ctx]);
      } catch (e) {
        payloadBefore.err ??= [];
        payloadBefore.err.push(e);
      }
    }

    if (payloadBefore.err?.includes(retryToken)) {
      bindCtx.retryTimes++;
      return await this.execute(action, args, bindCtx);
    }

    const payloadAfter: HookCallbackArgs<"after", A, M> = {
      ...payloadBefore,
      res,
    };

    await this.executeHooks("after", action, payloadAfter, abortToken);

    if (payloadAfter.err?.length) {
      if (payloadAfter.err.includes(retryToken)) {
        bindCtx.retryTimes++;
        return await this.execute(action, args, bindCtx);
      }

      throw payloadAfter.err[0];
    }

    return payloadAfter.res as ReturnType<AdapterFetcher<M>[A]>;
  }
}

globalThis.Model = Model;

export default Model;
