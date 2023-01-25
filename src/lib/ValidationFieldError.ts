import { ValidationFieldErrorDefinition } from "../types";

class ValidationFieldError {
  __definition: ValidationFieldErrorDefinition;

  constructor(definition: ValidationFieldErrorDefinition) {
    this.__definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
    Object.defineProperty(this, "slug", { enumerable: true, value: this.slug });
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
}

export default ValidationFieldError;
