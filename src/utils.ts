import Model from "./lib/Model";
import {
  AdapterFetcher,
  FieldDefinition,
  FieldsDefinition,
  Hook,
  HookPhase,
  ValidatorDefinition,
  ValidatorsDefinition,
} from "./types";
import FieldTypes from "./enums/field-types";
import defaultFieldsMap from "./lib/defaultFieldsMap";
import Field from "./lib/Field";
import ValidatorTypes from "./enums/validator-types";
import defaultValidatorsMap from "./lib/defaultValidatorsMap";
import Validator from "./lib/Validator";

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

    // @ts-ignore
    model = model.__proto__;
  } while (model);

  return _hooks.sort((a, b) => a.order - b.order);
};

export const createFieldFromDefinition = <T extends FieldTypes>(
  def: FieldDefinition<T>,
  model: typeof Model
) => {
  let FieldClass = model.__adapter?.fieldsMap?.[def.type];

  if (!FieldClass) {
    FieldClass = defaultFieldsMap[def.type];
  }

  if (!FieldClass) {
    FieldClass = Field;
  }

  return new FieldClass(def.options);
};

export const createValidatorFromDefinition = <T extends ValidatorTypes>(
  def: ValidatorDefinition<T>,
  model: typeof Model
) => {
  let ValidatorClass = model.__adapter?.validatorsMap?.[def.type];

  if (!ValidatorClass) {
    ValidatorClass = defaultValidatorsMap[def.type];
  }

  if (!ValidatorClass) {
    ValidatorClass = Validator;
  }

  return new ValidatorClass(def.options);
};
