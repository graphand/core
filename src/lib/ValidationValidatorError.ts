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

  get value() {
    return this.__definition.value;
  }

  toJSON() {
    return {
      validator: this.validator.toJSON(),
      value: this.value,
    };
  }
}

export default ValidationValidatorError;
