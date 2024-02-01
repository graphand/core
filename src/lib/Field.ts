import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import {
  FieldDefinition,
  FieldOptions,
  ModelInstance,
  InferFieldType,
  SerializerFormat,
  SerializerCtx,
  TransactionCtx,
  SerializerFieldsMap,
  FieldSerializerInput,
} from "@/types";

class Field<T extends FieldTypes = FieldTypes> {
  #definition: FieldDefinition<T>; // The field definition
  #path: string; // The path of the field in the model
  static readonly defaultSymbol: unique symbol = Symbol("defaultSerializer");

  serializerMap: Partial<{
    [S in SerializerFormat]: (
      input: FieldSerializerInput<S>,
    ) => InferFieldType<FieldDefinition<T>, S>;
  }> & {
    [Field.defaultSymbol]?: (
      input: FieldSerializerInput,
    ) => T extends keyof SerializerFieldsMap<FieldDefinition<T>>[keyof SerializerFieldsMap<
      FieldDefinition<T>
    >]
      ? SerializerFieldsMap<FieldDefinition<T>>[keyof SerializerFieldsMap<FieldDefinition<T>>][T]
      : unknown;
  };

  constructor(definition: FieldDefinition<T>, path: string) {
    this.#definition = definition;
    this.#path = path;
  }

  get type() {
    return this.#definition.type;
  }

  get path() {
    return this.#path;
  }

  get definition() {
    return this.#definition;
  }

  get options(): FieldOptions<T> {
    return (this.#definition.options ?? {}) as FieldOptions<T>;
  }

  validate?: (input: {
    list: Array<ModelInstance>;
    model: typeof Model;
    ctx?: TransactionCtx;
  }) => Promise<boolean>;

  serialize = <S extends SerializerFormat>(
    value: unknown,
    format: S,
    from: ModelInstance,
    ctx: SerializerCtx,
  ): InferFieldType<FieldDefinition<T>, S> => {
    const s = this.serializerMap?.[format] || this.serializerMap?.[Field.defaultSymbol];

    if (!s) {
      console.warn(`No serializer found for format ${format} on field ${this.path}`);
      return undefined;
    }

    const serializer = s as (
      input: FieldSerializerInput<S>,
    ) => InferFieldType<FieldDefinition<T>, S>;

    return serializer({ value, from, ctx, format });
  };

  toJSON() {
    return {
      type: this.type,
      options: this.options,
      path: this.#path,
    };
  }
}

export default Field;
