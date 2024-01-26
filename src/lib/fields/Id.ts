import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldId extends Field<FieldTypes.ID> {
  serializerMap: Field<FieldTypes.ID>["serializerMap"] = {
    [Field.defaultSymbol]: ({ value }) => String(value),
  };
}

export default FieldId;
