import FieldTypes from "../enums/field-types";
import Model from "./Model";
import {
  AdapterSerializerField,
  FieldDefinition,
  FieldOptions,
} from "../types";
import SerializerFormat from "../enums/serializer-format";
import defaultSerializer from "./defaultSerializer";

class Field<T extends FieldTypes = FieldTypes> {
  private __type: T;
  private __options: FieldOptions<T>;

  constructor(type: T, options: FieldOptions<T> = {} as any) {
    this.__type = type;
    this.__options = options;
  }

  static fromDefinition(def: FieldDefinition) {
    return new Field(def.type, def.options);
  }

  get type() {
    return this.__type;
  }

  get options() {
    return this.__options;
  }

  getSerializer<M extends typeof Model>(
    from: InstanceType<M>
  ): AdapterSerializerField<M, Field<T>> {
    return (
      from.model.__adapter?.serializer?.[this.__type] ||
      defaultSerializer[this.__type]
    );
  }

  serialize(value: any, format: SerializerFormat, from: Model) {
    if (value === undefined && "default" in this.options) {
      value = this.options.default;
    }

    if (value === undefined || value === null) {
      return value;
    }

    return (
      this.getSerializer(from)?.serialize?.(value, format, this, from) ?? value
    );
  }
}

export default Field;
