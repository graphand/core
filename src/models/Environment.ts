import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import Job from "@/models/Job";
import MergeRequest from "@/models/MergeRequest";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Environment extends Model {
  static __name = "Environment";
  static slug = "environments" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: {
        type: FieldTypes.TEXT,
      },
      _base: {
        type: FieldTypes.RELATION,
        options: {
          ref: Environment.slug,
        },
      },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
      _fromRequest: {
        type: FieldTypes.RELATION,
        options: {
          ref: MergeRequest.slug,
        },
      },
    },
    validators: [
      {
        type: ValidatorTypes.REGEX,
        options: { field: "name", pattern: "^(?!master$|main$).*$" },
      },
    ],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.PROJECT;
  static allowMultipleOperations = false;

  // @fieldDecorator(FieldTypes.TEXT)
  // name: FieldDefinitionText;

  // @fieldDecorator(FieldTypes.RELATION, { ref: Environment.slug })
  // base: FieldDefinitionRelation<Environment>;

  // @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  // _job: FieldDefinitionRelation<Job>;

  // @fieldDecorator(FieldTypes.RELATION, { ref: MergeRequest.slug })
  // _fromRequest: FieldDefinitionRelation<MergeRequest>;
}

export default Environment;
