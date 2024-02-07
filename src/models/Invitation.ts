import { ModelDefinition } from "@/types";
import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import ValidatorTypes from "@/enums/validator-types";
import FieldTypes from "@/enums/field-types";
import Account from "@/models/Account";
import Patterns from "@/enums/patterns";

@modelDecorator()
class Invitation extends Model {
  static __name = "Invitation";
  static isEnvironmentScoped = true;
  static allowMultipleOperations = false;
  static slug = "invitations" as const;
  static definition = {
    fields: {
      firstname: { type: FieldTypes.TEXT },
      lastname: { type: FieldTypes.TEXT },
      email: { type: FieldTypes.TEXT },
      account: { type: FieldTypes.RELATION, options: { ref: Account.slug } },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "firstname" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "lastname" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "account" } },
      { type: ValidatorTypes.REGEX, options: { field: "email", pattern: Patterns.EMAIL } },
    ],
  } satisfies ModelDefinition;
}

export default Invitation;
