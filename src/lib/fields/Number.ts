import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldNumber extends Field<FieldTypes.NUMBER> {
  serializerMap: Field<FieldTypes.NUMBER>["serializerMap"] = {
    [Field.defaultSymbol]: ({ value }) => Number(value),
  };
}

export default FieldNumber;
