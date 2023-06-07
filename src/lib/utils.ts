import Model from "./Model";
import {
  AdapterFetcher,
  DocumentDefinition,
  FieldDefinition,
  FieldOptions,
  FieldOptionsMap,
  FieldsDefinition,
  FieldsPathItem,
  Hook,
  HookPhase,
  ValidateCtx,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
  ValidatorsDefinition,
} from "../types";
import FieldTypes from "../enums/field-types";
import defaultFieldsMap from "./defaultFieldsMap";
import Field from "./Field";
import ValidatorTypes from "../enums/validator-types";
import defaultValidatorsMap from "./defaultValidatorsMap";
import Validator from "./Validator";
import Adapter from "./Adapter";
import ValidationFieldError from "./ValidationFieldError";
import ValidationValidatorError from "./ValidationValidatorError";
import ValidationError from "./ValidationError";
import CoreError from "./CoreError";
import SerializerFormat from "../enums/serializer-format";

export const getRecursiveFieldsFromModel = (
  model: typeof Model
): FieldsDefinition => {
  const fields = {};

  do {
    const baseClass = model.getBaseClass();
    if (baseClass.hasOwnProperty("fields")) {
      const _modelFields = baseClass.fields || {};
      Object.assign(fields, _modelFields);
    }

    // @ts-ignore
    model = baseClass.__proto__;
  } while (model?.getBaseClass);

  return fields;
};

export const getRecursiveValidatorsFromModel = (
  model: typeof Model
): ValidatorsDefinition => {
  const validators: ValidatorsDefinition = [];
  const keyField = !model.single && model.keyField;

  do {
    const baseClass = model.getBaseClass();

    if (baseClass.hasOwnProperty("validators")) {
      const _modelValidators = baseClass.validators || [];

      Array.prototype.push.apply(validators, _modelValidators);
    }

    // @ts-ignore
    model = baseClass.__proto__;
  } while (model?.getBaseClass);

  if (keyField) {
    validators.push({
      type: ValidatorTypes.KEY_FIELD,
      options: { field: keyField },
    });

    return validators.filter((v) => {
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

export const getFieldsPathsFromPath = (
  model: typeof Model,
  pathArr: Array<string> | string
): Array<FieldsPathItem> => {
  pathArr = Array.isArray(pathArr) ? pathArr : pathArr.split(".");

  const firstFieldKey = pathArr.shift();
  const firstField = model.fieldsMap.get(firstFieldKey);
  const adapter = model.getAdapter(false);

  return pathArr.reduce(
    (fieldsPaths: Array<FieldsPathItem>, key: string) => {
      const prevField = fieldsPaths[fieldsPaths.length - 1]?.field;
      const pathStr = fieldsPaths.map((item) => item?.key).join(".");

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
              pathStr + ".[]"
            );

            return [...fieldsPaths, { key: `[${index}]`, field: itemsField }];
          }
        }

        const itemsField = getFieldFromDefinition(
          options.items,
          adapter,
          pathStr + ".[]"
        );

        fieldsPaths.push({ key: "[]", field: itemsField });

        if (matchIndex) {
          return fieldsPaths;
        }

        if (itemsField?.type === FieldTypes.NESTED) {
          const options = itemsField.options as FieldOptions<FieldTypes.NESTED>;
          const nextFieldDef = options.fields[key];
          const nextField = getFieldFromDefinition(
            nextFieldDef,
            adapter,
            pathStr + ".[]." + key
          );

          if (nextField) {
            return [...fieldsPaths, { key, field: nextField }];
          }
        }
      }

      if (prevField?.type === FieldTypes.NESTED) {
        const options = prevField.options as FieldOptions<FieldTypes.NESTED>;
        const nextFieldDef = options.fields[key];
        const nextField = getFieldFromDefinition(
          nextFieldDef,
          adapter,
          pathStr + "." + key
        );

        if (nextField) {
          return [...fieldsPaths, { key, field: nextField }];
        }
      }

      return [...fieldsPaths, null];
    },
    [firstField ? { key: firstFieldKey, field: firstField } : null]
  );
};

export const getRecursiveHooksFromModel = <
  A extends keyof AdapterFetcher,
  T extends typeof Model
