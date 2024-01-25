import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldId extends Field<FieldTypes.ID> {
  sTo: Field<FieldTypes.ID>["sTo"] = ({ value }) => String(value);
}

export default FieldId;
