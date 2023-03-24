import { CoreErrorDefinition } from "../types";
import ErrorCodes from "../enums/error-codes";

class CoreError extends Error {
  __definition: CoreErrorDefinition;

  constructor(definition: CoreErrorDefinition = {}) {
    super();
    const { constructor } = Object.getPrototypeOf(this);

    if ("captureStackTrace" in Error) {
      // @ts-ignore
      Error.captureStackTrace(this, constructor);
    }

    this.__definition = definition;

    const _this = this as CoreError;
    Object.defineProperty(_this, "__definition", { enumerable: false });
  }

  get code() {
    return this.__definition.code ?? ErrorCodes.UNKNOWN;
  }

  get message() {
    return this.__definition.message ?? "Unknown error";
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
