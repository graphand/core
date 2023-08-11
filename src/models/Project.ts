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
import Plans from "../enums/plans";

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

  @fieldDecorator(FieldTypes.RELATION, { ref: Organization.slug })
  organization: FieldDefinitionRelation<Organization>;

  @fieldDecorator(FieldTypes.NUMBER, { default: 86400 })
  accessTokenLifetime: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.NUMBER, { default: 2592000 })
  refreshTokenLifetime: FieldDefinitionNumber;

  @fieldDecorator(FieldTypes.RELATION, { ref: Account.slug })
  owner: FieldDefinitionRelation<Account>;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      plan: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(Plans),
          strict: true,
        },
      },
      customLimits: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            accounts: {
              type: FieldTypes.NUMBER,
              options: {},
            },
            storage: {
              type: FieldTypes.NUMBER,
              options: {},
            },
            maxMediaSize: {
              type: FieldTypes.NUMBER,
              options: {},
            },
            apiCalls: {
              type: FieldTypes.NUMBER,
              options: {},
            },
            apiBandwidth: {
              type: FieldTypes.NUMBER,
              options: {},
            },
            maxAggregationTime: {
              type: FieldTypes.NUMBER,
              options: {},
            },
            blockingSockethooks: {
              type: FieldTypes.BOOLEAN,
            },
          },
        },
      },
    },
  })
  _subscription: FieldDefinitionNested<any>;
}

export default Project;
