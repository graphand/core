import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldOptions, ModelAdapterSerializerField } from "../types";
import SerializerFormat from "../enums/serializer-format";
import defaultSerializer from "./defaultSerializer";

class Field<T extends FieldTypes = FieldTypes> {
  private __type: T;
  private __options: FieldOptions<T>;

  constructor(type: T, options: FieldOptions<T> = {} as any) {
    this.__type = type;
    this.__options = options;
  }

  get options() {
    return this.__options;
  }

  getSerializer<M extends typeof Model>(
    from: InstanceType<M>
  ): ModelAdapterSerializerField<M, Field<T>> {
    return (
      from.model.getAdapter().serializer?.[this.__type] ||
      defaultSerializer[this.__type]
    );
  }

  serialize(value: any, format: SerializerFormat, from: Model) {
    if (value === undefined || value === null) {
      return value;
    }

    return (
      this.getSerializer(from)?.serialize?.(value, format, this, from) ?? value
    );
  }
}

export default Field;
