import { ValidationValidatorErrorDefinition } from "../types";

class ValidationValidatorError {
  __definition: ValidationValidatorErrorDefinition;

  constructor(definition: ValidationValidatorErrorDefinition) {
    this.__definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
  }

  get validator() {
    return this.__definition.validator;
  }
}

export default ValidationValidatorError;
