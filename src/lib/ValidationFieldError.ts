import { ValidationFieldErrorDefinition } from "../types";

class ValidationFieldError {
  __definition: ValidationFieldErrorDefinition;

  constructor(definition: ValidationFieldErrorDefinition) {
    this.__definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
  }

  get slug() {
    return this.__definition.slug;
  }

  get field() {
    return this.__definition.field;
  }

  get validationError() {
    return this.__definition.validationError;
  }

  toJSON() {
    return {
      slug: this.slug,
      field: this.field?.toJSON(),
      validationError: this.validationError?.toJSON(),
    };
  }
}

export default ValidationFieldError;
