import Model from "./Model";
import { AdapterFetcher, FieldDefinition, FieldOptions, FieldsDefinition, FieldsPathItem, Hook, HookPhase, InputModelPayload, ModelDefinition, ValidatorDefinition, ValidatorHook, ValidatorOptions, ValidatorsDefinition } from "../types";
import FieldTypes from "../enums/field-types";
import Field from "./Field";
import ValidatorTypes from "../enums/validator-types";
import Validator from "./Validator";
import Adapter from "./Adapter";
import type DataModel from "../models/DataModel";
export declare const crossModelTree: (_model: typeof Model, cb: (model: typeof Model) => void) => void;
/**
 * The function `getRecursiveFieldsFromModel` retrieves all fields from a model and its base classes
 * recursively.
 * @param model - The `model` parameter is of type `typeof Model`. It represents a class that extends
 * the `Model` class.
 * @returns the fields definition object.
 */
export declare const getRecursiveFieldsFromModel: (model: typeof Model) => FieldsDefinition;
/**
 * The function `getRecursiveValidatorsFromModel` retrieves all the validators defined in the base
 * classes of a given model, excluding validators related to the key field if it exists.
 * @param model - The `model` parameter is of type `typeof Model`. It represents a model class that
 * extends a base model class called `Model`.
 * @returns an array of validators.
 */
export declare const getRecursiveValidatorsFromModel: (model: typeof Model) => ValidatorsDefinition;
/**
 * The function `getFieldsPathsFromPath` takes a model and a path array or string as input and returns
 * an array of the decomposed fields path.
 * @param model - The `model` parameter is the type of the model that contains the fields. It is of
 * type `typeof Model`.
 * @param {Array<string> | string} pathArr - The `pathArr` parameter is either an array of strings or a
 * string. It represents the path to a specific field in a model.
 * @returns The function `getFieldsPathsFromPath` returns an array of `FieldsPathItem` objects.
 */
export declare const getFieldsPathsFromPath: (model: typeof Model, pathArr: Array<string> | string) => Array<FieldsPathItem>;
/**
 * The function `getRecursiveHooksFromModel` retrieves all recursive hooks from a model based on the
 * provided action and phase.
 * @param {T} model - The `model` parameter is the model class from which you want to retrieve the
 * recursive hooks. It should be a subclass of the `Model` class.
 * @param {A} action - The `action` parameter represents the specific action that the hooks are
 * associated with. It is a key of the `AdapterFetcher` interface.
 * @param {HookPhase} phase - The `phase` parameter represents the phase of the hook. It is of type
 * `HookPhase`.
 * @returns an array of hooks.
 */
export declare const getRecursiveHooksFromModel: <A extends keyof AdapterFetcher, T extends typeof Model>(model: T, action: A, phase: HookPhase) => Hook<any, A, T>[];
/**
 * The function `getNestedFieldsMap` takes a model and a nested field as input, and returns a map of
 * the nested fields within the given field.
 * @param model - The `model` parameter is the type of the model that contains the nested field. It is
 * of type `typeof Model`.
 * @param nestedField - The `nestedField` parameter is of type `Field<FieldTypes.NESTED>`. It
 * represents a nested field in a model.
 * @returns The function `getNestedFieldsMap` returns a `Map` object.
 */
export declare const getNestedFieldsMap: (model: typeof Model, nestedField: Field<FieldTypes.NESTED>) => Map<any, any>;
/**
 * The function `getNestedValidatorsArray` returns an array of validators for a nested field in a
 * model.
 * @param model - The `model` parameter is the type of the model that contains the nested field. It is
 * of type `typeof Model`.
 * @param nestedField - The `nestedField` parameter is of type `Field<FieldTypes.NESTED>`. It
 * represents a nested field in a model.
 * @returns an array of validators.
 */
export declare const getNestedValidatorsArray: (model: typeof Model, nestedField: Field<FieldTypes.NESTED>) => any[];
/**
 * The function `getArrayItemsFieldsMap` takes a model and an array field as input, and returns a map
 * of the fields within the array.
 * @param model - The `model` parameter is the model class that represents a database table or
 * collection. It is of type `typeof Model`.
 * @param arrayField - The `arrayField` parameter is a field of type `FieldTypes.ARRAY`. It represents
 * an array field in a model.
 * @returns a Map object.
 */
