import Model from "@/lib/Model";
import {
  AdapterFetcher,
  FieldDefinition,
  FieldOptions,
  FieldOptionsMap,
  FieldsDefinition,
  FieldsPathItem,
  Hook,
  HookPhase,
  JSONSubtype,
  ModelDefinition,
  ModelDocument,
  ModelInstance,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
  ValidatorsDefinition,
} from "@/types";
import FieldTypes from "@/enums/field-types";
import defaultFieldsMap from "@/lib/defaultFieldsMap";
import Field from "@/lib/Field";
import ValidatorTypes from "@/enums/validator-types";
import defaultValidatorsMap from "@/lib/defaultValidatorsMap";
import Validator from "@/lib/Validator";
import Adapter from "@/lib/Adapter";
import ValidationValidatorError from "@/lib/ValidationValidatorError";
import SerializerFormat from "@/enums/serializer-format";
import ValidationFieldError from "@/lib/ValidationFieldError";
import ValidationError from "@/lib/ValidationError";
import type DataModel from "@/models/DataModel";
import Patterns from "@/enums/patterns";

export const crossModelTree = (_model: typeof Model, cb: (model: typeof Model) => void) => {
  let model = _model;

  do {
    cb(model);

    // @ts-expect-error __proto__ exists
    model = model.__proto__;
  } while (model && model !== Model);

  cb(Model);
};

/**
 * The function `getRecursiveFieldsFromModel` retrieves all fields from a model and its base classes
 * recursively.
 * @param model - The `model` parameter is of type `typeof Model`. It represents a class that extends
 * the `Model` class.
 * @returns the fields definition object.
 */
export const getRecursiveFieldsFromModel = (model: typeof Model): FieldsDefinition => {
  let fields = {};

  crossModelTree(model, m => {
    if (m.hasOwnProperty("definition")) {
      const _modelFields = m.definition.fields || {};

      fields = { ..._modelFields, ...fields };
    }
  });

  return fields;
};

/**
 * The function `getRecursiveValidatorsFromModel` retrieves all the validators defined in the base
 * classes of a given model, excluding validators related to the key field if it exists.
 * @param model - The `model` parameter is of type `typeof Model`. It represents a model class that
 * extends a base model class called `Model`.
 * @returns an array of validators.
 */
export const getRecursiveValidatorsFromModel = (model: typeof Model): ValidatorsDefinition => {
  const validators: ValidatorsDefinition = [];
  const keyField = model.getKeyField();

  crossModelTree(model, m => {
    if (m.hasOwnProperty("definition")) {
      const _modelValidators = m.definition.validators || [];

      Array.prototype.push.apply(validators, _modelValidators);
    }
  });

  if (keyField && keyField !== "_id") {
    validators.push({
      type: ValidatorTypes.KEY_FIELD,
      options: { field: keyField },
    });

    return validators.filter(v => {
      if (v.type === ValidatorTypes.UNIQUE && v.options?.field === keyField) {
        return false;
      }

      if (v.type === ValidatorTypes.REQUIRED && v.options?.field === keyField) {
        return false;
      }

      return true;
    });
  }

  return validators;
};

/**
 * The function `getFieldsPathsFromPath` takes a model and a path array or string as input and returns
 * an array of the decomposed fields path.
 * @param model - The `model` parameter is the type of the model that contains the fields. It is of
 * type `typeof Model`.
 * @param {Array<string> | string} pathArr - The `pathArr` parameter is either an array of strings or a
 * string. It represents the path to a specific field in a model.
 * @returns The function `getFieldsPathsFromPath` returns an array of `FieldsPathItem` objects.
 */
