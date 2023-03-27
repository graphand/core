import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldDefinition, FieldOptions, ValidateCtx } from "../types";
import SerializerFormat from "../enums/serializer-format";
import { getDefaultFieldOptions } from "./utils";

class Field<T extends FieldTypes = FieldTypes> {
  __definition: FieldDefinition<T>;
  __path: string;

  constructor(definition: FieldDefinition<T>, path: string) {
    this.__definition = definition;
    this.__path = path;

    Object.defineProperty(this, "__definition", { enumerable: false });
  }

  get type() {
    return this.__definition.type;
  }

  get options(): FieldOptions<T> {
    const defaults = getDefaultFieldOptions(this.type);

    return Object.assign(
      {},
      defaults,
      this.__definition.options ?? {}
    ) as FieldOptions<T>;
  }

  async validate(value: any, ctx: ValidateCtx, slug: string) {
    return true;
  }

  serialize(
    value: any,
    format: SerializerFormat,
    from: Model,
    ctx: ExecutorCtx = {}
  ) {
    return value;
  }

  toJSON() {
    return {
      type: this.type,
      options: this.options,
    };
  }
}

export default Field;
