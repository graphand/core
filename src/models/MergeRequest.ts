import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { MergeRequestOptions, ModelDefinition } from "@/types";
import Job from "@/models/Job";
import ValidatorTypes from "@/enums/validator-types";
import MergeRequestTypes from "@/enums/merge-request-types";

@modelDecorator()
class MergeRequest<T extends MergeRequestTypes = MergeRequestTypes> extends Model {
  static __name = "MergeRequest";
  static slug = "mergeRequests";
  static definition: ModelDefinition = {
    keyField: "slug",
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "options" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "target" } },
    ],
  };

  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(MergeRequestTypes),
    strict: true,
    default: MergeRequestTypes.STATIC,
  })
  type: T;

  @fieldDecorator(FieldTypes.NESTED)
  options: FieldDefinitionNested<MergeRequestOptions<T>>;

  @fieldDecorator(FieldTypes.TEXT)
  target: FieldDefinitionText; // The target environment name

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default MergeRequest;
