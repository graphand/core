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

    Object.defineProperty(this, "fieldsPaths", {
      enumerable: true,
      value: this.fieldsPaths,
    });
  }

  get code() {
    return ErrorCodes.VALIDATION_FAILED;
  }

  get fieldsPaths(): Array<string> {
    return [
      ...this.fields.map((f) => f.field?.path),
      ...this.validators.map((v) => v.validator.getFullPath()),
    ];
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
      let reason = `${this.validators.length} model validator${
        this.validators.length > 1 ? "s" : ""
      } (${this.validators.map((v) => v.validator.type).join(", ")})`;

      const values = this.validators
        .filter((v) => v.value !== undefined)
        .map((v) => v.value);
      if (values.length) {
        reason += ` for value${values.length > 1 ? "s" : ""} ${values.join(
          ", "
        )}`;
      }

      reasons.push(reason);
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
}

export default ValidationError;
