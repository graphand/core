import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import {
  FieldDefinition,
  FieldOptions,
  ModelInstance,
  InferFieldType,
  SerializerFormat,
  SerializerFieldsMap,
  SerializerCtx,
  TransactionCtx,
} from "@/types";

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
    ctx: SerializerCtx;
  }) => InferFieldType<FieldDefinition<T>, "json">;

  sObject?: (input: {
    value: unknown;
    from: ModelInstance;
    ctx: SerializerCtx;
  }) => InferFieldType<FieldDefinition<T>, "object">;

  sDocument?: (input: {
    value: unknown;
    from: ModelInstance;
    ctx: SerializerCtx;
  }) => InferFieldType<FieldDefinition<T>, "document">;

  sTo: (input: {
    value: unknown;
    format: SerializerFormat;
    from: ModelInstance;
    ctx: SerializerCtx;
  }) => T extends keyof SerializerFieldsMap<FieldDefinition<T>>[keyof SerializerFieldsMap<
    FieldDefinition<T>
  >]
    ? SerializerFieldsMap<FieldDefinition<T>>[keyof SerializerFieldsMap<FieldDefinition<T>>][T]
    : unknown;

  serialize(value: unknown, format: SerializerFormat, from: ModelInstance, ctx: SerializerCtx) {
    const s = {
      ["json"]: this.sJSON,
      ["object"]: this.sObject,
      ["document"]: this.sDocument,
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
