import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../fields";

@modelDecorator()
class Account extends Model {
  static __name = "Account";

  static extendable = true;
  static slug = "accounts";
  static scope = ModelEnvScopes.ENV;
  static validators = [
    { type: ValidatorTypes.REQUIRED, options: { field: "email" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "password" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "role" } },
    { type: ValidatorTypes.UNIQUE, options: { field: "email" } },
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
}

export default Account;
