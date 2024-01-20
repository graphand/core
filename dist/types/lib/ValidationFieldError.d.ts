import { ValidationFieldErrorDefinition } from "../types";
declare class ValidationFieldError {
    #private;
    constructor(definition: ValidationFieldErrorDefinition);
    get slug(): string;
    get field(): import("./Field").default<import("../enums/field-types").default>;
    get validationError(): import("./ValidationError").default;
    toJSON(): any;
}
export default ValidationFieldError;