export const getFieldsPathsFromPath = (
  model: typeof Model,
  pathArr: Array<string> | string,
): Array<FieldsPathItem> => {
  pathArr = Array.isArray(pathArr) ? pathArr : pathArr.split(".");

  const firstFieldKey = pathArr.shift();
  const firstField = model.fieldsMap?.get(firstFieldKey);
  const adapter = model.getAdapter(false);

  return pathArr.reduce(
    (fieldsPaths: Array<FieldsPathItem>, key: string) => {
      const prevField = fieldsPaths[fieldsPaths.length - 1]?.field;
      const pathStr = fieldsPaths.map(item => item?.key).join(".");

      if (prevField?.type === FieldTypes.ARRAY) {
        const options = prevField.options as FieldOptions<FieldTypes.ARRAY>;

        const matchIndex = key.match(/\[(\d+)?\]/);
        if (matchIndex) {
          const index = matchIndex[1] ? parseInt(matchIndex[1]) : null;
          if (index !== null) {
            const itemsField = getFieldFromDefinition(
              options.items,
              adapter,
              pathStr + `.[${index}]`,
            );

            return [...fieldsPaths, { key: `[${index}]`, field: itemsField }];
          }
        }

        const itemsField = getFieldFromDefinition(options.items, adapter, pathStr + ".[]");

        fieldsPaths.push({ key: "[]", field: itemsField });

        if (matchIndex) {
          return fieldsPaths;
        }

        if (itemsField?.type === FieldTypes.NESTED) {
          const options = itemsField.options as FieldOptions<FieldTypes.NESTED>;
          const nextFieldDef = options.fields[key];
          const nextField = getFieldFromDefinition(nextFieldDef, adapter, pathStr + ".[]." + key);

          if (nextField) {
            return [...fieldsPaths, { key, field: nextField }];
          }
        }
      }

      if (prevField?.type === FieldTypes.NESTED) {
        const options = prevField.options as FieldOptions<FieldTypes.NESTED>;
        const nextFieldDef = options.fields?.[key] || options.defaultField;

        const nextField = getFieldFromDefinition(nextFieldDef, adapter, pathStr + "." + key);

        if (nextField) {
          return [...fieldsPaths, { key, field: nextField }];
        }
      }

      return [...fieldsPaths, null];
    },
    [firstField ? { key: firstFieldKey, field: firstField } : null],
  );
};

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
export const getRecursiveHooksFromModel = <
  A extends keyof AdapterFetcher,
  T extends typeof Model,
  P extends HookPhase,
>(
  model: T,
  action: A,
  phase: P,
): Array<Hook<P, A, T>> => {
  const _hooks = [];

  crossModelTree(model, m => {
    if (m.hasOwnProperty("__hooks")) {
      const _modelHooks = Array.from(m.__hooks || []).filter(
        hook => hook.action === action && hook.phase === phase,
      );

      if (_modelHooks?.length) {
        Array.prototype.push.apply(_hooks, _modelHooks);
      }
    }

    // if (m.hasOwnProperty("__validatorsArray") && m.__validatorsArray) {
    //   const _validatorsHooks = m.__validatorsArray
    //     .map((validator) => {
    //       return validator.hooks
    //         ?.filter((hook) => hook[1] === action && hook[0] === phase)
    //         .map((hook) => parseValidatorHook(hook, validator));
    //     })
    //     .flat()
    //     .filter(Boolean);

    //   if (_validatorsHooks?.length) {
    //     Array.prototype.push.apply(_hooks, _validatorsHooks);
    //   }
    // }
  });

  return _hooks.sort((a, b) => a.order - b.order);
};

/**
 * The function `getNestedFieldsMap` takes a model and a nested field as input, and returns a map of
 * the nested fields within the given field.
 * @param model - The `model` parameter is the type of the model that contains the nested field. It is
 * of type `typeof Model`.
 * @param nestedField - The `nestedField` parameter is of type `Field<FieldTypes.NESTED>`. It
 * represents a nested field in a model.
 * @returns The function `getNestedFieldsMap` returns a `Map` object.
 */
export const getNestedFieldsMap = (model: typeof Model, nestedField: Field<FieldTypes.NESTED>) => {
  const adapter = model.getAdapter();
  const map = new Map();

  Object.entries(nestedField.options.fields ?? {}).forEach(([slug, def]) => {
    const field = getFieldFromDefinition(def, adapter, nestedField.path + "." + slug);

    if (field) {
      map.set(slug, field);
    }
  });

  return map;
};

/**
 * The function `getNestedValidatorsArray` returns an array of validators for a nested field in a
 * model.
 * @param model - The `model` parameter is the type of the model that contains the nested field. It is
 * of type `typeof Model`.
 * @param nestedField - The `nestedField` parameter is of type `Field<FieldTypes.NESTED>`. It
 * represents a nested field in a model.
 * @returns an array of validators.
 */
