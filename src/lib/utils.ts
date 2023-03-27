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
import ErrorCodes from "../enums/error-codes";

export const getRecursiveFieldsFromModel = (
  model: typeof Model
): FieldsDefinition => {
  let fields = {};

  do {
    const baseClass = model.getBaseClass();
    if (baseClass.hasOwnProperty("fields")) {
      const _modelFields = baseClass.fields || {};

      fields = { ...fields, ..._modelFields };
    }

    // @ts-ignore
    model = baseClass.__proto__;
  } while (model?.getBaseClass);

  return fields;
};

export const getRecursiveValidatorsFromModel = (
  model: typeof Model
): ValidatorsDefinition => {
  let validators: ValidatorsDefinition = [];
  const baseClass = model.getBaseClass();

  if (baseClass.configKey) {
    validators.push({
      type: ValidatorTypes.CONFIG_KEY,
      options: { field: baseClass.configKey },
    });
  }

  do {
    const baseClass = model.getBaseClass();

    if (baseClass.hasOwnProperty("validators")) {
      const _modelValidators = baseClass.validators || [];

      validators = [...validators, ..._modelValidators];
    }

    // @ts-ignore
    model = baseClass.__proto__;
  } while (model?.getBaseClass);

  return validators;
};

export const getFieldsPathsFromPath = (
  model: typeof Model,
  pathArr: Array<string> | string
): Array<FieldsPathItem> => {
  pathArr = Array.isArray(pathArr) ? pathArr : pathArr.split(".");

  const firstFieldKey = pathArr.shift();
  const firstField = model.fieldsMap.get(firstFieldKey);

  return pathArr.reduce(
    (fieldsPaths: Array<FieldsPathItem>, key: string) => {
      const prevField = fieldsPaths[fieldsPaths.length - 1]?.field;
      const pathStr = fieldsPaths.map((item) => item?.key).join(".");

      if (prevField?.type === FieldTypes.ARRAY) {
        const options = prevField.options as FieldOptions<FieldTypes.ARRAY>;
        const itemsField = getFieldFromDefinition(
          options.items,
          model.__adapter,
          pathStr + ".[]"
        );

        if (key === "[]") {
          return [...fieldsPaths, { key: "[]", field: itemsField }];
        }

        fieldsPaths = [...fieldsPaths, { key: "[]", field: itemsField }];

        if (itemsField?.type === FieldTypes.JSON) {
          const options = itemsField.options as FieldOptions<FieldTypes.JSON>;
          const nextFieldDef = options.fields[key];
          const nextField = getFieldFromDefinition(
            nextFieldDef,
            model.__adapter,
            pathStr + ".[]." + key
          );

          if (nextField) {
            return [...fieldsPaths, { key, field: nextField }];
          }
        }
      }

      if (prevField?.type === FieldTypes.JSON) {
        const options = prevField.options as FieldOptions<FieldTypes.JSON>;
        const nextFieldDef = options.fields[key];
        const nextField = getFieldFromDefinition(
          nextFieldDef,
          model.__adapter,
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
  let _hooks = [];
  do {
    const baseClass = model.getBaseClass();

    if (baseClass.hasOwnProperty("__hooks")) {
      const _modelHooks = Array.from(baseClass.__hooks || []).filter(
        (hook) => hook.action === action && hook.phase === phase
      );

      if (_modelHooks?.length) {
        _hooks = _hooks.concat(_modelHooks);
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
        _hooks = _hooks.concat(_validatorsHooks);
      }
    }

    // @ts-ignore
    model = baseClass.__proto__;
  } while (model?.getBaseClass);

  return _hooks.sort((a, b) => a.order - b.order);
};

export const getJSONSubfieldsMap = (
  model: typeof Model,
  jsonField: Field<FieldTypes.JSON>
) => {
  const subfieldsEntries: Array<[string, Field]> = Object.entries(
    jsonField.options.fields ?? {}
  ).map(([slug, def]) => {
    const field = getFieldFromDefinition(
      def,
      model.__adapter,
      jsonField.__path + "." + slug
    );

    return [slug, field];
  });
  return new Map(subfieldsEntries);
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
  let modelFields = getRecursiveFieldsFromModel(model);

  if (assignFields) {
    modelFields = { ...modelFields, ...assignFields };
  }

  const fieldsEntries: Array<[string, Field]> = Object.entries(modelFields).map(
    ([slug, def]) => {
      return [slug, getFieldFromDefinition(def, model.__adapter, slug)];
    }
  );

  return new Map(fieldsEntries);
};

export const createValidatorsArray = (
  model: typeof Model,
  assignValidators?: ValidatorsDefinition
) => {
  let modelValidators = getRecursiveValidatorsFromModel(model);

  if (assignValidators?.length) {
    modelValidators = [...modelValidators, ...assignValidators];
  }

  return modelValidators.map((def) => {
    return getValidatorFromDefinition(def, model.__adapter);
  });
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

  let cacheKey: string;

  if (adapter && path) {
    cacheKey = [JSON.stringify(def), path].join(":");
  }

  if (cacheKey) {
    adapter.__createdFieldsCache ??= new Map();

    if (adapter.__createdFieldsCache.has(cacheKey)) {
      return adapter.__createdFieldsCache.get(cacheKey);
    }
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

  const field = new FieldClass(def, path);

  if (cacheKey) {
    adapter.__createdFieldsCache.set(cacheKey, field);
  }

  return field;
};

export const getValidatorFromDefinition = <T extends ValidatorTypes>(
  def: ValidatorDefinition<T>,
  adapter: Adapter
) => {
  if (!def || typeof def !== "object") {
    return null;
  }

  let cacheKey: string;

  if (adapter) {
    cacheKey = JSON.stringify(def);
  }

  if (cacheKey) {
    adapter.__createdValidatorsCache ??= new Map();

    if (adapter.__createdValidatorsCache.has(cacheKey)) {
      return adapter.__createdValidatorsCache.get(cacheKey);
    }
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

  const validator = new ValidatorClass(def);

  if (cacheKey) {
    adapter.__createdValidatorsCache.set(cacheKey, validator);
  }

  return validator;
};

export const validateDocs = async <T extends typeof Model = typeof Model>(
  docs: Array<DocumentDefinition>,
  ctx: ValidateCtx = {},
  validators: Array<Validator>,
  fieldsEntries?: Array<[string, Field<FieldTypes>]>,
  bindDuplicatesValues = true
) => {
  const errorsFieldsSet = new Set<ValidationFieldError>();
  const errorsValidatorsSet = new Set<ValidationValidatorError>();

  if (fieldsEntries?.length) {
    await Promise.all(
      fieldsEntries.map(async ([slug, field]) => {
        let list = docs.map((doc) => doc[slug]);

        if (bindDuplicatesValues) {
          list = Array.from(new Set(list));
        }

        await Promise.all(
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
      })
    );
  }

  await Promise.all(
    validators.map(async (validator) => {
      try {
        const validated = await validator.validate(docs, ctx);

        if (!validated) {
          throw null;
        }
      } catch (err) {
        const e = new ValidationValidatorError({ validator });

        errorsValidatorsSet.add(e);
      }
    })
  );

  if (errorsFieldsSet.size || errorsValidatorsSet.size) {
    throw new ValidationError({
      fields: Array.from(errorsFieldsSet),
      validators: Array.from(errorsValidatorsSet),
    });
  }

  return true;
};

export const getDefaultFieldOptions = <T extends FieldTypes>(
  type: T
): FieldOptions<T> => {
  let options = {};

  switch (type) {
    case FieldTypes.TEXT:
      options = {
        creatable: true,
        multiple: false,
      };
      break;
    case FieldTypes.JSON:
      options = {
        multiple: false,
      };
      break;
    default:
      break;
  }

  return options as FieldOptions<T>;
};

export const getDefaultValidatorOptions = <T extends ValidatorTypes>(
  type: T
): ValidatorOptions<T> => {
  let options = {};

  switch (type) {
    case ValidatorTypes.LENGTH:
      options = {
        min: -Infinity,
        max: Infinity,
      };
      break;
    case ValidatorTypes.BOUNDARIES:
      options = {
        min: -Infinity,
        max: Infinity,
      };
      break;
    default:
      break;
  }

  return options as ValidatorOptions<T>;
};

export const isObjectId = (input: string) => {
  return /^[a-f\d]{24}$/i.test(input);
};

export const verifyModelAdapter = (model: typeof Model) => {
  if (!model.__adapter) {
    throw new CoreError({
      code: ErrorCodes.INVALID_ADAPTER,
      message: `model ${model.slug} has invalid adapter`,
    });
  }

  // if (model.__adapter.model.getBaseClass() !== model.getBaseClass()) {
  //   throw new CoreError({
  //     code: ErrorCodes.INVALID_ADAPTER,
  //     message: `model ${model.slug} has invalid adapter`,
  //   });
  // }
};

export const defineFieldsProperties = (instance: Model) => {
  if (!instance.model.__fieldsProperties) {
    const propEntries = instance.model.fieldsKeys.map((slug) => {
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

    instance.model.__fieldsProperties = Object.fromEntries(propEntries);
  }

  Object.defineProperties(instance, instance.model.__fieldsProperties);
};

export const getAdaptedModel = <M extends typeof Model = typeof Model>(
  model: M,
  adapter: typeof Adapter,
  override?: boolean
): M => {
  // if (!adapter) {
  //   adapter = this.__adapter?.constructor as typeof Adapter;
  // }

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
};
