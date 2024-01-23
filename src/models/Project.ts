import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Organization from "@/models/Organization";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Project extends Model {
  static __name = "Project";
  static slug = "projects" as const;
  static definition = {
    keyField: "slug",
    fields: {
      name: { type: FieldTypes.TEXT },
      slug: { type: FieldTypes.TEXT },
      organization: {
        type: FieldTypes.RELATION,
        options: {
          ref: Organization.slug,
        },
      },
      accessTokenLifetime: {
        type: FieldTypes.NUMBER,
        options: {
          default: 86400,
        },
      },
      refreshTokenLifetime: {
        type: FieldTypes.NUMBER,
        options: {
          default: 2592000,
        },
      },
      backupSchedule: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            enabled: {
              type: FieldTypes.BOOLEAN,
              options: {
                default: false,
              },
            },
            cronExpression: {
              type: FieldTypes.TEXT,
            },
          },
        },
      },
      version: {
        type: FieldTypes.TEXT,
      },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "organization" } },
    ],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.GLOBAL;
  static allowMultipleOperations = false;

  // @fieldDecorator(FieldTypes.TEXT)
  // name: FieldDefinitionText;

  // @fieldDecorator(FieldTypes.TEXT)
  // slug: FieldDefinitionText;

  // @fieldDecorator(FieldTypes.RELATION, { ref: Organization.slug })
  // organization: FieldDefinitionRelation<Organization>;

  // @fieldDecorator(FieldTypes.NUMBER, { default: 86400 })
  // accessTokenLifetime: FieldDefinitionNumber;

  // @fieldDecorator(FieldTypes.NUMBER, { default: 2592000 })
  // refreshTokenLifetime: FieldDefinitionNumber;

  // @fieldDecorator(FieldTypes.NESTED, {
  //   fields: {
  //     enabled: { type: FieldTypes.BOOLEAN, options: { default: false } },
  //     cronExpression: { type: FieldTypes.TEXT },
  //   },
  // })
  // backupSchedule: FieldDefinitionNested<{
  //   enabled: FieldDefinitionBoolean;
  //   cronExpression: FieldDefinitionText;
  // }>;

  // @fieldDecorator(FieldTypes.TEXT)
  // version: FieldDefinitionText;
}

export default Project;
