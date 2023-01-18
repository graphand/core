import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldDefinition, FieldOptions } from "../types";
import SerializerFormat from "../enums/serializer-format";

class Field<
  T extends FieldTypes = FieldTypes,
  M extends typeof Model = typeof Model
> {
  private __definition: FieldDefinition<T>;

  constructor(definition: FieldDefinition<T>) {
    this.__definition = definition;
  }

  get type(): T {
    return this.__definition.type;
  }

  get options(): FieldOptions<T> {
    return this.__definition.options ?? ({} as FieldOptions<T>);
  }

  serialize(value: any, format: SerializerFormat, from: InstanceType<M>) {
    if (value === undefined && "default" in this.options) {
      value = this.options.default;
    }

    if (value === undefined || value === null) {
      return value;
    }
  }
}

export default Field;
