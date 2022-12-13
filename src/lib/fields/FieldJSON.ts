import Field from "../Field";
import Model from "../Model";
import FieldTypes from "../../enums/field-types";

class FieldJSON extends Field<FieldTypes.JSON> {
  isSerialized(value): boolean {
    return typeof value === "object";
  }

  serialize(decodedValue: any, from: Model) {
    return decodedValue;
  }

  deserialize(encodedValue: any, from: Model) {
    return encodedValue;
  }
}

export type FieldJSONDefinition<T extends { [key: string]: any } = any> =
  | T
  | undefined;

export default FieldJSON;
