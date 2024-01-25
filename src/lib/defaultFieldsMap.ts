import FieldTypes from "@/enums/field-types";
import Adapter from "@/lib/Adapter";
import FieldId from "./fields/Id";
import FieldNumber from "./fields/Number";
import FieldBoolean from "./fields/Boolean";
import FieldDate from "./fields/Date";
import FieldText from "./fields/Text";
import FieldRelation from "./fields/Relation";
import FieldNested from "./fields/Nested";
import FieldIdentity from "./fields/Identity";
import FieldArray from "./fields/Array";

const defaultFieldsMap: Adapter["fieldsMap"] = {
  [FieldTypes.ID]: FieldId,
  [FieldTypes.NUMBER]: FieldNumber,
  [FieldTypes.BOOLEAN]: FieldBoolean,
  [FieldTypes.DATE]: FieldDate,
  [FieldTypes.TEXT]: FieldText,
  [FieldTypes.RELATION]: FieldRelation,
  [FieldTypes.NESTED]: FieldNested,
  [FieldTypes.IDENTITY]: FieldIdentity,
  [FieldTypes.ARRAY]: FieldArray,
};

export default defaultFieldsMap;
