import { ModelDefinition } from "@/types";
import Model from "@/lib/Model";
import Role from "@/models/Role";
import { modelDecorator } from "@/lib/modelDecorator";
import ValidatorTypes from "@/enums/validator-types";
import FieldTypes from "@/enums/field-types";

@modelDecorator()
class Account extends Model {
  static __name = "Account";
  static searchable = true;
  static extensible = true;
  static isEnvironmentScoped = true;
  static slug = "accounts" as const;
  static definition = {
    fields: {
      role: {
        type: FieldTypes.RELATION,
        options: {
          ref: Role.slug,
        },
      },
      _email: { type: FieldTypes.TEXT },
      _lastLoginAt: { type: FieldTypes.DATE },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
      { type: ValidatorTypes.UNIQUE, options: { field: "_email" } },
    ],
  } satisfies ModelDefinition;
}

export default Account;