export declare const getArrayItemsFieldsMap: (model: typeof Model, arrayField: Field<FieldTypes.ARRAY>) => Map<any, any>;
/**
 * The function `getArrayValidatorsArray` returns an array of validators for a given array field in a
 * model.
 * @param model - The `model` parameter is the type of the model that contains the array field. It is
 * of type `typeof Model`.
 * @param arrayField - The `arrayField` parameter is of type `Field<FieldTypes.ARRAY>`. It represents a
 * field in a model that is of type array.
 * @returns an array of validators.
 */
export declare const getArrayValidatorsArray: (model: typeof Model, arrayField: Field<FieldTypes.ARRAY>) => any[];
/**
 * The function `parseValidatorHook` takes a validator hook and a validator, and returns a hook
 * function that validates the arguments passed to it.
 * @param {ValidatorHook} hook - The `hook` parameter is an array that contains three elements:
 * @param {Validator} validator - The `validator` parameter is a function that performs validation on
 * some data. It takes in the data as an argument and returns a boolean value indicating whether the
 * data is valid or not.
 * @returns The function `parseValidatorHook` returns an object with properties `phase`, `action`, and
 * `fn`.
 */
export declare const parseValidatorHook: (hook: ValidatorHook, validator: Validator) => Hook<any, any, any>;
/**
 * The `createFieldsMap` function creates a map of fields from a model/
 * @param model - The `model` parameter is the type of the model for which you want to create a fields
 * map. It is of type `typeof Model`.
 * @returns The function `createFieldsMap` returns a `Map` object.
 */
export declare const createFieldsMap: (model: typeof Model) => Map<any, any>;
/**
 * The function `createValidatorsArray` takes a model and returns an
 * array of validators based on the model.
 * @param model - The `model` parameter is the type of the model for which validators are being
 * created. It is of type `typeof Model`.
 * @returns The function `createValidatorsArray` returns an array of `Validator` objects.
 */
export declare const createValidatorsArray: (model: typeof Model) => Array<Validator>;
/**
 * The getFieldClass function returns the appropriate Field class based on the given type and adapter.
 * @param {FieldTypes} type - The `type` parameter is of type `FieldTypes`. It represents the type of
 * field that is being requested.
 * @param {Adapter} [adapter] - The `adapter` parameter is an optional parameter of type `Adapter`. It
 * is used to provide a custom mapping of field types to field classes. If provided, the `adapter`
 * object should have a `fieldsMap` property which is an object mapping field types to field classes.
 * @returns The function `getFieldClass` returns the value of the variable `FieldClass`.
 */
export declare const getFieldClass: (type: FieldTypes, adapter?: Adapter) => typeof Field<any>;
/**
 * The function `getValidatorClass` returns the appropriate validator class based on the provided type
 * and adapter.
 * @param {ValidatorTypes} type - The `type` parameter is a string that represents the type of
 * validator class to retrieve. It is used to determine which validator class to return from the
 * `validatorsMap` or `defaultValidatorsMap` objects.
 * @param {Adapter} [adapter] - The `adapter` parameter is an optional object that contains a
 * `validatorsMap` property. This `validatorsMap` property is an object that maps `ValidatorTypes` to
 * their corresponding validator classes.
 * @returns The function `getValidatorClass` returns the `ValidatorClass` which is a class that extends
 * `Validator<any>`.
 */
export declare const getValidatorClass: (type: ValidatorTypes, adapter?: Adapter) => typeof Validator<any>;
/**
 * The function `getFieldFromDefinition` takes a field definition, an adapter, and a path, and returns
 * a field object based on the definition.
 * @param def - The `def` parameter is a FieldDefinition object that describes the field. It can be of
 * type `FieldOptionsMap` or `FieldTypes`.
 * @param {Adapter} adapter - The `adapter` parameter is an object that represents an adapter. It is
 * used to provide additional functionality or customization for the `getFieldFromDefinition` function.
 * @param {string} path - The `path` parameter is a string that represents the path to the field. It is
 * used to uniquely identify the field in the cache.
 * @returns an instance of the `FieldClass` which is created using the `def` and `path` parameters.
 */
