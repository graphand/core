import Model from "./Model";
import {
  AdapterFetcher,
  FieldDefinition,
  FieldOptions,
  FieldOptionsMap,
  FieldsDefinition,
  FieldsPathItem,
  Hook,
  HookPhase,
  InputModelPayload,
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
import ValidationValidatorError from "./ValidationValidatorError";
import CoreError from "./CoreError";
import SerializerFormat from "../enums/serializer-format";
import ValidationFieldError from "./ValidationFieldError";
import ValidationError from "./ValidationError";

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
              pathStr + `.[${index}]`
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
        const nextFieldDef = options.fields?.[key] || options.defaultField;

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

export const getNestedValidatorsArray = (
  model: typeof Model,
  nestedField: Field<FieldTypes.NESTED>
) => {
  const adapter = model.getAdapter();
  const validators = [];

  nestedField.options.validators?.forEach((def) => {
    const validator = getValidatorFromDefinition(
      def,
      adapter,
      nestedField.__path
    );

    if (validator) {
      validators.push(validator);
    }
  });

  return validators;
};

export const getArrayItemsFieldsMap = (
  model: typeof Model,
  arrayField: Field<FieldTypes.ARRAY>
) => {
  const adapter = model.getAdapter();
  const map = new Map();

  const itemsField = getFieldFromDefinition(
    arrayField.options.items,
    adapter,
    arrayField.__path + ".[]"
  );

  if (itemsField) {
    map.set("[]", itemsField);
  }

  return map;
};

export const getArrayValidatorsArray = (
  model: typeof Model,
  arrayField: Field<FieldTypes.ARRAY>
) => {
  const adapter = model.getAdapter();
  const validators = [];

  arrayField.options.validators?.forEach((def) => {
    const validator = getValidatorFromDefinition(
      def as ValidatorDefinition,
      adapter,
      arrayField.__path + ".[]"
    );

    if (validator) {
      validators.push(validator);
    }
  });

  return validators;
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

  const adapter = model.getAdapter(false);

  return modelValidators.map((def) =>
    getValidatorFromDefinition(def, adapter, null)
  );
};

export const getFieldClass = (type: FieldTypes, adapter?: Adapter) => {
  let FieldClass: typeof Field<any> = adapter?.fieldsMap?.[type];

  if (!FieldClass) {
    FieldClass = defaultFieldsMap[type];
  }

  if (!FieldClass) {
    FieldClass = Field;
  }

  return FieldClass;
};

export const getValidatorClass = (type: ValidatorTypes, adapter?: Adapter) => {
  let ValidatorClass: typeof Validator<any> = adapter?.validatorsMap?.[type];

  if (!ValidatorClass) {
    ValidatorClass = defaultValidatorsMap[type];
  }

  if (!ValidatorClass) {
    ValidatorClass = Validator;
  }

  return ValidatorClass;
};

export const getFieldFromDefinition = <
  T extends keyof FieldOptionsMap | FieldTypes
>(
  def: FieldDefinition<T>,
  adapter: Adapter,
  path: string
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

export const getValidatorFromDefinition = <T extends ValidatorTypes>(
  def: ValidatorDefinition<T>,
  adapter: Adapter,
  path: string
) => {
  if (!def || typeof def !== "object") {
    return null;
  }

  // const cacheKey = path + def.type + def.options?.field;

  // if (adapter?.cacheValidatorsMap?.has(cacheKey)) {
  //   return adapter.cacheValidatorsMap.get(cacheKey);
  // }

  const ValidatorClass = getValidatorClass(
    def.type,
    adapter
  ) as typeof Validator<T>;

  const validator = new ValidatorClass(def, path);

  // if (adapter) {
  //   adapter.cacheValidatorsMap ??= new Map();
  //   adapter.cacheValidatorsMap.set(cacheKey, validator);
  // }

  return validator;
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

const _pathReplace = (field: Field, p, fp) => {
  return p.field.__path.replace(field.__path, fp);
};

export const _getter = (opts: {
  _value?: any;
  _fieldsPaths: Array<{ key: string; field: Field }>;
  _lastField?: Field;
  noFieldSymbol: Symbol;
  format: SerializerFormat | string;
  ctx: any;
  from: Model;
}) => {
  let { _value, _lastField } = opts;
  const { _fieldsPaths, noFieldSymbol, format, from, ctx } = opts;
  const lastField = _fieldsPaths[_fieldsPaths.length - 1]?.field;
  _lastField ??= lastField;

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
                _pathReplace(field, p, thisPath)
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

    const n = _value[key];

    if (n === undefined || n === null) {
      return n;
    }

    if (field === _lastField) {
      _value = n;
    } else {
      _value = field.serialize(n, SerializerFormat.NEXT_FIELD, from, ctx);
    }
  }

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

export const getNestedFieldsArrayForModel = (
  model: typeof Model
): Array<Field> => {
  const res: Array<Field> = [];

  const _processFieldsMap = (fieldsMap: Map<string, Field>) => {
    fieldsMap.forEach((field) => {
      res.push(field);

      if (field.type === FieldTypes.NESTED) {
        const map = getNestedFieldsMap(
          model,
          field as Field<FieldTypes.NESTED>
        );

        _processFieldsMap(map);
      }

      if (field.type === FieldTypes.ARRAY) {
        const map = getArrayItemsFieldsMap(
          model,
          field as Field<FieldTypes.ARRAY>
        );

        _processFieldsMap(map);
      }
    });
  };

  _processFieldsMap(model.fieldsMap);

  return res;
};

export const validateModel = async <T extends typeof Model>(
  model: T,
  list: Array<InstanceType<T> | InputModelPayload<T>>,
  ctx: ExecutorCtx = {}
) => {
  const errorsFieldsSet = new Set<ValidationFieldError>();
  const errorsValidatorsSet = new Set<ValidationValidatorError>();

  const instances = list.map((i) =>
    i instanceof Model ? i : new model({ ...i })
  ) as Array<InstanceType<T>>;

  const fieldsValidatorsKeys = new Set<string>();
  const fieldsValidators: Array<[Validator, Array<InstanceType<T>>]> = [];

  ctx.model = model;

  const _processFields = async (fields: Array<Field>, on = instances) => {
    for (const field of fields) {
      const { type, path } = field;

      try {
        const validated = await field.validate(on, ctx);
        if (!validated) {
          throw null;
        }

        if (type === FieldTypes.NESTED) {
          const values = on
            .map((i) => i.get(path, SerializerFormat.VALIDATION))
            .flat(Infinity)
            .filter(Boolean);

          if (values?.length) {
            const _field = field as Field<FieldTypes.NESTED>;
            const o = _field.options || {};
            if (o.defaultField) {
              const noField = values
                .map((v) => Object.keys(v).filter((k) => !o.fields?.[k]))
                .flat();

              if (noField?.length) {
                const adapter = model.getAdapter();
                const _process = async (
                  _path,
                  list: Array<InstanceType<T>>
                ) => {
                  const tmpField = getFieldFromDefinition(
                    o.defaultField,
                    adapter,
                    _path
                  );

                  const promises = [_processFields([tmpField], list)];

                  if (tmpField?.type === FieldTypes.NESTED) {
                    const fields = getNestedFieldsMap(
                      model,
                      tmpField as Field<FieldTypes.NESTED>
                    );

                    promises.push(
                      _processFields(Array.from(fields.values()), list)
                    );
                  }

                  await Promise.all(promises);
                };

                await Promise.all(
                  noField.map(async (k) => {
                    const path = _field.__path + `.${k}`;

                    const valuesMap = new Map<
                      string,
                      { list: Array<InstanceType<T>>; arrayLength?: number }
                    >();

                    on.forEach((i) => {
                      const value = i.get(path, SerializerFormat.VALIDATION);
                      if (value && !(Array.isArray(value) && !value.length)) {
                        const str = JSON.stringify({ value });
                        if (!valuesMap.has(str)) {
                          valuesMap.set(str, {
                            list: [],
                            arrayLength: Array.isArray(value)
                              ? value.length
                              : undefined,
                          });
                        }

                        valuesMap.get(str).list.push(i);
                      }
                    });

                    if (valuesMap.size) {
                      await Promise.all(
                        Array.from(valuesMap.values()).map(
                          async ({ list, arrayLength }) => {
                            if (arrayLength !== undefined) {
                              await Promise.all(
                                Array.from({ length: arrayLength }).map(
                                  (v, j) =>
                                    _process(
                                      path.replace(/\[\]/, `[${j}]`),
                                      list
                                    )
                                )
                              );
                            } else {
                              await _process(path, list);
                            }
                          }
                        )
                      );
                    }
                  })
                );
              }
            }

            getNestedValidatorsArray(model, _field).forEach((v) => {
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
            .map((i) => [i, i.get(path, SerializerFormat.VALIDATION)])
            .filter((e) => Boolean(e[1]));
          const values = entries
            .map((e) => e[1])
            .flat(Infinity)
            .filter(Boolean);

          if (values?.length) {
            const validators = getArrayValidatorsArray(model, _field);
            const _on = entries.map((e) => e[0]);

            validators.forEach((v) => {
              const key = v.getKey();
              if (!fieldsValidatorsKeys.has(key)) {
                fieldsValidators.push([v, _on]);
                fieldsValidatorsKeys.add(key);
              }
            });

            const fields = getArrayItemsFieldsMap(model, _field);
            await _processFields(Array.from(fields.values()), _on);
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
  };

  const _processValidators = async (
    validators: Array<[Validator, Array<InstanceType<T>>]>
  ) => {
    await Promise.all(
      validators.map(async ([validator, on]) => {
        try {
          const validated = await validator.validate(on, ctx);
          if (!validated) {
            throw null;
          }
        } catch (err) {
          const e = new ValidationValidatorError({
            validator,
          });

          errorsValidatorsSet.add(e);
        }
      })
    );
  };

  const _verify = () => {
    if (errorsFieldsSet.size || errorsValidatorsSet.size) {
      throw new ValidationError({
        fields: [...errorsFieldsSet],
        validators: [...errorsValidatorsSet],
      });
    }
  };

  await _processFields(getNestedFieldsArrayForModel(model));

  _verify();

  if (model.validatorsArray?.length) {
    await _processValidators(model.validatorsArray.map((v) => [v, instances]));

    _verify();
  }

  if (fieldsValidatorsKeys.size) {
    await _processValidators(fieldsValidators);

    _verify();
  }

  return true;
};
