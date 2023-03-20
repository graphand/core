import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
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
  firstname: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  lastname: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  email: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  password: FieldDefinitionText;

  @fieldDecorator(FieldTypes.RELATION, { ref: "roles", multiple: false })
  role: FieldDefinitionRelation<{
    model: Role;
    multiple: false;
  }>;

  @fieldDecorator(FieldTypes.RELATION, { ref: "users", multiple: false })
  user: FieldDefinitionRelation<{
    model: User;
    multiple: false;
  }>;
}

export default Account;
