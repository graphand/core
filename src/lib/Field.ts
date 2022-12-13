import FieldTypes from "../enums/field-types";
import Model from "./Model";

export type FieldOptions<T extends string | FieldTypes> = T extends
  | FieldTypes.TEXT
  | "Text"
  ? {
      default?: string;
      multiple?: boolean;
    }
  : T extends FieldTypes.RELATION | "Relation"
  ? {
      ref: string;
      multiple?: boolean;
    }
  : T extends FieldTypes.NUMBER | "Number"
  ? {
      default?: number;
    }
  : never;

class Field<T extends string | FieldTypes = string | FieldTypes> {
  private __options: FieldOptions<T>;

  constructor(options: FieldOptions<T> = {} as any) {
    this.__options = options;
  }

  get options() {
    return this.__options;
  }

  isSerialized(value): boolean {
    return false;
  }

  serialize(decodedValue: any, from: Model) {
    return decodedValue;
  }

  deserialize(encodedValue: any, from: Model) {
    return encodedValue;
  }
}

export default Field;
