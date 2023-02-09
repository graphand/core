import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import Organization from "./Organization";
import {
  FieldNumberDefinition,
  FieldRelationDefinition,
  FieldTextDefinition,
} from "../fields";
import Account from "./Account";

@modelDecorator()
class Project extends Model {
  static __name = "Project";

  static slug = "projects";
  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldTextDefinition;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "organizations",
    multiple: false,
  })
  organization: FieldRelationDefinition<{
    model: Organization;
    multiple: false;
  }>;

  @fieldDecorator(FieldTypes.NUMBER, { default: 86400 })
  accessTokenLifetime: FieldNumberDefinition;

  @fieldDecorator(FieldTypes.NUMBER, { default: 2592000 })
  refreshTokenLifetime: FieldNumberDefinition;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "accounts",
    multiple: false,
  })
  owner: FieldRelationDefinition<{
    model: Account;
    multiple: false;
  }>;
}

export default Project;
