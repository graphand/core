import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Job from "@/models/Job";
import ValidatorTypes from "@/enums/validator-types";
import MergeRequestTypes from "@/enums/merge-request-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class MergeRequest extends Model {
  static __name = "MergeRequest";
  static allowMultipleOperations = false;
  static slug = "mergeRequests" as const;
  static definition = {
    keyField: "slug",
    fields: {
      slug: { type: FieldTypes.TEXT },
      type: {
        type: FieldTypes.TEXT,
        options: {
          enum: Object.values(MergeRequestTypes),
          strict: true,
          default: MergeRequestTypes.STATIC,
        },
      },
      options: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            source: {
              type: FieldTypes.TEXT,
            },
            query: {
              type: FieldTypes.NESTED,
            },
            gdx: {
              type: FieldTypes.NESTED,
            },
          },
        },
      },
      target: { type: FieldTypes.TEXT },
      _closed: {
        type: FieldTypes.BOOLEAN,
        options: {
          default: false,
        },
      },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "options" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "target" } },
    ],
  } satisfies ModelDefinition;
}

export default MergeRequest;
