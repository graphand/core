import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Organization from "@/models/Organization";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Project extends Model {
  static __name = "Project";
  static isSystem = true;
  static allowMultipleOperations = false;
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
}

export default Project;
