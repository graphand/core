import Field from "../Field";
import Model from "../Model";
import FieldTypes from "../../enums/field-types";

class FieldNumber extends Field<FieldTypes.TEXT> {
  deserialize(value, from: Model) {
    return Number(value);
  }

  serialize(value) {
    return Number(value);
  }
}

export type FieldNumberDefinition<
  D extends {
    required?: boolean;
  } = { required: false },
  Required extends boolean = false
> = Required extends true
  ? number
  : D["required"] extends true
  ? FieldNumberDefinition<D, true>
  : FieldNumberDefinition<D, true> | undefined;

export default FieldNumber;
