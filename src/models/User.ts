import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";
import { fieldDecorator } from "../lib/fieldDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import { ValidatorsDefinition } from "../types";
import Patterns from "../enums/patterns";

@modelDecorator()
class User extends Model {
  static __name = "User";

  static slug = "users";
  static scope = ModelEnvScopes.GLOBAL;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "firstname" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "lastname" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "password" } },
    { type: ValidatorTypes.UNIQUE, options: { field: "email" } },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "email", pattern: Patterns.EMAIL },
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

  @fieldDecorator(FieldTypes.TEXT)
  pendingEmail: FieldDefinitionText;
}

export default User;
