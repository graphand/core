import ValidatorTypes from "../enums/validator-types";
import {
  DocumentDefinition,
  ValidateCtx,
  ValidatorDefinition,
  ValidatorHook,
  ValidatorOptions,
} from "../types";
import { getDefaultValidatorOptions } from "../utils";

class Validator<T extends ValidatorTypes = ValidatorTypes> {
  private __definition: ValidatorDefinition<T>;

  hooks: Array<ValidatorHook>;

  constructor(definition: ValidatorDefinition<T>) {
    this.__definition = definition;

    Object.defineProperty(this, "hooks", { enumerable: false });
    Object.defineProperty(this, "__definition", { enumerable: false });
    Object.defineProperty(this, "__json", {
      enumerable: true,
      value: this.toJSON(),
    });
  }

  get type(): T {
    return this.__definition.type;
  }

  get options(): ValidatorOptions<T> {
    const defaults = getDefaultValidatorOptions(this.type);

    return Object.assign(
      {},
      defaults,
      this.__definition.options ?? {}
    ) as ValidatorOptions<T>;
  }

  async validate(docs: DocumentDefinition[], ctx: ValidateCtx) {
    return true;
  }

  toJSON() {
    return {
      type: this.type,
      options: this.options,
    };
  }
}

export default Validator;
