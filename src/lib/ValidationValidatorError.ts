import { ValidationValidatorErrorDefinition } from "../types";

class ValidationValidatorError {
  __definition: ValidationValidatorErrorDefinition;

  constructor(definition: ValidationValidatorErrorDefinition) {
    this.__definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
    Object.defineProperty(this, "__log", {
      enumerable: true,
      value: this.toLog(),
    });
  }

  get validator() {
    return this.__definition.validator;
  }

  toJSON() {
    return {
      validator: this.validator.toJSON(),
    };
  }

  toLog() {
    return {
      validator: this.validator.toJSON(),
    };
  }
}

export default ValidationValidatorError;
