import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldBoolean extends Field<FieldTypes.BOOLEAN> {
  serializerMap: Field<FieldTypes.BOOLEAN>["serializerMap"] = {
    [Field.defaultSymbol]: ({ value }) => Boolean(value),
  };
}

export default FieldBoolean;
