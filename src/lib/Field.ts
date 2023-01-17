import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldOptions } from "../types";
import SerializerFormat from "../enums/serializer-format";

class Field<T extends FieldTypes = FieldTypes> {
  private __options: FieldOptions<T>;

  constructor(options: FieldOptions<T> = {} as any) {
    this.__options = options;
  }

  get options() {
    return this.__options;
  }

  serialize(value: any, format: SerializerFormat, from: Model) {
    if (value === undefined && "default" in this.options) {
      value = this.options.default;
    }

    if (value === undefined || value === null) {
      return value;
    }
  }
}

export default Field;
