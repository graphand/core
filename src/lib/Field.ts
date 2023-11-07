import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { FieldDefinition, FieldOptions } from "../types";
import SerializerFormat from "../enums/serializer-format";
import { getDefaultFieldOptions } from "./utils";

class Field<T extends FieldTypes = FieldTypes> {
  __definition: FieldDefinition<T>;
  __path: string;
  nextFieldEqObject: boolean = true; // If false, the serializer returns a different value in NEXT_FIELD and OBJECT

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

  get path() {
    return this.__path;
  }

  async validate(list: Array<Model>, ctx: ExecutorCtx = {}) {
    return true;
  }

  serialize(
    value: any,
    format: SerializerFormat | string,
    from: Model,
    ctx: SerializerCtx = {}
  ) {
    return value;
  }

  toJSON() {
    return {
      type: this.type,
      options: this.options,
      path: this.__path,
    };
  }
}

export default Field;
