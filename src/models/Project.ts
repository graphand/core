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
import { ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Project extends Model {
  static __name = "Project";

  static slug = "projects";
  static scope = ModelEnvScopes.GLOBAL;
  static validators: ValidatorsDefinition = [
    // { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
    // { type: ValidatorTypes.REQUIRED, options: { field: "slug" } },
    // { type: ValidatorTypes.REQUIRED, options: { field: "organization" } },
    // { type: ValidatorTypes.UNIQUE, options: { field: "slug" } },
    // {
    //   type: ValidatorTypes.REGEX,
    //   options: { field: "slug", pattern: "^[a-zA-Z0-9_\\-]+$" },
    // },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT, { default: "free" })
  plan: FieldTextDefinition;

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
