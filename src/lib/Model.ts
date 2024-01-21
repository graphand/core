import ModelEnvScopes from "@/enums/model-env-scopes";
import Field from "@/lib/Field";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
import { fieldDecorator } from "@/lib/fieldDecorator";
import FieldTypes from "@/enums/field-types";
import {
  AdapterFetcher,
  CoreTransactionCtx,
  FieldsPathItem,
  Hook,
  HookCallbackArgs,
  HookPhase,
  JSONQuery,
  ModelDefinition,
  Module,
  JSONType,
  ModelDocument,
  GenericModelDocument,
  ModelInstance,
  ModelProps,
  UpdateObject,
  JSONSubtype,
} from "@/types";
import SerializerFormat from "@/enums/serializer-format";
import Adapter from "@/lib/Adapter";
import Validator from "@/lib/Validator";
import {
  createFieldsMap,
  createValidatorsArray,
  getFieldsPathsFromPath,
  getRecursiveHooksFromModel,
  defineFieldsProperties,
  _getter,
  _setter,
  validateModel,
  assignDatamodel,
  getModelInitPromise,
} from "@/lib/utils";
import CoreError from "@/lib/CoreError";
import ErrorCodes from "@/enums/error-codes";
import type DataModel from "@/models/DataModel";
import ModelList from "./ModelList";

