import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import {
  CoreSerializerCtx,
  FieldDefinition,
  FieldOptions,
  ModelInstance,
  FieldTypeMap,
} from "@/types";
import SerializerFormat from "@/enums/serializer-format";

class Field<T extends FieldTypes = FieldTypes> {
  #definition: FieldDefinition<T>; // The field definition
  #path: string; // The path of the field in the model
  nextFieldEqObject: boolean = true; // If false, the serializer returns a different value in NEXT_FIELD and OBJECT

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

  sJSON?: (input: {
    value: unknown;
    from: ModelInstance;
    ctx: SerializerCtx & CoreSerializerCtx;
  }) => FieldTypeMap<FieldDefinition<T>>[T][SerializerFormat.JSON];

  sObject?: (input: {
    value: unknown;
    from: ModelInstance;
    ctx: SerializerCtx & CoreSerializerCtx;
  }) => FieldTypeMap<FieldDefinition<T>>[T][SerializerFormat.OBJECT];

  sDocument?: (input: {
    value: unknown;
    from: ModelInstance;
    ctx: SerializerCtx & CoreSerializerCtx;
  }) => FieldTypeMap<FieldDefinition<T>>[T][SerializerFormat.DOCUMENT];

  sTo: (input: {
    value: unknown;
    format: SerializerFormat;
    from: ModelInstance;
    ctx: SerializerCtx & CoreSerializerCtx;
  }) => FieldTypeMap<FieldDefinition<T>>[T][keyof FieldTypeMap<FieldDefinition<T>>[T]] | unknown;

  serialize(
    value: unknown,
    format: SerializerFormat,
    from: ModelInstance,
    ctx: SerializerCtx & CoreSerializerCtx,
  ) {
    const s = {
      [SerializerFormat.JSON]: this.sJSON,
      [SerializerFormat.OBJECT]: this.sObject,
      [SerializerFormat.DOCUMENT]: this.sDocument,
    }[format];

    if (s) {
      return s({ value, from, ctx });
    }

    return this.sTo?.({ value, format, from, ctx });
  }

  toJSON() {
    return {
      type: this.type,
      options: this.options,
      path: this.#path,
    };
  }
}

export default Field;
