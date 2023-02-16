import Model from "./lib/Model";
import {
  AdapterFetcher,
  DocumentDefinition,
  FieldDefinition,
  FieldOptions,
  FieldsDefinition,
  Hook,
  HookPhase,
  ValidateCtx,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
  ValidatorsDefinition,
} from "./types";
import FieldTypes from "./enums/field-types";
import defaultFieldsMap from "./lib/defaultFieldsMap";
import Field from "./lib/Field";
import ValidatorTypes from "./enums/validator-types";
import defaultValidatorsMap from "./lib/defaultValidatorsMap";
import Validator from "./lib/Validator";
import Adapter from "./lib/Adapter";
import ValidationFieldError from "./lib/ValidationFieldError";
import ValidationValidatorError from "./lib/ValidationValidatorError";
import ValidationError from "./lib/ValidationError";

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

  if (baseClass.hasOwnProperty("configKey") && baseClass.configKey) {
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

export const createFieldFromDefinition = <T extends FieldTypes>(
  def: FieldDefinition<T>,
  adapter: Adapter
) => {
  let FieldClass = adapter?.fieldsMap?.[def.type];

  if (!FieldClass) {
    FieldClass = defaultFieldsMap[def.type];
  }

  if (!FieldClass) {
    FieldClass = Field;
  }

  return new FieldClass(def);
};

export const createValidatorFromDefinition = <T extends ValidatorTypes>(
  def: ValidatorDefinition<T>,
  adapter: Adapter
) => {
  let ValidatorClass = adapter?.validatorsMap?.[def.type];

  if (!ValidatorClass) {
    ValidatorClass = defaultValidatorsMap[def.type];
  }

  if (!ValidatorClass) {
    ValidatorClass = Validator;
  }

  return new ValidatorClass(def);
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
