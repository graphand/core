import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Job from "@/models/Job";
import ValidatorTypes from "@/enums/validator-types";
import MergeRequestTypes from "@/enums/merge-request-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class MergeRequest extends Model {
  // class MergeRequest<T extends MergeRequestTypes = MergeRequestTypes> extends Model {
  static __name = "MergeRequest";
  static slug = "mergeRequests" as const;
  static definition = {
    keyField: "slug",
    fields: {
      slug: { type: FieldTypes.TEXT },
      type: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(MergeRequestTypes),
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

  static scope = ModelEnvScopes.PROJECT;
  static allowMultipleOperations = false;

  // @fieldDecorator(FieldTypes.TEXT)
  // slug: FieldDefinitionText;

  // @fieldDecorator(FieldTypes.TEXT, {
  //   options: Object.values(MergeRequestTypes),
  //   strict: true,
  //   default: MergeRequestTypes.STATIC,
  // })
  // type: T;

  // @fieldDecorator(FieldTypes.NESTED)
  // options: FieldDefinitionNested<MergeRequestOptions<T>>;

  // @fieldDecorator(FieldTypes.TEXT)
  // target: FieldDefinitionText; // The target environment name

  // @fieldDecorator(FieldTypes.BOOLEAN)
  // _closed: FieldDefinitionBoolean;

  // @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  // _job: FieldDefinitionRelation<Job>;
}

export default MergeRequest;