export const getNestedValidatorsArray = (
  model: typeof Model,
  nestedField: Field<FieldTypes.NESTED>,
) => {
  const adapter = model.getAdapter();
  const validators = [];

  nestedField.options.validators?.forEach(def => {
    const validator = getValidatorFromDefinition(def, adapter, nestedField.path);

    if (validator) {
      validators.push(validator);
    }
  });

  return validators;
};

/**
 * The function `getArrayItemsFieldsMap` takes a model and an array field as input, and returns a map
 * of the fields within the array.
 * @param model - The `model` parameter is the model class that represents a database table or
 * collection. It is of type `typeof Model`.
 * @param arrayField - The `arrayField` parameter is a field of type `FieldTypes.ARRAY`. It represents
 * an array field in a model.
 * @returns a Map object.
 */
export const getArrayItemsFieldsMap = (
  model: typeof Model,
  arrayField: Field<FieldTypes.ARRAY>,
) => {
  const adapter = model.getAdapter();
  const map = new Map();

  const itemsField = getFieldFromDefinition(
    arrayField.options.items,
    adapter,
    arrayField.path + ".[]",
  );

  if (itemsField) {
    map.set("[]", itemsField);
  }

  return map;
};

/**
 * The function `getArrayValidatorsArray` returns an array of validators for a given array field in a
 * model.
 * @param model - The `model` parameter is the type of the model that contains the array field. It is
 * of type `typeof Model`.
 * @param arrayField - The `arrayField` parameter is of type `Field<FieldTypes.ARRAY>`. It represents a
 * field in a model that is of type array.
 * @returns an array of validators.
 */
export const getArrayValidatorsArray = (
  model: typeof Model,
  arrayField: Field<FieldTypes.ARRAY>,
) => {
  const adapter = model.getAdapter();
  const validators = [];

  arrayField.options.validators?.forEach(def => {
    const validator = getValidatorFromDefinition(
      def as ValidatorDefinition,
      adapter,
      arrayField.path + ".[]",
    );

    if (validator) {
      validators.push(validator);
    }
  });

  return validators;
};

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
export const parseValidatorHook = (hook: ValidatorHook, validator: Validator): Hook => {
  const [phase, action, executor] = hook;

  const fn = async function (...args) {
    try {
      const validated = await executor.apply(this, args);
      if (!validated) {
        throw null;
      }
    } catch (err) {
      throw new ValidationValidatorError({ validator });
    }
  };

  return { phase, action, fn };
};

/**
 * The `createFieldsMap` function creates a map of fields from a model/
 * @param model - The `model` parameter is the type of the model for which you want to create a fields
 * map. It is of type `typeof Model`.
 * @returns The function `createFieldsMap` returns a `Map` object.
 */
export const createFieldsMap = (model: typeof Model) => {
  const modelFields = getRecursiveFieldsFromModel(model);

  if (!model.systemFields) {
    delete modelFields._createdAt;
    delete modelFields._createdBy;
    delete modelFields._updatedAt;
    delete modelFields._updatedBy;
  }

  const map = new Map();
  const adapter = model.getAdapter(false);

  Object.entries(modelFields).forEach(([slug, def]) => {
    const field = getFieldFromDefinition(def, adapter, slug);

    if (field) {
      map.set(slug, field);
    }
  });

  return map;
};

/**
 * The function `createValidatorsArray` takes a model and returns an
 * array of validators based on the model.
 * @param model - The `model` parameter is the type of the model for which validators are being
 * created. It is of type `typeof Model`.
 * @returns The function `createValidatorsArray` returns an array of `Validator` objects.
 */
export const createValidatorsArray = (model: typeof Model): Array<Validator> => {
  const modelValidators = getRecursiveValidatorsFromModel(model);

  const adapter = model.getAdapter(false);

  return modelValidators.map(def => getValidatorFromDefinition(def, adapter, null));
};

