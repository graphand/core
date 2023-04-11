import { CoreErrorDefinition } from "../types";
import ErrorCodes from "../enums/error-codes";

class CoreError extends Error {
  __definition: CoreErrorDefinition;

  constructor(definition: CoreErrorDefinition = {}) {
    super(definition.message ?? "Unknown error");

    const { constructor } = Object.getPrototypeOf(this);

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, constructor);
    }

    this.__definition = definition;

    Object.defineProperty(this, "__definition", { enumerable: false });
  }

  get code() {
    return this.__definition.code ?? ErrorCodes.UNKNOWN;
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
