import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Organization from "@/models/Organization";
import { ModelDefinition } from "@/types";
import ValidatorTypes from "@/enums/validator-types";

@modelDecorator()
class Project extends Model {
  static __name = "Project";
  static slug = "projects";
  static definition: ModelDefinition = {
    keyField: "slug",
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "name" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "organization" } },
    ],
  };

  static scope = ModelEnvScopes.GLOBAL;
  static allowMultipleOperations = false;

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

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      enabled: { type: FieldTypes.BOOLEAN, options: { default: false } },
      cronExpression: { type: FieldTypes.TEXT },
    },
  })
  backupSchedule: FieldDefinitionNested<{
    enabled: FieldDefinitionBoolean;
    cronExpression: FieldDefinitionText;
  }>;

  @fieldDecorator(FieldTypes.TEXT)
  version: FieldDefinitionText;
}

export default Project;
