import Model from "./Model";
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

export const getFieldFromPath = (model: typeof Model, path: string): Field => {
  const fullPath = path.split(".");
  let map = model.fieldsMap;
  let field = null;

  for (let i = 0; i < fullPath.length; i++) {
    const key = fullPath[i];
    const nextField = map.get(key);

    if (!nextField) {
      return null;
    }

    if (i === fullPath.length - 1) {
      return nextField;
    }

    if (nextField.type === FieldTypes.JSON) {
      const options = nextField.options as FieldOptions<FieldTypes.JSON>;
      const subfieldsEntries = Object.entries(options.fields ?? {});
      const subfieldsMap = new Map();

      for (const [slug, def] of subfieldsEntries) {
        const subfield = createFieldFromDefinition(def, model.__adapter);
        subfieldsMap.set(slug, subfield);
      }

      map = subfieldsMap;
    } else {
      map = null;
    }
  }

  return field;
};

export const getValueFromPath = (
  doc: DocumentDefinition,
  path: string
): any => {
  if (!doc || typeof doc !== "object") {
    return doc;
  }

  const fullPath = path.split(".");
  let value = doc;

  for (let i = 0; i < fullPath.length; i++) {
    const key = fullPath[i];

    if (typeof value !== "object" || value === null) {
      return value;
    }

    value = value[key];
  }

  return value;
};

export const setValueOnPath = (
  doc: DocumentDefinition,
  path: string,
  value: any
): void => {
  const fullPath = path.split(".");

  let assignTo = doc;

  for (let i = 0; i < fullPath.length; i++) {
    const key = fullPath[i];
    let nextField = assignTo[key];

    if (i === fullPath.length - 1) {
      assignTo[key] = value;
      return;
    }

    if (nextField === undefined) {
      nextField = {};
      assignTo[key] = nextField;
    }

    if (typeof nextField !== "object" || nextField === null) {
      throw new Error(
        `Cannot set value on path ${path} because ${key} is not an object`
      );
    }

    assignTo = nextField;
  }

  // let _value = instance.__doc;
  //
  // for (let i = 0; i < fullPath.length; i++) {
  //   const key = fullPath[i];
  //
  //   if (typeof _value !== "object" || _value === null) {
  //     return;
  //   }
  //
  //   if (i === fullPath.length - 1) {
  //     _value[key] = value;
  //     return;
  //   }
  //
  //   _value = _value[key];
  // }
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
  let FieldClass: typeof Field<T> = adapter?.fieldsMap?.[
    def.type
  ] as typeof Field<T>;

  if (!FieldClass) {
    FieldClass = defaultFieldsMap[def.type] as typeof Field<T>;
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
  let ValidatorClass: typeof Validator<T> = adapter?.validatorsMap?.[
    def.type
  ] as typeof Validator<T>;

  if (!ValidatorClass) {
    ValidatorClass = defaultValidatorsMap[def.type] as typeof Validator<T>;
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

export const isObjectId = (input: string) => {
  return /^[a-f\d]{24}$/i.test(input);
};