export declare const getFieldFromDefinition: <T extends FieldTypes>(def: FieldDefinition<T>, adapter: Adapter, path: string) => Field<T>;
/**
 * The function `getValidatorFromDefinition` takes a validator definition, an adapter, and a path, and
 * returns a validator instance based on the definition.
 * @param def - The `def` parameter is a ValidatorDefinition object that defines the type of validator
 * and its options. It is of type `ValidatorDefinition<T>`, where `T` is a generic type that extends
 * `ValidatorTypes`.
 * @param {Adapter} adapter - The `adapter` parameter is an object that provides additional
 * functionality or customization options for the validator. It is optional and can be `null` if not
 * needed.
 * @param {string} path - A string representing the path to the validator.
 * @returns an instance of the `Validator` class.
 */
export declare const getValidatorFromDefinition: <T extends ValidatorTypes>(def: ValidatorDefinition<T>, adapter: Adapter, path: string) => Validator<T>;
/**
 * The function `getDefaultFieldOptions` returns the default options for a given field type.
 * @param {T} type - The `type` parameter is a generic type `T` that extends `FieldTypes`. It is used
 * to specify the type of field for which the default options are being retrieved.
 * @returns An empty object of type `FieldOptions<T>`.
 */
export declare const getDefaultFieldOptions: <T extends FieldTypes>(type: T) => FieldOptions<T>;
/**
 * The function `getDefaultValidatorOptions` returns default options based on the provided validator
 * type.
 * @param {T} type - The `type` parameter is a generic type `T` that extends `ValidatorTypes`. It is
 * used to determine the type of validator options to return.
 * @returns The function `getDefaultValidatorOptions` returns a `ValidatorOptions` object based on the
 * input `type`. If the `type` is `ValidatorTypes.LENGTH` or `ValidatorTypes.BOUNDARIES`, it returns an
 * object with `min` set to `-Infinity` and `max` set to `Infinity`. For any other `type`, it returns
 * an empty object.
 */
export declare const getDefaultValidatorOptions: <T extends ValidatorTypes>(type: T) => ValidatorOptions<T>;
export declare const isObjectId: (input: string) => boolean;
/**
 * The function `defineFieldsProperties` defines properties on an instance object based on the fields
 * of a model.
 * @param {Model} instance - The `instance` parameter is an object of type `Model`.
 * @returns There is no explicit return statement in the code provided. Therefore, the function
 * `defineFieldsProperties` does not return anything.
 */
export declare const defineFieldsProperties: (instance: Model) => void;
/**
 * The `getAdaptedModel` function returns an adapted version of a given model using a specified adapter
 * class, and caches the adapted model for future use.
 * @param {M} model - The `model` parameter is the model class that you want to adapt. It should be a
 * subclass of the `Model` class.
 * @param adapterClass - The `adapterClass` parameter is the class that will be used to adapt the
 * model. It should be a subclass of the `Adapter` class.
 * @param {boolean} [override] - The `override` parameter is a boolean flag that determines whether to
 * override an existing adapted model with a new one. If `override` is set to `true`, a new adapted
 * model will be created even if an existing one already exists. If `override` is set to `false` or not
 * @returns The function `getAdaptedModel` returns an adapted model of type `M`.
 */
export declare const getAdaptedModel: <M extends typeof Model = typeof Model>(model: M, adapterClass: typeof Adapter, override?: boolean) => M;
/**
 * The `_getter` function is a helper function that retrieves values from an object based on a given
 * set of fields and paths.
 * @param opts - The `opts` parameter is an object that contains the following properties:
 * - `_value` - The `_value` property is the value to be retrieved from the object. It is of type
 * `any`.
 * - `_fieldsPaths` - The `_fieldsPaths` property is an array of `FieldsPathItem` objects. It is used
 * to determine which fields to retrieve from the object.
 * - `_lastField` - The `_lastField` property is the last field in the `_fieldsPaths` array. It is of
 * type `Field`.
 * - `noFieldSymbol` - The `noFieldSymbol` property is a symbol that is used to indicate that a field
 * does not exist.
 * - `format` - The `format` property is a string that represents the format of the value to be
 * retrieved. It is of type `SerializerFormat`.
 * - `ctx` - The `ctx` property is an object that represents the context of the value to be retrieved.
 * - `from` - The `from` property is the model from which the value is being retrieved. It is of type
 * @returns the value obtained by traversing through the `_fieldsPaths` array and accessing the
 * corresponding properties in the `_value` object. If at any point the value is `undefined` or `null`,
 * it returns that value. If the current field is the last field or the format is `OBJECT` and the
 * current field's `nextFieldEqObject` property is `true`, it serializes the value using the current
 * field's `serialize` method and returns the serialized value. Otherwise, it returns the value
 * obtained by traversing through the `_fieldsPaths` array and accessing the corresponding properties
 * in the `_value` object.
 */
