import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Job from "@/models/Job";
import ValidatorTypes from "@/enums/validator-types";
import MergeRequestTypes from "@/enums/merge-request-types";
import MergeRequestEventTypes from "@/enums/merge-request-event-types";
import MergeRequest from "@/models/MergeRequest";
import { ModelDefinition } from "@/types";

@modelDecorator()
class MergeRequestEvent extends Model {
  // class MergeRequestEvent<T extends MergeRequestEventTypes = MergeRequestEventTypes> extends Model {
  static __name = "MergeRequestEvent";
  static slug = "mergeRequestEvents" as const;
  static definition = {
    fields: {
      type: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(MergeRequestEventTypes),
          strict: true,
          default: MergeRequestTypes.STATIC,
        },
      },
      data: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            close: {
              type: FieldTypes.BOOLEAN,
            },
            comment: {
              type: FieldTypes.TEXT,
            },
            apply: {
              type: FieldTypes.NESTED,
            },
          },
        },
      },
      request: {
        type: FieldTypes.RELATION,
        options: {
          ref: MergeRequest.slug,
        },
      },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
    },
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "request" } }],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.PROJECT;
  static allowMultipleOperations = false;

  // @fieldDecorator(FieldTypes.TEXT, {
  //   options: Object.values(MergeRequestEventTypes),
  //   strict: true,
  //   default: MergeRequestTypes.STATIC,
  // })
  // type: T;

  // @fieldDecorator(FieldTypes.NESTED)
  // data: FieldDefinitionNested<MergeRequestEventData<T>>;

  // @fieldDecorator(FieldTypes.RELATION, { ref: MergeRequest.slug })
  // request: FieldDefinitionRelation<MergeRequest>;

  // @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  // _job: FieldDefinitionRelation<Job>;
}

export default MergeRequestEvent;
