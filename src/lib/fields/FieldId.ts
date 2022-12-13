import Field from "../Field";
import Model from "../Model";
import FieldTypes from "../../enums/field-types";

class FieldId extends Field<FieldTypes.ID> {
  isSerialized(value): boolean {
    return typeof value === "string";
  }

  serialize(decodedValue: object | string, from: Model) {
    return String(decodedValue);
  }

  deserialize(encodedValue: any, from: Model) {
    return String(encodedValue);
  }
}

export type FieldIdDefinition = string;

export default FieldId;
