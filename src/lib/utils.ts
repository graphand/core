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

      Array.prototype.push.apply(validators, _modelValidators);
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

        if (itemsField?.type === FieldTypes.JSON) {
          const options = itemsField.options as FieldOptions<FieldTypes.JSON>;
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

      if (prevField?.type === FieldTypes.JSON) {
        const options = prevField.options as FieldOptions<FieldTypes.JSON>;
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

export const getJSONSubfieldsMap = (
  model: typeof Model,
  jsonField: Field<FieldTypes.JSON>
) => {
  const subfieldsEntries: Array<[string, Field]> = Object.entries(
    jsonField.options.fields ?? {}
  ).map(([slug, def]) => {
    const field = getFieldFromDefinition(
      def,
      model.getAdapter(),
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
  const modelFields = getRecursiveFieldsFromModel(model);

  if (assignFields) {
    Object.assign(modelFields, assignFields);
  }

  const fieldsEntries: Array<[string, Field]> = Object.entries(modelFields).map(
    ([slug, def]) => {
      return [slug, getFieldFromDefinition(def, model.getAdapter(false), slug)];
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
    return getValidatorFromDefinition(def, model.getAdapter(false), null);
  });
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

export const validateDocs = async <T extends typeof Model = typeof Model>(
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
) => {
  const errorsFieldsSet = new Set<ValidationFieldError>();
  const errorsValidatorsSet = new Set<ValidationValidatorError>();

  for (const [slug, field] of fieldsEntries) {
    const list = bindDuplicatesValues
      ? Array.from(new Set(docs.map((doc) => doc[slug])))
      : docs.map((doc) => doc[slug]);

    for (const values of list) {
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
    }
  }

  for (const validator of validators) {
    try {
      const validated = await validator.validate(docs, ctx);

      if (!validated) {
        throw null;
      }
    } catch (err) {
      const e = new ValidationValidatorError({ validator });

      errorsValidatorsSet.add(e);
    }
  }

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

export const isObjectId = (input: string) => /^[a-f\d]{24}$/i.test(input);

export const defineFieldsProperties = (instance: Model) => {
  const { model } = instance;
  if (!model.__fieldsProperties) {
    const propEntries = [];
    for (const slug of model.fieldsKeys) {
      propEntries.push([
        slug,
        {
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
        },
      ]);
    }

    model.__fieldsProperties = Object.fromEntries(propEntries);
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