/**
 * The getFieldClass function returns the appropriate Field class based on the given type and adapter.
 * @param {FieldTypes} type - The `type` parameter is of type `FieldTypes`. It represents the type of
 * field that is being requested.
 * @param {Adapter} [adapter] - The `adapter` parameter is an optional parameter of type `Adapter`. It
 * is used to provide a custom mapping of field types to field classes. If provided, the `adapter`
 * object should have a `fieldsMap` property which is an object mapping field types to field classes.
 * @returns The function `getFieldClass` returns the value of the variable `FieldClass`.
 */
export const getFieldClass = <T extends FieldTypes>(
  type: T,
  adapter?: Adapter,
): typeof Field<T> => {
  let FieldClass: typeof Field<T> = adapter?.fieldsMap?.[type];

  if (!FieldClass) {
    FieldClass = defaultFieldsMap[type];
  }

  if (!FieldClass) {
    FieldClass = Field;
  }

  return FieldClass;
};

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
export const getValidatorClass = <T extends ValidatorTypes>(
  type: T,
  adapter?: Adapter,
): typeof Validator<T> => {
  let ValidatorClass: typeof Validator<T> = adapter?.validatorsMap?.[type];

  if (!ValidatorClass) {
    ValidatorClass = defaultValidatorsMap[type];
  }

  if (!ValidatorClass) {
    ValidatorClass = Validator;
  }

  return ValidatorClass;
};

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
export const getFieldFromDefinition = <T extends keyof FieldOptionsMap | FieldTypes>(
  def: FieldDefinition<T>,
  adapter: Adapter,
  path: string,
) => {
  if (!def || typeof def !== "object") {
    return null;
  }

  // const cacheKey = path;

  // if (adapter?.cacheFieldsMap?.has(cacheKey)) {
  //   return adapter.cacheFieldsMap.get(cacheKey);
  // }

  const FieldClass = getFieldClass(def.type, adapter) as typeof Field<T>;

  const field = new FieldClass(def, path);

  // if (adapter) {
  //   adapter.cacheFieldsMap ??= new Map();
  //   adapter.cacheFieldsMap.set(cacheKey, field);
  // }

  return field;
};

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
export const getValidatorFromDefinition = <T extends ValidatorTypes>(
  def: ValidatorDefinition<T>,
  adapter: Adapter,
  path: string,
) => {
  if (!def || typeof def !== "object") {
    return null;
  }

  // const cacheKey = path + def.type + def.options?.field;

  // if (adapter?.cacheValidatorsMap?.has(cacheKey)) {
  //   return adapter.cacheValidatorsMap.get(cacheKey);
  // }

  const ValidatorClass = getValidatorClass(def.type, adapter) as typeof Validator<T>;

  const validator = new ValidatorClass(def, path);

  // if (adapter) {
  //   adapter.cacheValidatorsMap ??= new Map();
  //   adapter.cacheValidatorsMap.set(cacheKey, validator);
  // }

  return validator;
};

/**
 * The function `getDefaultFieldOptions` returns the default options for a given field type.
 * @param {T} type - The `type` parameter is a generic type `T` that extends `FieldTypes`. It is used
 * to specify the type of field for which the default options are being retrieved.
 * @returns An empty object of type `FieldOptions<T>`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFieldOptions = <T extends FieldTypes>(type: T): FieldOptions<T> => {
  return {} as FieldOptions<T>;
};

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
export const getDefaultValidatorOptions = <T extends ValidatorTypes>(
  type: T,
): ValidatorOptions<T> => {
  switch (type) {
    case ValidatorTypes.LENGTH:
    case ValidatorTypes.BOUNDARIES:
      return {
        min: -Infinity,
        max: Infinity,
      } as ValidatorOptions<T>;
    default:
      return {} as ValidatorOptions<T>;
  }
};

export const isObjectId = (input: JSONSubtype) => /^[a-f\d]{24}$/i.test(String(input));

/**
 * The function `defineFieldsProperties` defines properties on an instance object based on the fields
 * of a model.
 * @param {Model} instance - The `instance` parameter is an object of type `Model`.
 * @returns There is no explicit return statement in the code provided. Therefore, the function
 * `defineFieldsProperties` does not return anything.
 */
