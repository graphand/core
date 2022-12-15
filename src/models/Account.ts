import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../types";

@modelDecorator()
class Account extends Model {
  static extendable = true;
  static __name = "Account";
  static slug = "accounts";
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT)
  firstname: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  lastname: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  email: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  password: FieldTextDefinition;

  @fieldDecorator(FieldTypes.RELATION, { ref: "Role", multiple: false })
  role: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;
}

export default Account;
