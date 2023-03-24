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

    const _this = this as ValidationError;
    Object.defineProperty(_this, "fieldsPaths", {
      enumerable: true,
      value: this.fieldsPaths,
    });
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

    const reasons = [];
    if (this.fields.length) {
      reasons.push(
        `${this.fields.length} field${
          this.fields.length > 1 ? "s" : ""
        } validation (${this.fields.map((v) => v.slug).join(", ")})`
      );
    }
    if (this.validators.length) {
      reasons.push(
        `${this.validators.length} model validator${
          this.validators.length > 1 ? "s" : ""
        } (${this.validators.map((v) => v.validator.type).join(", ")})`
      );
    }

    if (reasons.length) {
      message += ` with ${reasons.join(" and ")}`;
    }

    if (this.fieldsPaths?.length) {
      message += ` on path${
        this.fieldsPaths.length > 1 ? "s" : ""
      } ${this.fieldsPaths.join(", ")}`;
    }

    return message;
  }

  toJSON() {
    const json = {
      ...super.toJSON(),
      type: "ValidationError",
      fieldsPaths: this.fieldsPaths,
      reason: {
        fields: this.fields.map((f) => f.toJSON()),
        validators: this.validators.map((v) => v.toJSON()),
      },
    };

    delete json.code;

    return json;
  }

  toLog() {
    return {
      message: this.message,
      fields: this.fields.map((f) => f.toJSON()),
      validators: this.validators.map((v) => v.toJSON()),
    };
  }
}

export default ValidationError;
