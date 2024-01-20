import CoreError from "./CoreError";
import ValidationFieldError from "./ValidationFieldError";
import ValidationValidatorError from "./ValidationValidatorError";
import { CoreErrorDefinition } from "../types";
import ErrorCodes from "../enums/error-codes";
declare class ValidationError extends CoreError {
    fields: Array<ValidationFieldError>;
    validators: Array<ValidationValidatorError>;
    constructor({ fields, validators, ...coreDefinition }: CoreErrorDefinition & {
        fields?: Array<ValidationFieldError>;
        validators?: Array<ValidationValidatorError>;
    });
    get code(): ErrorCodes;
    get fieldsPaths(): Array<string>;
    get message(): string;
    toJSON(): any;
}
export default ValidationError;
