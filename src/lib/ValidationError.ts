import CoreError from "./CoreError";
import ValidationFieldError from "./ValidationFieldError";
import ValidationValidatorError from "./ValidationValidatorError";
import { CoreErrorDefinition } from "../types";
import ErrorCodes from "../enums/error-codes";

class ValidationError extends CoreError {
  fields: Array<ValidationFieldError>;
  validators: Array<ValidationValidatorError>;

  constructor({
    fields,
    validators,
    ...coreDefinition
  }: CoreErrorDefinition & {
    fields?: Array<ValidationFieldError>;
    validators?: Array<ValidationValidatorError>;
  }) {
    super(coreDefinition);

    this.fields = fields ?? [];
    this.validators = validators ?? [];
  }

  get code() {
    return ErrorCodes.VALIDATION_FAILED;
  }

  get fieldsPaths(): Array<string> {
    const paths: Array<Array<string>> = this.fields.map((err) => {
      if (err.validationError) {
        const nestedPaths = err.validationError.fieldsPaths.map(
          (path) => `${err.slug}.${path}`
        );

        return [err.slug, ...nestedPaths];
      }

      return [err.slug];
    });

    return paths.flat();
  }

  get message() {
    let message = `Validation failed`;
    if (this.fields.length) {
      message += ` on fields ${this.fieldsPaths.join(", ")}`;
    }
    if (this.validators.length) {
      message += ` with ${this.validators.length} validators`;
    }

    return message;
  }
}

export default ValidationError;
