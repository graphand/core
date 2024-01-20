import ValidatorTypes from "../enums/validator-types";
import { DocumentDefinition, ValidatorDefinition, ValidatorHook, ValidatorOptions } from "../types";
import Model from "./Model";
declare class Validator<T extends ValidatorTypes = ValidatorTypes> {
    #private;
    hooks: Array<ValidatorHook>;
    constructor(definition: ValidatorDefinition<T>, path?: string);
    get type(): T;
    get path(): string;
    get options(): ValidatorOptions<T>;
    getFullPath(): string;
    getKey(): string;
    validate(docs: Array<DocumentDefinition>, model: typeof Model, ctx: TransactionCtx): Promise<boolean>;
    toJSON(): {
        type: T;
        options: ValidatorOptions<T>;
        path: string;
    };
}
export default Validator;
