import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { FieldTextDefinition } from "../lib/fields/FieldText";
import { modelDecorator } from "../lib/modelDecorator";
import { FieldRelationDefinition } from "../lib/fields/FieldRelation";
import Organization from "./Organization";

@modelDecorator()
class Project extends Model {
  static __name = "Project";
  static slug = "projects";
  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator("Text")
  name: FieldTextDefinition;

  @fieldDecorator("Relation", { ref: "Organization", multiple: false })
  organization: FieldRelationDefinition<{
    model: Organization;
    multiple: false;
  }>;

  @fieldDecorator("Number", { default: 86400 })
  accessTokenLifetime;

  @fieldDecorator("Number", { default: 2592000 })
  refreshTokenLifetime;
}

export default Project;
