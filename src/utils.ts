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
    if (model.hasOwnProperty("fields")) {
      const _modelFields = model.fields || {};

      fields = { ...fields, ..._modelFields };
    }

    // @ts-ignore
    model = model.__proto__;
  } while (model);

  return fields;
};

export const getRecursiveValidatorsFromModel = (
  model: typeof Model
): ValidatorsDefinition => {
  let validators = [];

  do {
    if (model.hasOwnProperty("validators")) {
      const _modelValidators = model.validators || [];

      validators = [...validators, ..._modelValidators];
    }

    // @ts-ignore
    model = model.__proto__;
  } while (model);

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
    if (model.hasOwnProperty("__hooks")) {
      const _modelHooks = Array.from(model.__hooks || []).filter(
        (hook) => hook.action === action && hook.phase === phase
      );

      if (_modelHooks?.length) {
        _hooks = _hooks.concat(_modelHooks);
      }
    }

    if (model.hasOwnProperty("__validatorsArray") && model.__validatorsArray) {
      const _validatorsHooks = model.__validatorsArray
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
    model = model.__proto__;
  } while (model);

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

export const validateDocs = async (
  docs: Array<DocumentDefinition>,
  ctx: ValidateCtx = {},
  validators: Array<Validator>,
  fieldsEntries?: Array<[string, Field<FieldTypes>]>
) => {
  const errorsFieldsSet = new Set<ValidationFieldError>();
  const errorsValidatorsSet = new Set<ValidationValidatorError>();

  if (fieldsEntries?.length) {
    await Promise.all(
      fieldsEntries.map(async ([slug, field]) => {
        const values = Array.from(new Set(docs.map((doc) => doc[slug])));
        await Promise.all(
          values.map(async (value) => {
            try {
              const validated = await field.validate(value, ctx, slug);
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
