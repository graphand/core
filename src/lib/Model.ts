import Field from "@/lib/Field";
import PromiseModel from "@/lib/PromiseModel";
import PromiseModelList from "@/lib/PromiseModelList";
import {
  AdapterFetcher,
  FieldsPathItem,
  Hook,
  HookCallbackArgs,
  HookPhase,
  JSONQuery,
  ModelDefinition,
  Module,
  ModelInstance,
  UpdateObject,
  JSONSubtype,
  RefModelsMap,
  InferModelDef,
  JSONTypeObject,
  SerializerFormat,
  TransactionCtx,
  SerializerCtx,
  Transaction,
  FieldsDefinition,
} from "@/types";
import Adapter from "@/lib/Adapter";
import Validator from "@/lib/Validator";
import {
  createFieldsMap,
  createValidatorsArray,
  getFieldsPathsFromPath,
  getRecursiveHooksFromModel,
  _getter,
  _setter,
  validateModel,
  assignDatamodel,
  getModelInitPromise,
  defineFieldsProperties,
} from "@/lib/utils";
import CoreError from "@/lib/CoreError";
import ErrorCodes from "@/enums/error-codes";
import type DataModel from "@/models/DataModel";
import ModelList from "./ModelList";
import FieldTypes from "@/enums/field-types";

class Model {
  static extensible: boolean = false; // Whether the model can be extended with a DataModel with its slug
  static searchable: boolean = false; // Whether the model is usable as a search config source
  static exposed: boolean = true; // Whether the model is exposed in the API or not
  static allowMultipleOperations: boolean = true; // Whether to allow multiple operations (updateMultiple, deleteMultiple) on the model. createMultiple is always allowed.
  static slug: string; // The slug of the model used to identify it
  static freeMode: boolean = false; // Whether the model is free
  static definition: object; // The definition of the model (use satisfies ModelDefinition)
  static adapterClass: typeof Adapter; // The adapter class to use with the model and inherited models
  static isEnvironmentScoped: boolean = false; // Whether the model is environment scoped or whole project scoped
  static cacheAdapter = true;
  static isDynamic = false; // True if the model is created dynamically from just a slug

  static __name: string = "Model";
  static __hooks: Set<Hook<HookPhase, keyof AdapterFetcher, typeof Model>>;
  static __initOptions: Parameters<typeof getModelInitPromise>[1];
  static __initPromise: Promise<void>;
  static __adapter: Adapter;
  static __extendedClass: typeof Model;
  static __dm?: string | null; // The id of the datamodel that initialized the model if extensible. null if datamodel not found
  static __memo: {
    fieldsMap?: Map<string, Field>;
    validatorsArray?: Array<Validator>;
    fieldsKeys?: string[];
    fieldsProperties?: PropertyDescriptorMap;
  };
  static systemFields: FieldsDefinition = {
    _id: { type: FieldTypes.ID },
    _createdAt: { type: FieldTypes.DATE },
    _createdBy: { type: FieldTypes.IDENTITY },
    _updatedAt: { type: FieldTypes.DATE },
    _updatedBy: { type: FieldTypes.IDENTITY },
  };

  __data: ModelData; // The document

  constructor(data: ModelData = {}) {
    if (!data || typeof data !== "object") {
      throw new CoreError({
        message: `Invalid document: ${data}`,
      });
    }

    this.__data = data;

    Object.defineProperty(this, "__data", {
      enumerable: false,
    });
  }

  /**
   * Returns the current instance model constructor as a typeof Model.
   * instance.model is an alias for instance.constructor.
   */
  model<T extends ModelInstance>(this: T): T extends ModelInstance<infer M> ? M : typeof Model {
    return this.constructor as T extends ModelInstance<infer M> ? M : typeof Model;
  }

  static isSingle() {
    const definition = this.definition as ModelDefinition;
    return Boolean(definition?.single);
  }

  static getKeyField() {
    const definition = this.definition as ModelDefinition;
    return definition?.keyField ?? definition?.keyField ?? "_id";
  }

