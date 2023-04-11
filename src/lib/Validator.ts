import ValidatorTypes from "../enums/validator-types";
import {
  DocumentDefinition,
  ValidateCtx,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
} from "../types";
import { getDefaultValidatorOptions } from "./utils";

class Validator<T extends ValidatorTypes = ValidatorTypes> {
  __definition: ValidatorDefinition<T>;
  __path: string;

  hooks: Array<ValidatorHook>;

  constructor(definition: ValidatorDefinition<T>, path: string) {
    this.__definition = definition;
    this.__path = path;

    Object.defineProperty(this, "hooks", { enumerable: false });
    Object.defineProperty(this, "__definition", { enumerable: false });
    Object.defineProperty(this, "__json", {
      enumerable: true,
      value: this.toJSON(),
    });
  }

  get type(): T {
    return this.__definition.type as T;
  }

  get options(): ValidatorOptions<T> {
    const defaults = getDefaultValidatorOptions(this.type);

    return Object.assign(
      {},
      defaults,
      this.__definition.options ?? {}
    ) as ValidatorOptions<T>;
  }

  async validate(docs: Array<DocumentDefinition>, ctx: ValidateCtx) {
    return true;
  }

  toJSON() {
    return {
      type: this.type,
      options: this.options,
      path: this.__path,
    };
  }
}

export default Validator;
