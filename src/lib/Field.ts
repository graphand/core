import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldDefinition, FieldOptions, ValidateCtx } from "../types";
import SerializerFormat from "../enums/serializer-format";
import { getDefaultFieldOptions } from "../utils";

class Field<T extends FieldTypes = FieldTypes> {
  private __definition: FieldDefinition<T>;

  constructor(definition: FieldDefinition<T>) {
    this.__definition = definition;

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

  serialize(value: any, format: SerializerFormat, from: Model) {
    return value;
  }
}

export default Field;
