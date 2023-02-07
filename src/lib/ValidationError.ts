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
    const _fieldsPaths: Array<Array<string>> = this.fields.map((err) => {
      if (err.validationError) {
        const nestedPaths = err.validationError.fieldsPaths.map(
          (path) => `${err.slug}.${path}`
        );

        return [err.slug, ...nestedPaths];
      }

      return [err.slug];
    });

    const _validatorsPaths: Array<string | null> = this.validators.map(
      (err) => {
        if ("field" in err.validator.options) {
          return err.validator.options.field as string;
        }

        return null;
      }
    );

    return [..._validatorsPaths, ..._fieldsPaths.flat()].filter(Boolean);
  }

  get message() {
    let message = `Validation failed`;
    if (this.fields.length) {
      message += ` on fields ${this.fieldsPaths.join(", ")}`;
    }
    if (this.validators.length) {
      message += ` with ${this.validators.length} validators (${this.validators
        .map((v) => v.validator.type)
        .join(", ")})`;
    }

    return message;
  }
}

export default ValidationError;
