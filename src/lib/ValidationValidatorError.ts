import { ValidationValidatorErrorDefinition } from "../types";

class ValidationValidatorError {
  __definition: ValidationValidatorErrorDefinition;

  constructor(definition: ValidationValidatorErrorDefinition) {
    this.__definition = definition;
  }
}

export default ValidationValidatorError;