>(
  model: T,
  action: A,
  phase: HookPhase
): Array<Hook<any, A, T>> => {
  const _hooks = [];

  do {
    const baseClass = model.getBaseClass();

    if (baseClass.hasOwnProperty("__hooks")) {
      const _modelHooks = Array.from(baseClass.__hooks || []).filter(
        (hook) => hook.action === action && hook.phase === phase
      );

      if (_modelHooks?.length) {
        Array.prototype.push.apply(_hooks, _modelHooks);
      }
    }

    if (
      baseClass.hasOwnProperty("__validatorsArray") &&
      baseClass.__validatorsArray
    ) {
      const _validatorsHooks = baseClass.__validatorsArray
        .map((validator) => {
          return validator.hooks
            ?.filter((hook) => hook[1] === action && hook[0] === phase)
            .map((hook) => parseValidatorHook(hook, validator));
        })
        .flat()
        .filter(Boolean);

      if (_validatorsHooks?.length) {
        Array.prototype.push.apply(_hooks, _validatorsHooks);
      }
    }

    // @ts-ignore
    model = baseClass.__proto__;
  } while (model?.getBaseClass);

  return _hooks.sort((a, b) => a.order - b.order);
};

export const getNestedFieldsMap = (
  model: typeof Model,
  nestedField: Field<FieldTypes.NESTED>
) => {
  const adapter = model.getAdapter();
  const map = new Map();

  Object.entries(nestedField.options.fields ?? {}).forEach(([slug, def]) => {
    const field = getFieldFromDefinition(
      def,
      adapter,
      nestedField.__path + "." + slug
    );

    if (field) {
      map.set(slug, field);
    }
  });

  return map;
};

export const parseValidatorHook = (
  hook: ValidatorHook,
  validator: Validator
): Hook<any, any, any> => {
  const [phase, action, executor] = hook;

  const fn = async function () {
    try {
      const validated = await executor.apply(this, arguments);
      if (!validated) {
        throw null;
      }
    } catch (err) {
      throw new ValidationValidatorError({ validator });
    }
  };

  return { phase, action, fn };
};

export const createFieldsMap = (
  model: typeof Model,
  assignFields?: FieldsDefinition
) => {
  const modelFields = getRecursiveFieldsFromModel(model);

  if (!model.systemFields) {
    delete modelFields._createdAt;
    delete modelFields._createdBy;
    delete modelFields._updatedAt;
    delete modelFields._updatedBy;
    delete modelFields.__system;
  }

  if (assignFields) {
    Object.assign(modelFields, assignFields);
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

export const createValidatorsArray = (
  model: typeof Model,
  assignValidators?: ValidatorsDefinition
): Array<Validator> => {
  let modelValidators = getRecursiveValidatorsFromModel(model);

  if (assignValidators?.length) {
    modelValidators = [...modelValidators, ...assignValidators];
  }

  const obj = {};
  const adapter = model.getAdapter(false);

  modelValidators.forEach((def) => {
    const validator = getValidatorFromDefinition(def, adapter, null);
    const key = validator.getKey();
    if (!obj[key]) {
      obj[key] = validator;
    }
  });

  return Object.values(obj);
};

export const getFieldFromDefinition = <
  T extends keyof FieldOptionsMap | FieldTypes
>(
  def: FieldDefinition<T>,
  adapter: Adapter,
  path: string,
  cachePath?: string
) => {
  if (!def || typeof def !== "object") {
    return null;
  }

  let FieldClass: typeof Field<T> = adapter?.fieldsMap?.[
    def.type
  ] as typeof Field<T>;

  if (!FieldClass) {
    FieldClass = defaultFieldsMap[def.type] as typeof Field<T>;
  }

  if (!FieldClass) {
    FieldClass = Field;
  }

  return new FieldClass(def, path);
};

export const getValidatorFromDefinition = <T extends ValidatorTypes>(
  def: ValidatorDefinition<T>,
  adapter: Adapter,
  path: string
) => {
  if (!def || typeof def !== "object") {
    return null;
  }

  let ValidatorClass: typeof Validator<T> = adapter?.validatorsMap?.[
    def.type
  ] as typeof Validator<T>;

  if (!ValidatorClass) {
    ValidatorClass = defaultValidatorsMap[def.type] as typeof Validator<T>;
  }

  if (!ValidatorClass) {
    ValidatorClass = Validator;
  }

  return new ValidatorClass(def, path);
};

export const validateDocs = async (
  docs: Array<DocumentDefinition>,
  {
    validators = [],
    fieldsEntries = [],
    bindDuplicatesValues = true,
  }: {
    validators?: Array<Validator>;
    fieldsEntries?: Array<[string, Field<FieldTypes>]>;
    bindDuplicatesValues?: boolean;
  } = {},
  ctx: ValidateCtx = {}
): Promise<boolean> => {
  const errorsFieldsSet = new Set<ValidationFieldError>();
  const errorsValidatorsSet = new Set<ValidationValidatorError>();

  const fieldValidations = fieldsEntries.map(([slug, field]) => {
    const list = bindDuplicatesValues
      ? Array.from(new Set(docs.map((doc) => doc[slug])))
      : docs.map((doc) => doc[slug]);

    return Promise.all(
      list.map(async (values) => {
        try {
          const validated = await field.validate(values, ctx, slug);
          if (!validated) {
            throw null;
          }
        } catch (err) {
          const e = new ValidationFieldError({
            slug,
            field,
            validationError: err instanceof ValidationError ? err : null,
          });

          errorsFieldsSet.add(e);
        }
      })
    );
  });

  const validatorValidations = validators.map((validator) => {
    return validator.validate(docs, ctx).then((validated) => {
      if (!validated) {
        const e = new ValidationValidatorError({ validator });
        errorsValidatorsSet.add(e);
      }
    });
  });

  await Promise.all([...fieldValidations, ...validatorValidations]);

  if (errorsFieldsSet.size || errorsValidatorsSet.size) {
    throw new ValidationError({
      fields: [...errorsFieldsSet],
      validators: [...errorsValidatorsSet],
    });
  }

  return true;
};

export const getDefaultFieldOptions = <T extends FieldTypes>(
  type: T
): FieldOptions<T> => {
  return {} as FieldOptions<T>;
};

export const getDefaultValidatorOptions = <T extends ValidatorTypes>(
  type: T
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

export const isObjectId = (input: string) => /^[a-f\d]{24}$/i.test(input);

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
              "cannot set undefined value with = operator. Please use .set method instead"
            );
            return;
          }

          return this.set(slug, v);
        },
      };
    }

    model.__fieldsProperties = properties;
  }

  Object.defineProperties(instance, model.__fieldsProperties);
};

