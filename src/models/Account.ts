import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import Validator from "../lib/Validator";
import { FieldRelationDefinition, FieldTextDefinition } from "../fields";

@modelDecorator()
class Account extends Model {
  static extendable = true;
  static __name = "Account";
  static slug = "accounts";
  static scope = ModelEnvScopes.ENV;
  static __validators = new Set([
    new Validator(ValidatorTypes.REQUIRED, { field: "email" }),
    new Validator(ValidatorTypes.REQUIRED, { field: "password" }),
    new Validator(ValidatorTypes.REQUIRED, { field: "role" }),
    new Validator(ValidatorTypes.UNIQUE, { field: "email" }),
  ]);

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
