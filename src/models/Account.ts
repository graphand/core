import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import User from "./User";
import Patterns from "../enums/patterns";
import { ModelDefinition } from "src/types";

@modelDecorator()
class Account extends Model {
  static __name = "Account";
  static searchable = true;
  static extendable = true;
  static scope = ModelEnvScopes.ENV;

  static slug = "accounts";
  static definition: ModelDefinition = {
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
      { type: ValidatorTypes.UNIQUE, options: { field: "email" } },
      {
        type: ValidatorTypes.REGEX,
        options: { field: "email", pattern: Patterns.EMAIL },
      },
    ],
  };

  @fieldDecorator(FieldTypes.TEXT)
  firstname: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  lastname: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  email: FieldDefinitionText;

  @fieldDecorator(FieldTypes.RELATION, { ref: Role.slug })
  role: FieldDefinitionRelation<Role>;

  @fieldDecorator(FieldTypes.RELATION, { ref: User.slug })
  _user: FieldDefinitionRelation<User>;

  @fieldDecorator(FieldTypes.DATE)
  _lastLoginAt: FieldDefinitionDate;
}

export default Account;