// Used to infer the type of a model instance from a model class
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Model<Props extends object = never> {
  static extensible: boolean = false; // Whether the model can be extended with a DataModel with its slug
  static searchable: boolean = false; // Whether the model is usable as a search config source
  static exposed: boolean = true; // Whether the model is exposed in the API or not
  static systemFields: boolean = true; // Include system field (_id, _createdAt, _createdBy, _updatedAt, _updatedBy) in the model fields
  static allowMultipleOperations: boolean = true; // Whether to allow multiple operations (updateMultiple, deleteMultiple) on the model. createMultiple is always allowed.
  static slug: string; // The slug of the model used to identify it
  static scope: ModelEnvScopes; // The scope of the model (global/project). Project scope could be global on project (project) or specific to an environment (env)
  static controllersScope: "global" | "project"; // The scope for CRUD controllers. Default calculated from model.scope
  static freeMode: boolean = false; // Whether the model is free
  static definition: ModelDefinition; // The definition of the model
  static adapterClass: typeof Adapter; // The adapter class to use with the model and inherited models
  static cacheAdapter = true;

  static __name: string = "Model";
  static __hooks: Set<Hook<HookPhase, keyof AdapterFetcher, typeof Model>>;
  static __initOptions: Parameters<typeof getModelInitPromise>[1];
  static __initPromise: Promise<void>;
  static __adapter: Adapter;
  static __fieldsMap: Map<string, Field>;
  static __validatorsArray: Array<Validator>;
  static __fieldsKeys: string[];
  static __fieldsProperties: JSONType;
  static __extendedClass: typeof Model;
  static __dm: string | null; // The id of the datamodel that initialized the model if extensible. null if datamodel not found

  #doc: GenericModelDocument; // The document

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

  constructor(doc: GenericModelDocument = {}) {
    if (!doc || typeof doc !== "object") {
      throw new CoreError({
        message: `Invalid document: ${doc}`,
      });
    }

    this.#doc = doc;
    this.#doc._id ??= Date.now();
    return this;
  }

  /**
   * Returns the current instance model constructor as a typeof Model.
   * instance.model is an alias for instance.constructor.
   */
  get model() {
    return this.constructor as typeof Model;
  }

  static isSingle() {
    return Boolean(this.definition?.single);
  }

  static getKeyField() {
    return this.getBaseClass().definition?.keyField ?? this.definition?.keyField ?? "_id";
  }

  /**
   * Returns the current instance doc (raw data)
   */
  getDoc() {
    return this.#doc;
  }

  getKey(format?: string) {
    const keyField = this.model.getKeyField();

    if (!keyField) {
      throw new CoreError({
        message: `Invalid keyField for model ${this.model.slug} : ${keyField}`,
      });
    }

    return this.get(this.model.getKeyField(), format);
  }

  getId(format?: string) {
    return this.get("_id", format);
  }

  /**
   * Set the current instance doc (raw data)
   * @param doc
   */
  setDoc(doc: GenericModelDocument) {
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
   * The function returns the base class of a given model class. If the the current model class is extended (Model.extend),
   * the base class will be the class that was initially extended.
   */
  static getBaseClass<T extends typeof Model>(this: T): T {
    if (this.hasOwnProperty("__extendedClass") && this.__extendedClass) {
      return this.__extendedClass as T;
    }

    return this as T;
  }

  /**
   * The `extend` function is a static method that allows a model class to be extended with additional
   * functionality, such as a different adapter class or additional modules.
   * The adapter class is the class that will be used to process the model data, like crud operations.
   * @param {T}  - - `T`: A generic type that extends `typeof Model`, which represents the class that
   * is being extended.
   * @param opts - {
   * @returns the extended model class.
   */
  static extend<T extends typeof Model>(
    this: T,
    opts: {
      adapterClass?: typeof Adapter;
      initOptions?: Parameters<typeof getModelInitPromise>[1];
      modules?: Array<Module>;
      register?: boolean;
      force?: boolean;
    },
  ): T {
    const extendedClass = this.getBaseClass();

    if (!extendedClass?.slug && !opts.force) {
      throw new CoreError({
        message: "Cannot extend a model without slug",
      });
    }

    // @ts-expect-error decorator
    const model = class extends extendedClass {
      static __extendedClass = extendedClass;
    };

    if (opts?.initOptions) {
      model.__initOptions = opts.initOptions;
    }

    if (opts?.adapterClass) {
      const AdapterClass = opts.adapterClass;
      model.__adapter = new AdapterClass(model);
    }

    if (opts?.register ?? (opts?.adapterClass && model.slug)) {
      opts?.adapterClass?.registerModel(model, opts?.force);
    }

    if (opts?.modules?.length) {
      opts.modules.forEach(module => module(model));
    }

    return model;
  }

  /**
   * Returns a promises that resolves when the model is initialized.
   */
  static async initialize() {
    if (this.hasOwnProperty("__initPromise")) {
      return this.__initPromise;
    }

    let opts = {};
    if (this.hasOwnProperty("__initOptions")) {
      opts = this.__initOptions;
    }

    this.__initPromise = getModelInitPromise(this, opts);

    return this.__initPromise;
  }

  /**
   * Reload model from its definition (fields, validators, etc).
   * If the model is not extensible (Role, Token, etc.), this method does nothing.
   * @returns
   */
  static async reloadModel(opts?: { datamodel?: DataModel; ctx?: TransactionCtx }) {
    let datamodel = opts?.datamodel;
    const adapter = this.getAdapter();

    if (!datamodel) {
      datamodel = await Model.getClass<typeof DataModel>("datamodels", adapter.base).get(
        {
          filter: {
            slug: this.slug,
          },
        },
        opts?.ctx,
      );
    }

    assignDatamodel(this, datamodel);

    return datamodel;
  }

  /**
   * Returns the fields map of the model.
   * The fields map could be incomplete if the model is extensible and is not initialized.
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
   * The validators array could be incomplete if the model is extensible and is not initialized.
   */
  static get validatorsArray() {
    this.__validatorsArray ??= createValidatorsArray(this);
    return this.__validatorsArray;
  }

  static getClass<M extends typeof Model = typeof Model>(
    slugOrModel: string | DataModel,
    adapterClass?: typeof Adapter,
  ): M {
    if (!slugOrModel) {
      throw new CoreError({
        message: `Invalid slugOrModel: ${slugOrModel}`,
      });
    }

    const slug = typeof slugOrModel === "string" ? slugOrModel : slugOrModel.slug;
    const datamodel: DataModel = typeof slugOrModel === "string" ? null : slugOrModel;
    adapterClass ??= this.getAdapter(false)?.base;

    if (!adapterClass && datamodel) {
      adapterClass = datamodel.model.getAdapter(false)?.base;
    }

    if (adapterClass?.hasModel(slug)) {
      return adapterClass.getModel(slug) as M;
    }

    let model: M;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const models = require("@/index").models as Record<string, typeof Model>;
    const coreModel: M = Object.values(models).find(m => m.slug === slug) as M;

    if (coreModel) {
      model = coreModel;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const _Data = require("@/lib/Data").default;
      // @ts-expect-error decorator
      model = class extends _Data {
        static __name = `Data<${slug}>`;

        static slug = slug;
      };
    }

    if (adapterClass) {
      model = model.extend({ adapterClass, initOptions: { datamodel } });
    }

    if (datamodel) {
      assignDatamodel(model, datamodel);
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
    format: string = SerializerFormat.OBJECT,
    bindCtx: Partial<SerializerCtx> = {},
    value?: JSONSubtype,
  ) {
    let fieldsPaths: Array<FieldsPathItem>;

    const ctx: SerializerCtx = { ...bindCtx, outputFormat: format };

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
    value ??= this.#doc[firstField.path] as JSONSubtype;

    const defaults = ctx?.defaults ?? format !== SerializerFormat.DOCUMENT;
    if (defaults && value === undefined && "default" in firstField.options) {
      value = firstField.options.default as typeof value;
    }

    if (value === undefined || value === null) {
      return value;
    }

    if (fieldsPaths.length === 1) {
      return firstField.serialize(value, format, this, ctx);
    } else {
      const noFieldSymbol = Symbol("noField");

      const _value = firstField.serialize(value, SerializerFormat.NEXT_FIELD, this, ctx);

      const res = _getter({
        value: _value,
        fieldsPaths: fieldsPaths.splice(1),
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
    value: JSONSubtype,
    ctx?: TransactionCtx,
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
    format: string,
    bindCtx: Partial<SerializerCtx> = {},
    clean = false,
    fieldsKeys?: Array<string>,
  ) {
    defineFieldsProperties(this);

    const keys = fieldsKeys ?? this.model.fieldsKeys;
    const res = {};

    keys.forEach(slug => {
      const v = this.get(slug, format, bindCtx);
      if (clean && v === undefined) {
        return;
      }

      res[slug] = v;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res as Partial<Record<keyof this | keyof ModelProps<this>, any>>;
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
    return JSON.stringify(this.#doc) as string;
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
    cleanPayload = true,
  ): ModelInstance<T> {
    const parsed = JSON.parse(str);
    let payload = parsed;

    if (cleanPayload) {
      const cleaned: object = {};

      this.fieldsKeys.forEach(slug => {
        cleaned[slug] = parsed[slug];
      });

      payload = cleaned;
    }

    return new this(payload) as ModelInstance<T>;
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
    ctx?: TransactionCtx,
  ): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      try {
        await this.initialize();

        if (this.isSingle()) {
          return resolve(1);
        }

        const count = await this.execute("count", [query], ctx);
        resolve(count);
      } catch (e) {
        reject(e);
      }
    });
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
    ctx?: TransactionCtx,
  ): PromiseModel<ModelInstance<T>> {
    return new PromiseModel<ModelInstance<T>>(
      [
        async (resolve, reject) => {
          try {
            await this.initialize();

            const i = await this.execute("get", [query], ctx);
            resolve(i as ModelInstance<T>);
          } catch (e) {
            reject(e);
          }
        },
      ],
      this,
      query,
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
    ctx?: TransactionCtx,
  ): PromiseModelList<ModelInstance<T>> {
    return new PromiseModelList<ModelInstance<T>>(
      [
        async (resolve, reject) => {
          try {
            await this.initialize();

            const list = await this.execute("getList", [query], ctx);
            resolve(list as ModelList<ModelInstance<T>>);
          } catch (e) {
            reject(e);
          }
        },
      ],
      this,
      query,
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
    payload: ModelDocument<T>,
    ctx?: TransactionCtx,
  ): Promise<ModelInstance<T>> {
    if (Array.isArray(payload)) {
      throw new CoreError({
        code: ErrorCodes.INVALID_PARAMS,
        message: `Payload is an array, use createMultiple instead`,
      });
    }

    await this.initialize();

    return (await this.execute("createOne", [payload], ctx)) as ModelInstance<T>;
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
    payload: Array<ModelDocument<T>>,
    ctx?: TransactionCtx,
  ): Promise<Array<ModelInstance<T>>> {
    await this.initialize();

    return (await this.execute("createMultiple", [payload], ctx)) as Array<ModelInstance<T>>;
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
  async update(update: UpdateObject, ctx?: TransactionCtx): Promise<this> {
    const res = await this.model.execute("updateOne", [String(this._id), update], ctx);

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
   * @param update - The mongodb update object to apply (Contains only update operators expressions - https://www.mongodb.com/docs/manual/reference/operator/update/#update-operators-1)
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
    update: UpdateObject,
    ctx?: TransactionCtx,
  ): Promise<Array<ModelInstance<T>>> {
    await this.initialize();

    if (typeof query === "string") {
      const updated = await this.execute("updateOne", [query, update], ctx);
      return [updated] as Array<ModelInstance<T>>;
    }

    return (await this.execute("updateMultiple", [query, update], ctx)) as Array<ModelInstance<T>>;
  }

  /**
   * Delete a single document (the current instance).
   * @example
   * const instance = await Model.create({ title: "apple" });
   * await instance.delete();
   */
  async delete(ctx?: TransactionCtx): Promise<this> {
    await this.model.initialize();

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
    ctx?: TransactionCtx,
  ): Promise<string[]> {
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
  static hook<P extends HookPhase, A extends keyof AdapterFetcher, T extends typeof Model>(
    this: T,
    phase: P,
    action: A,
    fn: Hook<P, A, T>["fn"],
    order: number = 0,
  ) {
    const baseClass = this.getBaseClass();

    if (
      !this.allowMultipleOperations &&
      ["createMultiple", "updateMultiple", "deleteMultiple"].includes(action)
    ) {
      console.warn(
        `Useless hook ${action} on a model with allowMultipleOperations disabled (${this.slug})`,
      );
    }

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
    list: Array<ModelInstance<T> | ModelDocument<T>>,
    ctx?: TransactionCtx,
  ) {
    return await validateModel(this, list, ctx);
  }

  /**
   * The function `getAdapter` returns the adapter for a model class, throwing an error if no adapter
   * is found and required is set to true.
   * @param {T}  - - `T`: A generic type that extends `typeof Model`, which represents the class of a
   * model.
   * @param [required=true] - The `required` parameter is a boolean flag that indicates whether an
   * adapter is required for the model. If `required` is set to `true` and no adapter is found, an
   * error will be thrown. If `required` is set to `false` and no adapter is found, `null
   * @returns the adapter object.
   */
  static getAdapter<T extends typeof Model>(this: T, required = true) {
    let adapter;
    const baseClass = this.getBaseClass();
    const adapterClass = baseClass?.adapterClass;

    if (this.hasOwnProperty("__adapter")) {
      adapter = this.__adapter;
    } else if (adapterClass) {
      this.__adapter = new adapterClass(this);
      adapter = this.__adapter;
    }

    if (!adapter && required) {
      throw new CoreError({
        code: ErrorCodes.INVALID_ADAPTER,
        message: `invalid adapter on model ${this.__name}. Please define an adapter for this model or a global adapter class on Model.adapterClass`,
      });
    }

    return adapter;
  }

  /**
   * The function checks if the adapter class has changed for a given model.
   * @param {T}  - - `T`: a generic type that extends `typeof Model`, which means it must be a subclass
   * of the `Model` class.
   * @returns a boolean value. It returns true if the adapter's base is not equal to the adapter class,
   * and false otherwise.
   */
  static hasAdapterClassChanged<T extends typeof Model>(this: T) {
    const adapter = this.getAdapter(false);
    if (!adapter) {
      return false;
    }

    return adapter.base !== this.adapterClass;
  }

  static async executeHooks<
    M extends typeof Model,
    P extends HookPhase,
    A extends keyof AdapterFetcher<M>,
  >(
    this: M,
    phase: P,
    action: A,
    payload: HookCallbackArgs<P, A, M>,
    abortToken?: symbol,
  ): Promise<void> {
    await getRecursiveHooksFromModel(this, action, phase).reduce(async (p, hook) => {
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
    }, Promise.resolve());
  }

  static async execute<
    M extends typeof Model,
    A extends keyof AdapterFetcher<M>,
    Args extends Parameters<AdapterFetcher[A]>[0],
  >(
    this: M,
    action: A,
    args: Args,
    bindCtx: TransactionCtx = {},
  ): Promise<ReturnType<AdapterFetcher<M>[A]>> {
    if (!bindCtx?.forceOperation) {
      if (
        this.isSingle() &&
        [
          "getList",
          "createOne",
          "createMultiple",
          "updateMultiple",
          "deleteOne",
          "deleteMultiple",
        ].includes(action)
      ) {
        throw new CoreError({
          code: ErrorCodes.INVALID_OPERATION,
          message: `Cannot run ${action} operation on a single model (${this.slug})`,
        });
      }

      if (
        !this.allowMultipleOperations &&
        ["createMultiple", "updateMultiple", "deleteMultiple"].includes(action)
      ) {
        throw new CoreError({
          code: ErrorCodes.INVALID_OPERATION,
          message: `Cannot run ${action} operation a model with allowMultipleOperations disabled (${this.slug})`,
        });
      }
    }

    const retryToken = Symbol();
    const abortToken = Symbol();
    const transaction = {
      model: this,
      action,
      args,
    };

    const ctx: TransactionCtx & CoreTransactionCtx = {
      ...bindCtx,
      retryToken,
      abortToken,
      transaction,
    };

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
      return await this.execute(action, args, bindCtx);
    }

    const payloadAfter: HookCallbackArgs<"after", A, M> = {
      ...payloadBefore,
      res,
    };

    await this.executeHooks("after", action, payloadAfter, abortToken);

    if (payloadAfter.err?.length) {
      if (payloadAfter.err.includes(retryToken)) {
        return await this.execute(action, args, bindCtx);
      }

      throw payloadAfter.err[0];
    }

    return payloadAfter.res as ReturnType<AdapterFetcher<M>[A]>;
  }
}

globalThis.Model = Model;

export default Model;
