import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { FieldTextDefinition } from "../lib/fields/FieldText";
import { FieldRelationDefinition } from "../lib/fields/FieldRelation";
import Role from "./Role";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class Account extends Model {
  static extendable = true;
  static __name = "Account";
  static slug = "accounts";
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator("Text")
  firstname: FieldTextDefinition;

  @fieldDecorator("Text")
  lastname: FieldTextDefinition;

  @fieldDecorator("Text")
  email: FieldTextDefinition;

  @fieldDecorator("Text")
  password: FieldTextDefinition;

  @fieldDecorator("Relation", { ref: "Role", multiple: false })
  role: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;
}

export default Account;
