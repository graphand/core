import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { FieldTextDefinition } from "../lib/fields/FieldText";
import { FieldRelationDefinition } from "../lib/fields/FieldRelation";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class Role extends Model {
  static __name = "Role";
  static slug = "roles";
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator("Text")
  name: FieldTextDefinition;

  @fieldDecorator("Text")
  description: FieldTextDefinition;

  @fieldDecorator("Boolean")
  admin;

  @fieldDecorator("Relation", {
    ref: "Role",
    multiple: false,
  })
  inherits: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;
}

export default Role;
