import { ValidationFieldErrorDefinition } from "../types";

class ValidationFieldError {
  #definition: ValidationFieldErrorDefinition;

  constructor(definition: ValidationFieldErrorDefinition) {
    this.#definition = definition;
  }

  get slug() {
    return this.#definition.slug;
  }

  get field() {
    return this.#definition.field;
  }

  get validationError() {
    return this.#definition.validationError;
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
