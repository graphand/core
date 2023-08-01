import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import User from "./User";
import { ValidatorsDefinition } from "../types";
import Patterns from "../enums/patterns";

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
      options: { field: "email", pattern: Patterns.EMAIL },
    },
  ];

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

  // @fieldDecorator(FieldTypes.NESTED)
  // _auth: FieldDefinitionNested<{
  //   [provider in AuthProviders]: AccountAuthConfiguration<provider>;
  // }>;
}

export default Account;