export const defineFieldsProperties = (instance: Model) => {
  const { model } = instance;

  if (!model.__fieldsProperties) {
    const properties = {};
    for (const slug of model.fieldsKeys) {
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

    model.__fieldsProperties = properties;
  }

  // @ts-expect-error __fieldsProperties
  Object.defineProperties(instance, model.__fieldsProperties);
};

const _pathReplace = (field: Field, p, fp) => {
  return p.field.path.replace(field.path, fp);
};

/**
 * The `_getter` function is a helper function that retrieves values from an object based on a given
 * set of fields and paths.
 * @param opts - The `opts` parameter is an object that contains the following properties:
 * - `value` - The `value` property is the value to be retrieved from the object. It is of type
 * `any`.
 * - `fieldsPaths` - The `fieldsPaths` property is an array of `FieldsPathItem` objects. It is used
 * to determine which fields to retrieve from the object.
 * - `lastField` - The `lastField` property is the last field in the `fieldsPaths` array. It is of
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
export const _getter = (opts: {
  value?: JSONSubtype;
  fieldsPaths: Array<{ key: string; field: Field }>;
  lastField?: Field;
  noFieldSymbol: symbol;
  format: string;
  ctx: SerializerCtx;
  from: Model;
}) => {
  let { value } = opts;
  const { fieldsPaths, noFieldSymbol, format, from, ctx } = opts;
  const lastField = fieldsPaths[fieldsPaths.length - 1]?.field ?? opts.lastField;

  for (let i = 0; i < fieldsPaths.length; i++) {
    const fieldsPath = fieldsPaths[i];
    if (!fieldsPath) {
      return noFieldSymbol;
    }

    const { key, field } = fieldsPath;

    const defaults = ctx?.defaults ?? format !== SerializerFormat.DOCUMENT;
    if (defaults && value === undefined && "default" in field.options) {
      value = field.options.default as typeof value;
    }

    if (value === undefined || value === null) {
      return value;
    }

    const restPaths = fieldsPaths.slice(i + 1);
    const matchIndex = key.match(/\[(\d+)?\]/);
    if (matchIndex) {
      if (!Array.isArray(value)) {
        return noFieldSymbol;
      }

      if (matchIndex[1] === undefined) {
        const adapter = from.model.getAdapter();

        return value.map((v, fi) => {
          const thisPath = field.path.replace(/\[\]$/, `[${fi}]`);
          const _restPaths = restPaths.map(p => {
            if (!p) {
              return p;
            }

            return {
              ...p,
              field: getFieldFromDefinition(
                p.field.definition,
                adapter,
                _pathReplace(field, p, thisPath),
              ),
            };
          });

          const res = _getter({
            ...opts,
            value: v,
            fieldsPaths: _restPaths,
            lastField: lastField,
          });

          return res === noFieldSymbol ? undefined : res;
        });
      }

      const index = parseInt(matchIndex[1]);

      if (value.length <= index) {
        return noFieldSymbol;
      }

      const res = _getter({
        ...opts,
        value: value[index],
        fieldsPaths: restPaths,
        lastField: lastField,
      });

      return res === noFieldSymbol ? undefined : res;
    }

    if (!value || typeof value !== "object") {
      break;
    }

    const n = value[key];

    if (n === undefined || n === null) {
      return n;
    }

    if (field === lastField) {
      value = n;
    } else {
      value = field.serialize(n, SerializerFormat.NEXT_FIELD, from, ctx);
    }
  }

  if (!lastField || (lastField?.nextFieldEqObject && format === SerializerFormat.OBJECT)) {
    return value;
  }

  return lastField.serialize(value, format, from, ctx);
};

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
export const _setter = <T extends typeof Model>(opts: {
  _assignTo: ModelDocument<T> | Array<ModelDocument<T>>;
  _value: JSONSubtype;
  _fieldsPaths: Array<{ key: string | number; field: Field }>;
  _throw: () => void;
  ctx: TransactionCtx;
  from: ModelInstance<T>;
}) => {
  const { _assignTo, _fieldsPaths, _throw, _value, ctx, from } = opts;

  let assignTo = _assignTo;
  let assignPath = _fieldsPaths.shift();

  for (let i = 0; i < _fieldsPaths.length; i++) {
    const _fieldsPath = _fieldsPaths[i];
    if (!_fieldsPath) {
      _throw();
    }

    assignTo[assignPath.key] ??= {};
    assignTo = assignTo[assignPath.key];
    assignPath = _fieldsPath;

    if (assignPath.key === "[]") {
      if (Array.isArray(assignTo) && assignTo.length) {
        const restPaths = _fieldsPaths.slice(i + 1);
        assignTo = assignTo.map((_, index) => {
          return _setter({
            ...opts,
            _assignTo: assignTo,
            _fieldsPaths: [{ key: index, field: assignPath.field }, ...restPaths],
          });
        });
      }

      return assignTo;
    }
  }

  if (assignPath?.field && assignTo && typeof assignTo === "object") {
    assignTo[assignPath.key] = assignPath.field.serialize(
      _value,
      SerializerFormat.DOCUMENT,
      from,
      ctx,
    );

    return assignTo[assignPath.key];
  }

  return null;
};

/**
 * The function `getNestedFieldsArrayForModel` recursively retrieves all nested fields for a given
 * model.
 * @param model - The `model` parameter is the type of the model for which we want to retrieve the
 * nested fields array.
 * @returns The function `getNestedFieldsArrayForModel` returns an array of `Field` objects.
 */
export const getNestedFieldsArrayForModel = (model: typeof Model): Array<Field> => {
  const res: Array<Field> = [];

  crossFields({ model }, field => {
    res.push(field);
  });

  return res;
};

/**
 * The function `validateValidators` asynchronously validates a set of validators on a given model and
 * adds any validation errors to a set.
 * @param  - - `validators`: An array of tuples, where each tuple contains a `Validator` object and an
 * array of `ModelInstance` objects.
 */
async function validateFields<T extends typeof Model>(opts: {
  fields: Array<Field>;
  on: Array<ModelInstance<T>>;
  model: T;
  ctx?: TransactionCtx;
  errorsFieldsSet: Set<ValidationFieldError>;
  fieldsValidators: Array<[Validator, Array<ModelInstance<T>>]>;
  fieldsValidatorsKeys: Set<string>;
}) {
  const { fields, on, model, ctx, errorsFieldsSet, fieldsValidators, fieldsValidatorsKeys } = opts;

  for (const field of fields) {
    const { type, path } = field;

    try {
      const validated = await field.validate(on, model, ctx);
      if (!validated) {
        throw null;
      }

      if (type === FieldTypes.NESTED) {
        const values = on
          .map(i => i.get(path, SerializerFormat.VALIDATION))
          .flat(Infinity)
          .filter(Boolean);

        if (values?.length) {
          const _field = field as Field<FieldTypes.NESTED>;
          const o = _field.options || {};
          if (o.defaultField) {
            const noField = values.map(v => Object.keys(v).filter(k => !o.fields?.[k])).flat();

            if (noField?.length) {
              const adapter = model.getAdapter();
              const _process = async (_path, _list: Array<ModelInstance<T>>) => {
                const tmpField = getFieldFromDefinition(o.defaultField, adapter, _path);

                const promises = [
                  validateFields({
                    ...opts,
                    fields: [tmpField],
                    on: _list,
                  }),
                ];

                if (tmpField?.type === FieldTypes.NESTED) {
                  const fields = getNestedFieldsMap(model, tmpField as Field<FieldTypes.NESTED>);

                  promises.push(
                    validateFields({
                      ...opts,
                      fields: Array.from(fields.values()),
                      on: _list,
                    }),
                  );
                }

                await Promise.all(promises);
              };

              await Promise.all(
                noField.map(async k => {
                  const path = _field.path + `.${k}`;

                  const valuesMap = new Map<
                    string,
                    { list: Array<ModelInstance<T>>; arrayLength?: number }
                  >();

                  on.forEach(i => {
                    const value = i.get(path, SerializerFormat.VALIDATION);
                    if (value && !(Array.isArray(value) && value.length === 0)) {
                      const str = JSON.stringify({ value });
                      let entry = valuesMap.get(str);
                      if (!entry) {
                        entry = {
                          list: [],
                          arrayLength: Array.isArray(value) ? value.length : undefined,
                        };
                        valuesMap.set(str, entry);
                      }
                      entry.list.push(i);
                    }
                  });

                  if (valuesMap.size) {
                    await Promise.all(
                      Array.from(valuesMap.values()).map(async i => {
                        if (i.arrayLength !== undefined) {
                          await Promise.all(
                            [...Array(i.arrayLength)].map((_, j) =>
                              _process(path.replace(/\[\]/, `[${j}]`), i.list),
                            ),
                          );
                        } else {
                          await _process(path, i.list);
                        }
                      }),
                    );
                  }
                }),
              );
            }
          }

          getNestedValidatorsArray(model, _field).forEach(v => {
            const key = v.getKey();
            if (!fieldsValidatorsKeys.has(key)) {
              fieldsValidators.push([v, on]);
              fieldsValidatorsKeys.add(key);
            }
          });
        }
      }

      if (type === FieldTypes.ARRAY) {
        const _field = field as Field<FieldTypes.ARRAY>;
        const entries = on
          .map(i => [i, i.get(path, SerializerFormat.VALIDATION)])
          .filter(e => Boolean(e[1]));
        const values = entries
          .map(e => e[1])
          .flat(Infinity)
          .filter(Boolean);

        if (values?.length) {
          const validators = getArrayValidatorsArray(model, _field);
          const _on = entries.map(e => e[0]);

          validators.forEach(v => {
            const key = v.getKey();
            if (!fieldsValidatorsKeys.has(key)) {
              fieldsValidators.push([v, _on]);
              fieldsValidatorsKeys.add(key);
            }
          });

          const fields = getArrayItemsFieldsMap(model, _field);
          // await validateFields(Array.from(fields.values()), _on);
          await validateFields({
            ...opts,
            fields: Array.from(fields.values()),
            on: _on,
          });
        }
      }
    } catch (err) {
      const e = new ValidationFieldError({
        slug: field.path.split(".").pop(),
        field,
        validationError: err instanceof ValidationError ? err : null,
      });

      errorsFieldsSet.add(e);
    }
  }
}

/**
 * The function `validateValidators` asynchronously validates a set of validators on a given model and
 * adds any validation errors to a set.
 * @param  - - `validators`: An array of tuples, where each tuple contains a `Validator` object and an
 * array of `ModelInstance` objects.
 */
async function validateValidators<T extends typeof Model>({
  validators,
  model,
  ctx,
  errorsValidatorsSet,
}: {
  validators: Array<[Validator, Array<ModelInstance<T>>]>;
  model: T;
  ctx?: TransactionCtx;
  errorsValidatorsSet: Set<ValidationValidatorError>;
}) {
  await Promise.all(
    validators.map(async ([validator, on]) => {
      try {
        const validated = await validator.validate(on, model, ctx);
        if (!validated) {
          throw null;
        }
      } catch (err) {
        const e = new ValidationValidatorError({
          validator,
        });

        errorsValidatorsSet.add(e);
      }
    }),
  );
}

/**
 * The `validateModel` function is a TypeScript function that validates a list of model instances
 * against their defined fields and validators, throwing a `ValidationError` if any errors are found.
 * @param {T} model - The `model` parameter is the type of the model that you want to validate. It
 * should be a subclass of the `Model` class.
 * @param list - The `list` parameter is an array of either `ModelInstance<T>` or `ModelDocument<T>`.
 * @param {TransactionCtx} [ctx] - The `ctx` parameter is an optional parameter of type
 * `TransactionCtx`. It is used to pass a transaction context to the validation process. This allows
 * the validation to be performed within a transaction, ensuring that any changes made during the
 * validation can be rolled back if necessary. If no transaction context is provided
 * @returns a boolean value of `true`.
 */
export const validateModel = async <T extends typeof Model>(
  model: T,
  list: Array<ModelInstance<T> | ModelDocument<T>>,
  ctx?: TransactionCtx,
) => {
  const errorsFieldsSet = new Set<ValidationFieldError>();
  const errorsValidatorsSet = new Set<ValidationValidatorError>();
  const fieldsValidatorsKeys = new Set<string>();
  const fieldsValidators: Array<[Validator, Array<ModelInstance<T>>]> = [];

  const instances = list.map(i => (i instanceof Model ? i : new model(i))) as Array<
    ModelInstance<T>
  >;

  const promises: Array<Promise<void>> = [
    validateFields({
      fields: getNestedFieldsArrayForModel(model),
      on: instances,
      model,
      ctx,
      errorsFieldsSet,
      fieldsValidators,
      fieldsValidatorsKeys,
    }),
  ];

  if (model.validatorsArray?.length) {
    promises.push(
      validateValidators({
        validators: model.validatorsArray.map(v => [v, instances]),
        model,
        ctx,
        errorsValidatorsSet,
      }),
    );
  }

  await Promise.all(promises);

  if (fieldsValidatorsKeys.size && !errorsFieldsSet.size && !errorsValidatorsSet.size) {
    await validateValidators({
      validators: fieldsValidators,
      model,
      ctx,
      errorsValidatorsSet,
    });
  }

  if (errorsFieldsSet.size || errorsValidatorsSet.size) {
    throw new ValidationError({
      fields: [...errorsFieldsSet],
      validators: [...errorsValidatorsSet],
    });
  }

  return true;
};

/**
 * The `crossFields` function recursively iterates over fields in a model and calls a callback function
 * for each field.
 * @param opts - - `model`: The model object that contains the fields.
 * @param cb - The `cb` parameter is a callback function that takes a `field` parameter and returns
 * either `void` or a `Promise<void>`. This callback function is called for each field in the
 * `fieldsMap`.
 * @returns The function `crossFields` is returning itself.
 */
export const crossFields = (
  opts: {
    model: typeof Model;
    fieldsMap?: Map<string, Field>;
  },
  cb: (field: Field) => void | Promise<void>,
) => {
  const { model } = opts;
  const fieldsMap = opts.fieldsMap || opts.model.fieldsMap;

  fieldsMap.forEach(field => {
    cb(field);

    if (field.type === FieldTypes.ARRAY) {
      crossFields(
        {
          model,
          fieldsMap: getArrayItemsFieldsMap(model, field as Field<FieldTypes.ARRAY>),
        },
        cb,
      );
    } else if (field.type === FieldTypes.NESTED) {
      crossFields(
        {
          model,
          fieldsMap: getNestedFieldsMap(model, field as Field<FieldTypes.NESTED>),
        },
        cb,
      );
    }
  });

  return crossFields;
};

export const assignDatamodel = async <T extends typeof Model>(model: T, datamodel: DataModel) => {
  if (!datamodel) {
    model.definition = {};
    model.__dm = null;
    return;
  }

  model.definition = (datamodel.getDoc()?.definition ?? {}) as ModelDefinition;

  model.__fieldsMap = createFieldsMap(model);
  model.__validatorsArray = createValidatorsArray(model);

  delete model.__fieldsProperties;
  delete model.__fieldsKeys;
  model.__dm = String(datamodel._id);
};

export const getModelInitPromise = (
  model: typeof Model,
  opts: {
    datamodel?: DataModel;
    ctx?: TransactionCtx;
  } = {},
) => {
  const { datamodel, ctx } = opts;

  return new Promise<void>(async (resolve, reject) => {
    try {
      const hooksBefore = getRecursiveHooksFromModel(model, "initialize", "before");

      await hooksBefore.reduce(async (p, hook) => {
        await p;
        return hook.fn.call(model);
      }, Promise.resolve());

      if (model.extensible) {
        await model.reloadModel({ datamodel, ctx });
      }

      const hooksAfter = getRecursiveHooksFromModel(model, "initialize", "after");

      await hooksAfter.reduce(async (p, hook) => {
        await p;
        return hook.fn.call(model);
      }, Promise.resolve());
    } catch (e) {
      return reject(e);
    }

    resolve();
  });
};

export const isValidDefinition = (definition: ModelDefinition) => {
  const fields = definition?.fields;

  if (fields) {
    const keys = Object.keys(fields || {});

    const regex = new RegExp(Patterns.SLUG);
    for (const key of keys) {
      if (!regex.test(key)) {
        return false;
      }
    }
  }

  const keyField = definition?.keyField;

  if (keyField) {
    const keyFieldField = fields?.[keyField];

    if (!keyFieldField) {
      return false;
    }

    if (keyFieldField.type !== FieldTypes.TEXT) {
      return false;
    }

    if (keyFieldField.options?.default) {
      return false;
    }
  }

  return true;
};
