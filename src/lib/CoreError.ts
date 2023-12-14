import { CoreErrorDefinition } from "../types";
import ErrorCodes from "../enums/error-codes";

/**
 * CoreError class is the base Error class for Graphand.
 * It includes a message and a code (src/enums/error-codes.ts).
 */
class CoreError extends Error {
  #definition: CoreErrorDefinition;

  constructor(definition: CoreErrorDefinition = {}) {
    super();

    const { constructor } = Object.getPrototypeOf(this);

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, constructor);
    }

    this.#definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
  }

  get code() {
    return this.#definition.code ?? ErrorCodes.UNKNOWN;
  }

  get message() {
    return this.#definition.message ?? "Unknown error";
  }

  set code(code) {
    this.#definition.code = code;
  }

  set message(message) {
    this.#definition.message = message;
  }

  toJSON() {
    return {
      type: "CoreError",
      code: this.code,
      message: this.message,
    };
  }
}

export default CoreError;
