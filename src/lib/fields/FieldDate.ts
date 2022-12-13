import Field from "../Field";
import Model from "../Model";

class FieldDate extends Field {
  serialize(decodedValue: any, from: Model) {
    if (decodedValue instanceof Date) {
      return decodedValue;
    }

    return new Date(decodedValue);
  }

  deserialize(encodedValue: any, from: Model) {
    if (encodedValue instanceof Date) {
      return encodedValue;
    }

    return new Date(encodedValue);
  }
}

export type FieldDateDefinition = Date | undefined;

export default FieldDate;
