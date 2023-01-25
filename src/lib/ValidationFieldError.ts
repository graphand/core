import { ValidationFieldErrorDefinition } from "../types";

class ValidationFieldError {
  __validatorDefinition: ValidationFieldErrorDefinition;

  constructor(definition: ValidationFieldErrorDefinition) {
    this.__validatorDefinition = definition;
  }

  get slug() {
    return this.__validatorDefinition.slug;
  }

  get field() {
    return this.__validatorDefinition.field;
  }

  get validationError() {
    return this.__validatorDefinition.validationError;
  }
}

export default ValidationFieldError;
