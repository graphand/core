import FieldTypes from "@/enums/field-types";
import Field from "@/lib/Field";

class FieldNumber extends Field<FieldTypes.NUMBER> {
  sTo: Field<FieldTypes.NUMBER>["sTo"] = ({ value }) => Number(value);
}

export default FieldNumber;
