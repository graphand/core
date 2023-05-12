import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import Organization from "./Organization";
import Account from "./Account";
import { ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";
import Patterns from "../enums/patterns";

@modelDecorator()
class Project extends Model {
  static __name = "Project";

  static slug = "projects";
  static scope = ModelEnvScopes.GLOBAL;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "slug" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "organization" } },
    { type: ValidatorTypes.UNIQUE, options: { field: "slug" } },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "slug", pattern: Patterns.SLUG },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT, { default: "free" })
  plan: FieldDefinitionText;

  @fieldDecorator(FieldTypes.RELATION, { ref: Organization.slug })
  organization: FieldDefinitionRelation<Organization>;

  @fieldDecorator(FieldTypes.NUMBER, { default: 86400 })
  accessTokenLifetime: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.NUMBER, { default: 2592000 })
  refreshTokenLifetime: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.RELATION, { ref: Account.slug })
  owner: FieldDefinitionRelation<Account>;
}

export default Project;