  static hydrate<T extends typeof Model = typeof Model>(
    this: T,
    data?: ModelData<T>,
  ): ModelInstance<T> {
    return new this((data ?? {}) as ModelData) as ModelInstance<T>;
  }

  /**
   * Serializes the model data into a specified format.
   * @param data - The data to be serialized.
   * @param format - The format to serialize the data into. Default is 'json'.
   * @param ctx - The serialization context.
   * @param clean - A boolean indicating whether to clean the data before serialization.
   * @returns The serialized data.
   * @example
   * const serializedData = Model.serialize(myData, 'json');
   */
  static serialize<S extends SerializerFormat, T extends typeof Model = typeof Model>(
    this: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: InferModelDef<T, any>,
    format: S = "json" as S,
    ctx: SerializerCtx = {},
    clean = false,
  ): InferModelDef<T, S> {
    // Create a new instance of the model with the provided data
    const i = new this((data ?? {}) as ModelData) as ModelInstance<T>;

    // Serialize the model instance into the specified format
    return i.serialize(format, ctx, clean) as InferModelDef<T, typeof format>;
  }

  /**
   * Returns the current instance doc (raw data)
   */
  getData<T extends ModelInstance<typeof Model>>(this: T) {
    return this.__data as T extends ModelInstance<infer M> ? ModelData<M> : ModelData;
  }

  getKey<T extends ModelInstance<typeof Model>>(this: T, format?: SerializerFormat): string {
    const model = this.model();
    const keyField = model.getKeyField();

    if (!keyField) {
      throw new CoreError({
        message: `Invalid keyField for model ${model.slug} : ${keyField}`,
      });
    }

    return this.get(model.getKeyField(), format) as string;
  }

  getId(format?: SerializerFormat) {
    return this.get("_id", format);
  }

  /**
   * Set the current instance data
   * @param data
   */
  setData(data: ModelData) {
    this.__data = data;
  }

  /**
   * Clone the current model instance.
   * @example
   * const account = await models.Account.get();
   * const clonedAccount = account.clone();
   * console.log(account === clonedAccount); // false
   */
  clone<T extends ModelInstance>(this: T): T {
    const clonedData = JSON.parse(JSON.stringify(this.__data));
    return this.model().hydrate(clonedData) as T;
  }

  /**
   * The function returns the base class of a given model class. If the the current model class is extended (Model.extend),
   * the base class will be the class that was initially extended.
   */
  static getBaseClass<T extends typeof Model = typeof Model>(this: T): T {
    if (this.hasOwnProperty("__extendedClass") && this.__extendedClass) {
      return this.__extendedClass as T;
    }

    return this as T;
  }