export declare const _getter: (opts: {
    _value?: any;
    _fieldsPaths: Array<{
        key: string;
        field: Field;
    }>;
    _lastField?: Field;
    noFieldSymbol: symbol;
    format: string;
    ctx: SerializerCtx;
    from: Model;
}) => any;
/**
 * The function `_setter` is a TypeScript function that assigns a value to a nested property in an
 * object based on a given set of fields paths.
 * @param opts - The `opts` parameter is an object that contains the following properties:
 * - `_assignTo` - The `_assignTo` property is the object to which the value is being assigned. It is
 * of type `any`.
 * - `_value` - The `_value` property is the value to be assigned to the `_assignTo` object. It is of
 * type `any`.
 * - `_fieldsPaths` - The `_fieldsPaths` property is an array of `FieldsPathItem` objects. It is used
 * to determine which fields to assign the value to.
 * - `_throw` - The `_throw` property is a function that throws an error. It is used to throw an error
 * if the `_fieldsPaths` array is empty.
 * - `ctx` - The `ctx` property is an object that represents the context of the value to be assigned.
 * - `from` - The `from` property is the model from which the value is being assigned. It is of type
 * Model.
 * @returns the value assigned to `assignTo[assignPath.key]` after serializing `_value` using
 * `assignPath.field.serialize()`.
 */
export declare const _setter: (opts: {
    _assignTo: any;
    _value: any;
    _fieldsPaths: Array<{
        key: string | number;
        field: Field;
    }>;
    _throw: () => void;
    ctx: any;
    from: Model;
}) => any;
/**
 * The function `getNestedFieldsArrayForModel` recursively retrieves all nested fields for a given
 * model.
 * @param model - The `model` parameter is the type of the model for which we want to retrieve the
 * nested fields array.
 * @returns The function `getNestedFieldsArrayForModel` returns an array of `Field` objects.
 */
export declare const getNestedFieldsArrayForModel: (model: typeof Model) => Array<Field>;
/**
 * The `validateModel` function is a TypeScript function that validates a list of instances or input
 * payloads against a given model, checking for field and validator errors.
 * @param {T} model - The `model` parameter is the model class that represents the data structure you
 * want to validate. It should be a subclass of the `Model` class.
 * @param list - The `list` parameter is an array that contains instances of the model or input
 * payloads for creating new instances. It can be an array of `InstanceType<T>` or
 * `InputModelPayload<T>`.
 * @param {TransactionCtx} ctx - The `ctx` parameter is an optional object that represents the execution
 * context. It can contain any additional information or variables that may be needed during the
 * validation process.
 * @returns The function `validateModel` returns a Promise that resolves to a boolean value (`true`).
 */
export declare const validateModel: <T extends typeof Model>(model: T, list: (InstanceType<T> | Partial<Omit<import("../types").ModelDocument<InstanceType<T>>, import("../types").ModelDocumentBaseFields>>)[], ctx?: TransactionCtx) => Promise<boolean>;
/**
 * The `crossFields` function recursively iterates over fields in a model and calls a callback function
 * for each field.
 * @param opts - - `model`: The model object that contains the fields.
 * @param cb - The `cb` parameter is a callback function that takes a `field` parameter and returns
 * either `void` or a `Promise<void>`. This callback function is called for each field in the
 * `fieldsMap`.
 * @returns The function `crossFields` is returning itself.
 */
export declare const crossFields: (opts: {
    model: typeof Model;
    fieldsMap?: Map<string, Field>;
}, cb: (field: Field) => void | Promise<void>) => any;
export declare const assignDatamodel: <T extends typeof Model>(model: T, datamodel: DataModel) => Promise<void>;
export declare const getModelInitPromise: (model: typeof Model, opts?: {
    datamodel?: DataModel;
    ctx?: TransactionCtx;
}) => Promise<void>;
export declare const isValidDefinition: (definition: ModelDefinition) => boolean;
