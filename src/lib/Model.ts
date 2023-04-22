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
  createFieldsMap,
  createValidatorsArray,
  getFieldsPathsFromPath,
  getRecursiveHooksFromModel,
  validateDocs,
  defineFieldsProperties,
  getFieldFromDefinition,
  getAdaptedModel,
} from "./utils";
import CoreError from "./CoreError";
import ErrorCodes from "../enums/error-codes";

const noFieldSymbol = Symbol("noField");

class Model {
  static extendable: boolean = false;
  static single: boolean = false;
  static slug: string;
  static scope: ModelEnvScopes;
  static fields: FieldsDefinition;
  static validators: ValidatorsDefinition;
  static keyField?: string;

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
    if (!doc || typeof doc !== "object") {
      throw new CoreError({
        message: `Invalid document: ${doc}`,
      });
    }

    this.__doc = doc;
    this.__doc._id ??= Date.now();

    Object.defineProperty(this, "__doc", { enumerable: false });
  }

  /**
   * Returns the current instance model constructor as a typeof Model.
   * instance.model is an alias for instance.constructor.
   */
  get model() {
    return this.constructor as typeof Model;
  }

  /**
   * Clone the current model instance.
   * @example
   * const account = await models.Account.get();
   * const clonedAccount = account.clone();
   * console.log(account === clonedAccount); // false
   */
  clone() {
    const clonedDoc = JSON.parse(JSON.stringify(this.__doc));
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

    this.keyField = datamodel?.keyField ?? this.keyField;
    this.single = datamodel?.single ?? this.single;

    this.__fieldsMap = createFieldsMap(this, datamodel?.fields);
    this.__validatorsArray = createValidatorsArray(this, datamodel?.validators);

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
    ctx: ExecutorCtx = {}
  ) {
    let fieldsPaths;
    let firstField;
    let lastField;

    if (path.includes(".")) {
      const pathArr = path.split(".");
      fieldsPaths = getFieldsPathsFromPath(this.model, [...pathArr]);
      firstField = fieldsPaths.shift()?.field;
      lastField = fieldsPaths[fieldsPaths.length - 1]?.field || firstField;
    } else {
      fieldsPaths = [];
      firstField = this.model.fieldsMap.get(path);
    }

    if (!firstField) {
      return undefined;
    }

    let value: any = this.__doc[firstField.__path];

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

    // In case of a single field path (i._id for example), return the value directly
    if (!fieldsPaths.length) {
      return firstField.serialize(value, format, this, ctx);
    }

    value = firstField.serialize(value, SerializerFormat.JSON, this, ctx);

    const _getter = (
      _value: any,
      _fieldsPaths: Array<{ key: string; field: Field }>
    ) => {
      for (const [i, _fieldsPath] of _fieldsPaths.entries()) {
        if (!_fieldsPath) {
          return noFieldSymbol;
        }

        if (
          format !== SerializerFormat.DOCUMENT &&
          _value === undefined &&
          "default" in firstField.options
        ) {
          _value = firstField.options.default as typeof _value;
        }

        if (_value === undefined || _value === null) {
          return _value;
        }

        const { key, field } = _fieldsPath;

        const restPaths = _fieldsPaths.slice(i + 1);
        const matchIndex = key.match(/\[(\d+)?\]/);
        if (matchIndex) {
          const index = matchIndex[1] ? parseInt(matchIndex[1]) : null;

          if (!Array.isArray(_value)) {
            return noFieldSymbol;
          }

          if (index === null) {
            const _pathReplace = (p, fp) => {
              return p.field.__path.replace(field.__path, fp);
            };
            const adapter = this.model.getAdapter();

            return _value.map((v, fi) => {
              const thisPath = field.__path.replace(/\[\]$/, `[${fi}]`);
              const _restPaths = restPaths.map((p) => {
                if (!p) {
                  return p;
                }

                return {
                  ...p,
                  field: getFieldFromDefinition(
                    p.field.__definition,
                    adapter,
                    _pathReplace(p, thisPath)
                  ),
                };
              });

              const res = _getter(v, _restPaths);
              return res === noFieldSymbol ? undefined : res;
            });
          }

          if (_value.length <= index) {
            return noFieldSymbol;
          }

          const res = _getter(_value[index], restPaths);
          if (res === noFieldSymbol) {
            return undefined;
          }

          return res;
        }

        if (!_value || typeof _value !== "object") {
          break;
        }

        _value = field.serialize(_value[key], SerializerFormat.JSON, this, ctx);
      }

      return lastField.serialize(_value, format, this, ctx);
    };

    if (value === undefined) {
      return undefined;
    }

    let res = _getter(value, fieldsPaths);
    if (res === noFieldSymbol) {
      res = undefined;
    }

    return res;
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

    if (_path.includes(".")) {
      const pathArr = _path.split(".");
      fieldsPaths = getFieldsPathsFromPath(this.model, [...pathArr]);

      if (fieldsPaths.includes(null)) {
        throw new CoreError({
          message: `Field ${_path} is not found in model ${this.model.slug}`,
        });
      }
    } else {
      fieldsPaths = [
        {
          key: _path,
          field: this.model.fieldsMap.get(_path),
        },
      ];
    }

    const _setter = (
      _assignTo: any = {},
      _value: any,
      _fieldsPaths: Array<{ key: string | number; field: Field }>
    ) => {
      let assignTo = _assignTo;
      let assignPath = _fieldsPaths.shift();

      for (const [i, _fieldsPath] of _fieldsPaths.entries()) {
        if (!_fieldsPath) {
          throw new CoreError({
            message: `Field ${_path} is not found in model ${this.model.slug}`,
          });
        }

        assignTo[assignPath.key] ??= {};
        assignTo = assignTo[assignPath.key];
        assignPath = _fieldsPath;

        if (assignPath.key === "[]") {
          const restPaths = _fieldsPaths.slice(i + 1);

          const assignToArr = Array.isArray(assignTo) ? assignTo : [];
          if (assignToArr.length) {
            assignTo = assignToArr.map((v, index) => {
              return _setter(assignTo, _value, [
                { key: index, field: assignPath.field },
                ...restPaths,
              ]);
            });
          }

          return assignTo;
        }
      }

      if (assignPath?.field && assignTo && typeof assignTo === "object") {
        assignTo[assignPath.key] = assignPath.field.serialize(
          value,
          SerializerFormat.DOCUMENT,
          this,
          ctx
        );

        return assignTo[assignPath.key];
      }

      return null;
    };

    return _setter(this.__doc, value, fieldsPaths);
  }

  /**
   * Get the document representation of the current instance with the given format
   * @param format
   * @param ctx
   * @param clean - if true, the result object will be cleaned from undefined values
   * @example
   * console.log(instance.serialize(SerializerFormat.JSON)); // equivalent to instance.toJSON()
   */
  serialize(
    format: SerializerFormat | string,
    ctx: ExecutorCtx = {},
    clean = false
  ) {
    defineFieldsProperties(this);

    const entries = this.model.fieldsKeys
      .map((slug) => {
        const v = this.get(slug, format, ctx);
        if (clean && v === undefined) {
          return null;
        }

        return [slug, v];
      })
      .filter(Boolean);

    return Object.fromEntries(entries);
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
    return JSON.stringify(this.__doc);
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
      const payloadEntries = model.fieldsKeys.map((slug) => {
        return [slug, parsed[slug]];
      });

      payload = Object.fromEntries(payloadEntries);
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

    if (!res?.__doc) {
      throw new CoreError({
        message: `Unable to update model: ${res instanceof Model}`,
      });
    }

    this.__doc = res.__doc;

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

    if (typeof query === "string") {
      const updated = await this.execute("updateOne", [query, update], ctx);
      return [updated];
    }

    if (this.single) {
      throw new CoreError({
        code: ErrorCodes.INVALID_OPERATION,
        message: `Cannot use update on a single model, use instance of the model instead`,
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
   * @param input - An array of documents to validate
   * @example
   * const instances = await Model.createMultiple([
   * { title: "apple" },
   * { title: "banana" },
   * ]);
   * await Model.validate(instances); // will validate the two instances with the model validators and either throw an error or return true
   */
  static async validate<T extends typeof Model>(
    this: T,
    input: Array<InstanceType<T> | DocumentDefinition>,
    ctx: ExecutorCtx = {}
  ) {
    const docs = input.map((i) => (i instanceof Model ? i.__doc : i));

    return await validateDocs(
      docs,
      {
        validators: this.validatorsArray,
        fieldsEntries: Array.from(this.fieldsMap.entries()),
      },
      { ...ctx, model: this }
    );
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
    const adapter = this.getAdapter();
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

globalThis.Model = Model;

export default Model;
