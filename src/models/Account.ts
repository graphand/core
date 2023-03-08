import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../fields";
import User from "./User";
import { ValidatorsDefinition } from "../types";

@modelDecorator()
class Account extends Model {
  static __name = "Account";

  static extendable = true;
  static slug = "accounts";
  static scope = ModelEnvScopes.ENV;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
    { type: ValidatorTypes.UNIQUE, options: { field: "email" } },
    {
      type: ValidatorTypes.REGEX,
      options: {
        field: "email",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  firstname: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  lastname: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  email: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  password: FieldTextDefinition;

  @fieldDecorator(FieldTypes.RELATION, { ref: "roles", multiple: false })
  role: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;

  @fieldDecorator(FieldTypes.RELATION, { ref: "users", multiple: false })
  user: FieldRelationDefinition<{
    model: User;
    multiple: false;
  }>;
}

export default Account;
