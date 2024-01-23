import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import Patterns from "@/enums/patterns";
import { ModelDefinition } from "@/types";

@modelDecorator()
class User extends Model {
  static __name = "User";
  static definition = {
    fields: {
      firstname: { type: FieldTypes.TEXT },
      lastname: { type: FieldTypes.TEXT },
      email: { type: FieldTypes.TEXT },
      password: { type: FieldTypes.TEXT },
      pendingEmail: { type: FieldTypes.TEXT },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "firstname" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "lastname" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "password" } },
      { type: ValidatorTypes.UNIQUE, options: { field: "email" } },
      { type: ValidatorTypes.REGEX, options: { field: "email", pattern: Patterns.EMAIL } },
    ],
  } satisfies ModelDefinition;

  static slug = "users" as const;
  static scope = ModelEnvScopes.GLOBAL;
}

export default User;
