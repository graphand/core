import { CoreErrorDefinition } from "../types";
import ErrorCodes from "../enums/error-codes";

class CoreError extends Error {
  __definition: CoreErrorDefinition;

  constructor(definition: CoreErrorDefinition = {}) {
    super();
    const { constructor } = Object.getPrototypeOf(this);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, constructor);
    }

    this.__definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
    Object.defineProperty(this, "code", { enumerable: true });
  }

  get code() {
    return this.__definition.code ?? ErrorCodes.UNKNOWN;
  }

  get message() {
    return this.__definition.message ?? "Unknown error";
  }
}

export default CoreError;