export const getAdaptedModel = <M extends typeof Model = typeof Model>(
  model: M,
  adapterClass: typeof Adapter,
  override?: boolean
): M => {
  if (!adapterClass) {
    throw new CoreError({
      message: "Adapter is required in getAdaptedModel method",
    });
  }
  let adaptedModel: M;

  if (!override) {
    adaptedModel = adapterClass.__modelsMap?.get(model.slug) as M;
  }

  if (!adaptedModel) {
    adaptedModel = model.withAdapter(adapterClass);

    adapterClass.__modelsMap ??= new Map();
    adapterClass.__modelsMap.set(model.slug, adaptedModel);
  }

  return adaptedModel;
};

export const _getter = (opts: {
  _value: any;
  _fieldsPaths: Array<{ key: string; field: Field }>;
  _lastField?: Field;
  noFieldSymbol: Symbol;
  format: SerializerFormat | string;
  ctx: any;
  from: Model;
}) => {
  let { _value, _lastField } = opts;
  const { _fieldsPaths, noFieldSymbol, format, ctx, from } = opts;

  const lastField = _fieldsPaths[_fieldsPaths.length - 1]?.field;

  for (let i = 0; i < _fieldsPaths.length; i++) {
    const _fieldsPath = _fieldsPaths[i];
    if (!_fieldsPath) {
      return noFieldSymbol;
    }

    const { key, field } = _fieldsPath;

    if (
      format !== SerializerFormat.DOCUMENT &&
      _value === undefined &&
      "default" in field.options
    ) {
      _value = field.options.default as typeof _value;
    }

    if (_value === undefined || _value === null) {
      return _value;
    }

    let restPaths = _fieldsPaths.slice(i + 1);
    const matchIndex = key.match(/\[(\d+)?\]/);
    if (matchIndex) {
      if (!Array.isArray(_value)) {
        return noFieldSymbol;
      }

      if (matchIndex[1] === undefined) {
        const adapter = from.model.getAdapter();
        const _pathReplace = (p, fp) => {
          return p.field.__path.replace(field.__path, fp);
        };

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

          const res = _getter({
            ...opts,
            _value: v,
            _fieldsPaths: _restPaths,
            _lastField: lastField,
          });

          return res === noFieldSymbol ? undefined : res;
        });
      }

      const index = parseInt(matchIndex[1]);

      if (_value.length <= index) {
        return noFieldSymbol;
      }

      const res = _getter({
        ...opts,
        _value: _value[index],
        _fieldsPaths: restPaths,
        _lastField: lastField,
      });

      return res === noFieldSymbol ? undefined : res;
    }

    if (!_value || typeof _value !== "object") {
      break;
    }

    _value = field.serialize(
      _value[key],
      SerializerFormat.NEXT_FIELD,
      from,
      ctx
    );
  }

  _lastField ??= lastField;

  if (
    !_lastField ||
    (_lastField?.nextFieldEqObject && format === SerializerFormat.OBJECT)
  ) {
    return _value;
  }

  return _lastField.serialize(_value, format, from, ctx);
};

export const _setter = (opts: {
  _assignTo: any;
  _value: any;
  _fieldsPaths: Array<{ key: string | number; field: Field }>;
  _throw: () => void;
  ctx: any;
  from: Model;
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
            _fieldsPaths: [
              { key: index, field: assignPath.field },
              ...restPaths,
            ],
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
      ctx
    );

    return assignTo[assignPath.key];
  }

  return null;
};
