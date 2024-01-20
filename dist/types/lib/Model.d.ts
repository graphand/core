import ModelEnvScopes from "../enums/model-env-scopes";
import Field from "./Field";
import PromiseModel from "./PromiseModel";
import PromiseModelList from "./PromiseModelList";
import FieldTypes from "../enums/field-types";
import { AdapterFetcher, DocumentDefinition, Hook, HookCallbackArgs, HookPhase, InputModelPayload, JSONQuery, ModelDefinition, Module } from "../types";
import Adapter from "./Adapter";
import Validator from "./Validator";
import { getModelInitPromise } from "./utils";
import type DataModel from "../models/DataModel";
declare class Model {
    #private;
    static extensible: boolean;
    static searchable: boolean;
    static exposed: boolean;
    static systemFields: boolean;
    static allowMultipleOperations: boolean;
    static slug: string;
    static scope: ModelEnvScopes;
    static controllersScope: "global" | "project";
    static freeMode: boolean;
    static definition: ModelDefinition;
    static adapterClass: typeof Adapter;
    static __name: string;
    static __hooks: Set<Hook<any, any, any>>;
    static __initOptions: Parameters<typeof getModelInitPromise>[1];
    static __initPromise: Promise<void>;
    static __adapter: Adapter;
    static __fieldsMap: Map<string, Field>;
    static __validatorsArray: Array<Validator>;
    static __fieldsKeys: string[];
    static __fieldsProperties: any;
    static __baseClass: typeof Model;
    static __dm: string | null;
    _id: FieldDefinitionId;
    _createdAt: FieldDefinitionDate;
    _createdBy: any;
    _updatedAt: FieldDefinitionDate;
    _updatedBy: any;
    constructor(doc?: any);
    /**
     * Returns the current instance model constructor as a typeof Model.
     * instance.model is an alias for instance.constructor.
     */
    get model(): typeof Model;
    static isSingle(): boolean;
    static getKeyField(): string;
    /**
     * Returns the current instance doc (raw data)
     */
    getDoc(): DocumentDefinition;
    getKey(format?: string): any;
    getId(format?: string): any;
    /**
     * Set the current instance doc (raw data)
     * @param doc
     */
    setDoc(doc: any): void;
    /**
     * Clone the current model instance.
     * @example
     * const account = await models.Account.get();
     * const clonedAccount = account.clone();
     * console.log(account === clonedAccount); // false
     */
    clone(): Model;
    static clone<T extends typeof Model>(this: T, initOptions?: Parameters<typeof getModelInitPromise>[1]): T;
    /**
     * The function returns the base class of a given model class. If the the current model class is adapted (withAdapter),
     * the base class will be the class that was initially adapted.
     */
    static getBaseClass<T extends typeof Model>(this: T): T;
    /**
     * Returns a new model class with the given adapter.
     * @param adapterClass
     * @param modules
     * @example
     * const Account = models.Account.withAdapter(MyAdapter); // Account is now usable with MyAdapter
     * const account = await Account.getList({}); // returns a PromiseModelList
     */
    static withAdapter<T extends typeof Model>(this: T, adapterClass: typeof Adapter, modules?: Array<Module>): T;
    /**
     * Returns a promises that resolves when the model is initialized.
     */
    static initialize(): Promise<void>;
    /**
     * Reload model from its definition (fields, validators, etc).
     * If the model is not extensible (Role, Token, etc.), this method does nothing.
     * @returns
     */
    static reloadModel(opts?: {
        datamodel?: DataModel;
        ctx?: TransactionCtx;
    }): Promise<DataModel>;
    /**
     * Returns the fields map of the model.
     * The fields map could be incomplete if the model is extensible and is not initialized.
     */
    static get fieldsMap(): Map<string, Field<FieldTypes>>;
    /**
     * Returns the keys of the fields map of the model.
     * Equivalent to Array.from(model.fieldsMap.keys()).
     */
    static get fieldsKeys(): string[];
    /**
     * Returns an array of all validators of the model and its parents.
     * The validators array could be incomplete if the model is extensible and is not initialized.
     */
    static get validatorsArray(): Validator<import("../enums/validator-types").default>[];
    /**
     * Returns the model from its slug.
     * If the model is not existing in core models, a model extending Data will be returned and will be
     * initialized from the datamodel with this slug.
     * @param slug
     * @param adapter
     * @param fallbackData - Whether to return a Data model if the model is not found in core models.
     * @returns
     */
    static getFromSlug<M extends typeof Model = typeof Model>(slug: string, adapter?: typeof Adapter, fallbackData?: boolean): M;
    /**
     * Get value for a specific field. model.get("field") is an equivalent to `model.field`
     * @param path - The path to the field
     * @param format - The format to serialize the value (default object)
     * @example
     * console.log(model.get("field"));
     * console.log(model.get("field.subfield.arr.nested"));
     * console.log(model.get("field.subfield.arr.[1].nested"));
     */
    get(path: string, format?: string, bindCtx?: Partial<SerializerCtx>, value?: any): any;
    /**
     * Set value for a specific field. Model.set("field", "value") is an equivalent to `model.field = value`
     * @param path - The path to the field
     * @param value - The value to set
     * @example
     * model.set("field", "value");
     * console.log(model.get("field")); // value
     */
    set<T extends Model, S extends keyof T | string>(this: T, path: S, value: S extends keyof T ? T[S] | any : any, ctx?: TransactionCtx): any;
    /**
     * Get the document representation of the current instance with the given format
     * @param format
     * @param ctx
     * @param clean - if true, the result object will be cleaned from undefined values
     * @param fieldsKeys - an array of fields to serialize. If not provided, all fields will be serialized
     * @example
     * console.log(instance.serialize(SerializerFormat.JSON)); // equivalent to instance.toJSON()
     */
    serialize(format: string, bindCtx?: Partial<SerializerCtx>, clean?: boolean, fieldsKeys?: Array<string>): any;
    /**
     * Get the document representation of the current instance as JSON
     * @example
     * console.log(instance.toJSON()); // equivalent to instance.to(SerializerFormat.JSON)
     */
    toJSON(): any;
    /**
     * Get the document representation of the current instance as an object
     * @example
     * console.log(instance.toObject()); // equivalent to instance.to(SerializerFormat.OBJECT)
     */
    toObject(): any;
    /**
     * Get the document representation of the current instance as a document
     * @example
     * console.log(instance.toDocument()); // equivalent to instance.to(SerializerFormat.DOCUMENT)
     */
    toDocument(): any;
    /**
     * Serialize the current instance to a string
     */
    toString(): string;
    /**
     * Hydrate a new instance of the current model from a string.
     * You can use Model.prototype.toString() to get the string representation of an instance and then use this method to hydrate a new instance.
     * @param str
     * @param cleanPayload
     * @example
     * const modelStr = instance.toString();
     * const instance = Model.fromString(modelStr);
     */
    static fromString<T extends typeof Model>(this: T, str: string, cleanPayload?: boolean): InstanceType<T>;
    /**
     * Count the number of documents with the given query.
     * If Model.single is true, the result will always be 1.
     * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
     * @example
     * const count = await Model.count({ filter: { title: { "$regex": "a" } } });
     */
    static count<T extends typeof Model>(this: T, query?: string | JSONQuery, ctx?: TransactionCtx): Promise<number>;
    /**
     * Return a PromiseModel instance that will resolve to the first document that match the given query.
     * @param query - a JSONQuery object (or a string) that contains the filter to apply and other settings
     * @example
     * const instance = await Model.get({ filter: { title: { "$regex": "a" } } });
     * console.log(instance.title); // "apple"
     */
    static get<T extends typeof Model>(this: T, query?: string | JSONQuery, ctx?: TransactionCtx): PromiseModel<InstanceType<T>>;
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
    static getList<T extends typeof Model>(this: T, query?: JSONQuery, ctx?: TransactionCtx): PromiseModelList<InstanceType<T>>;
    /**
     * Create a new single document based on the current model.
     * @param payload - the content of the document to create
     * @example
     * const instance = await Model.create({ title: "apple" });
     * console.log(instance._id); // ...
     * console.log(instance.title); // "apple"
     */
    static create<T extends typeof Model>(this: T, payload: InputModelPayload<T>, ctx?: TransactionCtx): Promise<InstanceType<T>>;
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
    static createMultiple<T extends typeof Model>(this: T, payload: Array<InputModelPayload<T>>, ctx?: TransactionCtx): Promise<Array<InstanceType<T>>>;
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
    update(update: any, ctx?: TransactionCtx): Promise<this>;
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
    static update<T extends typeof Model>(this: T, query: string | JSONQuery, update: any, ctx?: TransactionCtx): Promise<Array<InstanceType<T>>>;
    /**
     * Delete a single document (the current instance).
     * @example
     * const instance = await Model.create({ title: "apple" });
     * await instance.delete();
     */
    delete(ctx?: TransactionCtx): Promise<this>;
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
    static delete<T extends typeof Model>(this: T, query?: string | JSONQuery, ctx?: TransactionCtx): Promise<string[]>;
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
    static hook<P extends HookPhase, A extends keyof AdapterFetcher, T extends typeof Model>(this: T, phase: P, action: A, fn: Hook<P, A, T>["fn"], order?: number): void;
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
    static validate<T extends typeof Model>(this: T, list: Array<InstanceType<T> | InputModelPayload<T>>, ctx?: TransactionCtx): Promise<boolean>;
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
    static getAdapter<T extends typeof Model>(this: T, required?: boolean): any;
    /**
     * The function checks if the adapter class has changed for a given model.
     * @param {T}  - - `T`: a generic type that extends `typeof Model`, which means it must be a subclass
     * of the `Model` class.
     * @returns a boolean value. It returns true if the adapter's base is not equal to the adapter class,
     * and false otherwise.
     */
    static hasAdapterClassChanged<T extends typeof Model>(this: T): boolean;
    static executeHooks<M extends typeof Model, P extends HookPhase, A extends keyof AdapterFetcher<M>>(this: M, phase: P, action: A, payload: HookCallbackArgs<P, A, M>, abortToken?: symbol): Promise<void>;
    static execute<M extends typeof Model, A extends keyof AdapterFetcher<M>, Args extends Parameters<AdapterFetcher[A]>[0]>(this: M, action: A, args: Args, bindCtx?: TransactionCtx): Promise<ReturnType<AdapterFetcher<M>[A]>>;
}
export default Model;
