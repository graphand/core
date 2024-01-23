import { FieldDefinition } from "@/types";
import FieldTypes from "@/enums/field-types";

const systemFields: Record<string, FieldDefinition> = {
  _id: { type: FieldTypes.ID },
  _createdAt: { type: FieldTypes.DATE },
  _createdBy: { type: FieldTypes.IDENTITY },
  _updatedAt: { type: FieldTypes.DATE },
  _updatedBy: { type: FieldTypes.IDENTITY },
};

export default systemFields;
