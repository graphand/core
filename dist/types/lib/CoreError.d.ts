import { CoreErrorDefinition } from "../types";
/**
 * CoreError class is the base Error class for Graphand.
 * It includes a message and a code (src/enums/error-codes.ts).
 */
declare class CoreError extends Error {
    #private;
    constructor(definition?: CoreErrorDefinition);
    get code(): string;
    get message(): string;
    set code(code: string);
    set message(message: string);
    toJSON(): {
        type: string;
        code: string;
        message: string;
    };
}
export default CoreError;
