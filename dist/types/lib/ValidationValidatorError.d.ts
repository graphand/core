import { ValidationValidatorErrorDefinition } from "../types";
declare class ValidationValidatorError {
    #private;
    constructor(definition: ValidationValidatorErrorDefinition);
    get validator(): import("./Validator").default<import("../enums/validator-types").default>;
    get value(): string;
    toJSON(): {
        validator: {
            type: import("../enums/validator-types").default;
            options: {
                field: string;
            } | {
                field: string;
            } | {
                field: string;
            } | {
                field: string;
            } | {
                field: string;
                min?: number;
                max?: number;
            } | {
                field: string;
                min?: number;
                max?: number;
            } | {
                field: string;
                pattern: string;
                options?: ("i" | "m" | "s" | "u" | "y")[];
            } | Record<string, never>;
            path: string;
        };
        value: string;
    };
}
export default ValidationValidatorError;