  /**
   * Extends the current model with additional options and functionalities like an adapter or init options.
   * @param opts - An object containing options for the extension.
   * @param opts.adapterClass - The adapter class to be used with the model.
   * @param opts.initOptions - Initialization options for the model.
   * @param opts.modules - An array of modules to be applied to the model.
   * @param opts.register - A boolean indicating whether the model should be registered.
   * @param opts.force - A boolean indicating whether to force the extension even if the base class does not have a slug.
   * @returns The extended model.
   * @throws {CoreError} If the base class does not have a slug and the force option is not set.
   * @example
   * const ExtendedModel = Model.extend({
   *   adapterClass: MyAdapter,
   * });
   */
  static extend<T extends typeof Model = typeof Model>(
    this: T,
    opts: {
      adapterClass?: typeof Adapter;
      initOptions?: Parameters<typeof getModelInitPromise>[1];
      modules?: Array<Module>;
      register?: boolean;
      force?: boolean;
    },
  ): T {
    // Get the base class of the current model
    const extendedClass = this.getBaseClass();

    // If the base class does not have a slug and the force option is not set, throw an error
    if (!extendedClass?.slug && !opts.force) {
      throw new CoreError({
        message: "Cannot extend a model without slug",
      });
    }

    // @ts-expect-error Create a new class that extends the base class
    const model = class extends extendedClass {
      static __extendedClass = extendedClass;
    };

    // If initOptions are provided, set them on the model
    if (opts?.initOptions) {
      model.__initOptions = opts.initOptions;
    }

    // If an adapter class is provided, instantiate it with the model and set it on the model
    if (opts?.adapterClass) {
      const AdapterClass = opts.adapterClass;
      model.__adapter = new AdapterClass(model);
    }

    // If the register option is set or an adapter class is provided and the model has a slug, register the model
    if (opts?.register ?? (opts?.adapterClass && model.slug)) {
      opts?.adapterClass?.registerModel(model, opts?.force);
    }

    // If modules are provided, apply each module to the model
    if (opts?.modules?.length) {
      opts.modules.forEach(module => module(model));
    }

    // Return the extended model
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
  static async reloadModel(opts?: {
    datamodel?: ModelInstance<typeof DataModel>;
    ctx?: TransactionCtx;
  }) {
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
    this.__memo ??= {};
    this.__memo.fieldsMap ??= createFieldsMap(this);
    return this.__memo.fieldsMap;
  }

  /**
   * Returns the keys of the fields map of the model.
   * Equivalent to Array.from(model.fieldsMap.keys()).
   */
  static get fieldsKeys() {
    this.__memo ??= {};
    this.__memo.fieldsKeys ??= Array.from(this.fieldsMap.keys());
    return this.__memo.fieldsKeys;
  }

  /**
   * Returns an array of all validators of the model and its parents.
   * The validators array could be incomplete if the model is extensible and is not initialized.
   */
  static get validatorsArray() {
    this.__memo ??= {};
    this.__memo.validatorsArray ??= createValidatorsArray(this);
    return this.__memo.validatorsArray;
  }

  static get fieldsProperties() {
    if (!this.__memo?.fieldsProperties) {
      const properties: PropertyDescriptorMap = {};
      for (const slug of this.fieldsKeys) {
        properties[slug] = {
          enumerable: true,
          configurable: true,
          get() {
            return this.get(slug);
          },
          set(v) {
            if (v === undefined) {
              console.warn(
                "cannot set undefined value with = operator. Please use .set method instead",
              );
              return;
            }

            return this.set(slug, v);
          },
        };
      }

      this.__memo ??= {};
      this.__memo.fieldsProperties = properties;
    }

    return this.__memo.fieldsProperties;
  }

  /**
   * Retrieves the class of a model based on the provided input.
   * @param input - A slug (core model slug/datamodel slug), a model class or a datamodel instance.
   * @param adapterClass - The adapter class to be used with the model.
   * @returns The class of the model.
   * @throws {CoreError} If the input is invalid or if the model is already registered with a different class.
   * @example
   * const modelClass = Model.getClass('myModel');
   * const modelClass = Model.getClass(MyModel);
   * const modelClass = Model.getClass(datamodelInstance);
   */
  static getClass<
    M extends typeof Model = undefined,
    T extends string | keyof RefModelsMap | ModelInstance<typeof DataModel> | typeof Model =
      | string
      | keyof RefModelsMap
      | ModelInstance<typeof DataModel>
      | typeof Model,
  >(
    input: T,
    adapterClass?: typeof Adapter,
  ): M extends undefined
    ? T extends typeof Model
      ? T
      : T extends keyof RefModelsMap
      ? RefModelsMap[T]
      : typeof Model
    : M {
    // Throw an error if the input is not provided
    if (!input) {
      throw new CoreError({
        message: `Invalid input for getClass: ${input}`,
      });
    }

    // If no adapter class is provided, get the base adapter of the current model
    adapterClass ??= this.getAdapter(false)?.base;
    let slug: string;
    let model: ReturnType<typeof Model.getClass<M, T>>;

    // If the input is a model class, get its slug and assign it to the model
    if (typeof input === "function" && "prototype" in input && input.prototype instanceof Model) {
      slug = input.slug;
      model = input as ReturnType<typeof Model.getClass<M, T>>;
    }

    // If the slug is not defined, get it from the input if it's a string or a datamodel instance
    slug ??= typeof input === "string" ? input : (input as ModelInstance<typeof DataModel>).slug;
    const dm: ModelInstance<typeof DataModel> = input instanceof Model && slug ? input : undefined;

    // If no adapter class is provided and the input is a datamodel instance, get its base adapter
    if (!adapterClass && dm) {
      adapterClass = dm.model().getAdapter(false)?.base;
    }

    // If the adapter class has the model, return it
    const adapterModel = adapterClass?.getClosestModel(slug) as ReturnType<
      typeof Model.getClass<M, T>
    >;
    if (adapterModel) {
      if (adapterModel.getAdapter(false)?.base === adapterClass) {
        if (model && adapterModel.getBaseClass() !== model.getBaseClass()) {
          throw new CoreError({
            message: `Model ${slug} is already registered with a different class`,
          });
        }

        return adapterModel;
      }

      model = adapterModel;
    }

    // If the model is not fount yet, we deduce it to be a generic model extended with a datamodel instance (extensible and environment scoped)
    model ??= class extends Model {
      static __name = `Data<${slug}>`;
      static slug = slug;
      static searchable = true;
      static extensible = true; // A data class is extensible as it should be linked to a datamodel with the same slug
      static isEnvironmentScoped = true;
      static isDynamic = true;

      constructor(data) {
        super(data);

        defineFieldsProperties(this);
      }
    } as ReturnType<typeof Model.getClass<M, T>>;

    // If an adapter class is provided, extend the model with it
    if (adapterClass) {
      model = model.extend({ adapterClass, initOptions: { datamodel: dm } });
    }

    // If the input is a datamodel instance, assign it to the model
    if (dm) {
      assignDatamodel(model, dm);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return model as any;
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
  get<T extends ModelInstance, P extends string, S extends SerializerFormat = "object">(
    this: T,
    path: P,
    format: S = "object" as S,
    ctx: SerializerCtx = {},
    value?: unknown,
  ): T extends ModelInstance<infer R>
    ? P extends keyof InferModelDef<R, S>
      ? InferModelDef<R, S>[P]
      : unknown
    : unknown {
    ctx.outputFormat ??= format;
    const model = this.model();
    let fieldsPaths: Array<FieldsPathItem>;

    if (path.includes(".")) {
      fieldsPaths = getFieldsPathsFromPath(this.model(), path.split("."));
    } else {
      if (model.fieldsMap.has(path)) {
        fieldsPaths = [{ field: model.fieldsMap.get(path), key: path }];
      }
    }

    const doc = (this.__data || {}) as ReturnType<T["getData"]>;

    if (!fieldsPaths?.length) {
      if (model.freeMode) {
        // @ts-expect-error Accept any path
        return doc[path];
      }

      return undefined;
    }

    const noFieldSymbol = Symbol("noField");

    try {
      return _getter({
        value: value ?? doc,
        fieldsPaths,
        format,
        ctx,
        noFieldSymbol,
        from: this,
      });
    } catch (e) {
      if (e === noFieldSymbol) {
        return undefined;
      }

      throw e;
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
  set<T extends ModelInstance>(this: T, path: string, value: JSONSubtype) {
    const _path = path as string;
    let fieldsPaths;
    const _throw = () => {
      throw new CoreError({
        message: `Field ${_path} is not found in model ${this.model().slug}`,
      });
    };

    if (_path.includes(".")) {
      const pathArr = _path.split(".");
      fieldsPaths = getFieldsPathsFromPath(this.model(), [...pathArr]);

      if (fieldsPaths.includes(null)) {
        _throw();
      }
    } else {
      fieldsPaths = [
        {
          key: _path,
          field: this.model().fieldsMap.get(_path),
        },
      ];
    }

    return _setter({
      assignTo: this.__data,
      value,
      fieldsPaths,
      _throw,
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
   * console.log(instance.serialize("json")); // equivalent to instance.toJSON()
   */
  serialize<T extends ModelInstance, S extends SerializerFormat>(
    this: T,
    format: S,
    bindCtx: SerializerCtx = {},
    clean = false,
    fieldsKeys?: Array<string>,
  ): T extends ModelInstance<infer M> ? InferModelDef<M, S> : JSONTypeObject {
    const keys = fieldsKeys ?? this.model().fieldsKeys;
    const res = {};

    keys.forEach(slug => {
      const v = this.get(slug, format, bindCtx);
      if (!clean || v !== undefined) {
        res[slug] = v;
      }
    });

    return res as T extends ModelInstance<infer M> ? InferModelDef<M, S> : JSONTypeObject;
  }

  /**
   * Get the document representation of the current instance as JSON
   * @example
   * console.log(instance.toJSON()); // equivalent to instance.to("json")
   */
  toJSON<T extends ModelInstance>(this: T) {
    return this.serialize("json");
  }

  /**
   * Get the document representation of the current instance as an object
   * @example
   * console.log(instance.toObject()); // equivalent to instance.to("object")
   */
  toObject<T extends ModelInstance>(this: T) {
    return this.serialize("object");
  }

  /**
   * Count the number of documents with the given query.
   * If Model.single is true, the result will always be 1.
   * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
   * @example
   * const count = await Model.count({ filter: { title: { "$regex": "a" } } });
   */
  static async count<T extends typeof Model = typeof Model>(
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
  static get<T extends typeof Model = typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    ctx?: TransactionCtx,
  ): PromiseModel<T> {
    return new PromiseModel<T>(
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
  static getList<T extends typeof Model = typeof Model>(
    this: T,
    query: JSONQuery = {},
    ctx?: TransactionCtx,
  ): PromiseModelList<T> {
    return new PromiseModelList<T>(
      [
        async (resolve, reject) => {
          try {
            await this.initialize();

            const list = await this.execute("getList", [query], ctx);
            resolve(list as ModelList<T>);
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
  static async create<T extends typeof Model = typeof Model>(
    this: T,
    payload: InferModelDef<T, "json">,
    ctx?: TransactionCtx,
  ): Promise<ModelInstance<T>> {
    if (Array.isArray(payload)) {
      throw new CoreError({
        code: ErrorCodes.INVALID_PARAMS,
        message: `Payload is an array, use createMultiple instead`,
      });
    }

    await this.initialize();

    const i = await this.execute("createOne", [payload], ctx);
    return i as ModelInstance<T>;
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
  static async createMultiple<T extends typeof Model = typeof Model>(
    this: T,
    payload: Array<InferModelDef<T, "json">>,
    ctx?: TransactionCtx,
  ): Promise<Array<ModelInstance<T>>> {
    await this.initialize();

    const list = await this.execute("createMultiple", [payload], ctx);
    return list as Array<ModelInstance<T>>;
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
  async update<T extends ModelInstance>(
    this: T,
    update: UpdateObject,
    ctx?: TransactionCtx,
  ): Promise<T> {
    await this.model().initialize();

    const res = await this.model().execute("updateOne", [String(this.get("_id")), update], ctx);

    if (!res?.getData?.()) {
      throw new CoreError({
        message: `Unable to update instance on model ${this.model().slug}`,
      });
    }

    this.__data = res.__data;

    return this;
  }

  /**
   * Update one document that match the given query.
   * This method is just a shortcut for Model.get with query then instance.update on result
   * @param query
   * @param update
   * @example
   * await Model.createMultiple([
   * { title: "apple" },
   * { title: "banana" },
   * ]);
   * const updated = await Model.updateOne({ filter: { title: { "$regex": "a" } } }, { $set: { title: "pear" } });
   * console.log(updated.title); // "pear"
   */
  static async updateOne<T extends typeof Model = typeof Model>(
    this: T,
    query: string | JSONQuery = {},
    update: UpdateObject,
    ctx?: TransactionCtx,
  ): Promise<ModelInstance<T>> {
    await this.initialize();

    const i = await this.get(query);

    if (!i) {
      throw new CoreError({
        code: ErrorCodes.NOT_FOUND,
        message: `Unable to updateOne on model ${this.slug}: instance not found`,
      });
    }

    await i.update(update, ctx);

    return i;
  }

  /**
   * Update one or multiple documents that match the given query with a mongodb update object.
   * This method returns an array of updated instances (not a ModelList).
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
  static async update<T extends typeof Model = typeof Model>(
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
  async delete<T extends ModelInstance>(this: T, ctx?: TransactionCtx): Promise<T> {
    await this.model().initialize();

    await this.model().execute("deleteOne", [this.get("_id", "json")], ctx);

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
  static async delete<T extends typeof Model = typeof Model>(
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
    if (
      !this.allowMultipleOperations &&
      ["createMultiple", "updateMultiple", "deleteMultiple"].includes(action)
    ) {
      console.warn(
        `Useless hook ${action} on a model with allowMultipleOperations disabled (${this.slug})`,
      );
    }

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
  static async validate<T extends typeof Model = typeof Model>(
    this: T,
    list: Array<ModelData<T> | ModelInstance<T>>,
    ctx?: TransactionCtx,
  ): Promise<boolean> {
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
  static getAdapter<T extends typeof Model = typeof Model>(this: T, required = true): Adapter {
    let adapter: Adapter;
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
  static hasAdapterClassChanged<T extends typeof Model = typeof Model>(this: T) {
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
    transaction: Transaction<M, A>,
  ): Promise<void> {
    await getRecursiveHooksFromModel(this, action, phase).reduce(async (p, hook) => {
      await p;

      try {
        await hook.fn.call(this, payload);
      } catch (err) {
        if (transaction.abortToken === err) {
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
    ctx: TransactionCtx = {},
    transaction?: Transaction<M, A, Args>,
  ): Promise<ReturnType<AdapterFetcher<M>[A]>> {
    if (!ctx?.forceOperation) {
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

    transaction ??= {
      model: this,
      action,
      args,
      retryToken: Symbol("retry"),
      abortToken: Symbol("abort"),
      retries: -1,
    };

    transaction.retries += 1;

    if (transaction.retries > 2) {
      throw new CoreError({
        // code: ErrorCodes.TOO_MANY_RETRIES,
        message: `Too many retries on model ${this.slug} for action ${action}`,
      });
    }

    const payloadBefore: HookCallbackArgs<"before", A, M> = {
      args,
      ctx,
      transaction,
      err: undefined,
    };

    let res;
    await this.executeHooks("before", action, payloadBefore, transaction);

    if (!payloadBefore.err?.length) {
      try {
        const fn = this.getAdapter().fetcher[action];

        if (!fn) {
          throw new CoreError({
            code: ErrorCodes.INVALID_OPERATION,
            message: `Invalid operation ${action} on model ${this.slug}. Action not found in adapter fetcher`,
          });
        }

        res = await fn.apply(fn, [payloadBefore.args, ctx]);
      } catch (e) {
        payloadBefore.err ??= [];
        payloadBefore.err.push(e);
      }
    }

    if (payloadBefore.err?.includes(transaction.retryToken)) {
      return await this.execute(action, args, ctx, transaction);
    }

    const payloadAfter: HookCallbackArgs<"after", A, M> = {
      ...payloadBefore,
      res,
    };

    await this.executeHooks("after", action, payloadAfter, transaction);

    if (payloadAfter.err?.length) {
      if (payloadAfter.err.includes(transaction.retryToken)) {
        return await this.execute(action, args, ctx, transaction);
      }

      throw payloadAfter.err[0];
    }

    return payloadAfter.res as ReturnType<AdapterFetcher<M>[A]>;
  }
}

export default Model;
