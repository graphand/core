import FieldTypes from "@/enums/field-types";
import Model from "@/lib/Model";
import { FieldDefinition, FieldOptions } from "@/types";
import { getDefaultFieldOptions } from "@/lib/utils";

class Field<T extends FieldTypes = FieldTypes> {
  #definition: FieldDefinition<T>; // The field definition
  #path: string; // The path of the field in the model
  nextFieldEqObject: boolean = true; // If false, the serializer returns a different value in NEXT_FIELD and OBJECT

  constructor(definition: FieldDefinition<T>, path: string) {
    this.#definition = definition;
    this.#path = path;

    Object.defineProperty(this, "__json", {
      enumerable: true,
      value: this.toJSON(),
    });
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
    const defaults = getDefaultFieldOptions(this.type);

    return Object.assign({}, defaults, this.#definition.options ?? {}) as FieldOptions<T>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(list: Array<Model>, model: typeof Model, ctx?: TransactionCtx) {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serialize(value: any, format: string, from: Model, ctx: SerializerCtx = {}) {
    return value;
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
