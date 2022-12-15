import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../types";

@modelDecorator()
class Role extends Model {
  static __name = "Role";
  static slug = "roles";
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldTextDefinition;

  @fieldDecorator(FieldTypes.BOOLEAN)
  admin;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "roles",
    multiple: false,
  })
  inherits: FieldRelationDefinition<{
    model: Role;
    multiple: false;
  }>;
}

export default Role;
