import { ModelDefinition } from "@/types";
import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import Role from "@/models/Role";
import { modelDecorator } from "@/lib/modelDecorator";
import ValidatorTypes from "@/enums/validator-types";
import User from "@/models/User";
import Patterns from "@/enums/patterns";
import FieldTypes from "@/enums/field-types";

@modelDecorator()
class Account extends Model {
  static __name = "Account";
  static searchable = true;
  static extensible = true;
  static scope = ModelEnvScopes.ENV;
  static slug = "accounts" as const;
  static definition = {
    fields: {
      firstname: { type: FieldTypes.TEXT },
      lastname: { type: FieldTypes.TEXT },
      email: { type: FieldTypes.TEXT },
      role: {
        type: FieldTypes.RELATION,
        options: {
          ref: Role.slug,
        },
      },
      _user: {
        type: FieldTypes.RELATION,
        options: {
          ref: User.slug,
        },
      },
      _lastLoginAt: { type: FieldTypes.DATE },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
      { type: ValidatorTypes.UNIQUE, options: { field: "email" } },
      {
        type: ValidatorTypes.REGEX,
        options: { field: "email", pattern: Patterns.EMAIL },
      },
    ],
  } satisfies ModelDefinition;
}

export default Account;
