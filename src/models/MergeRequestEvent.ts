import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { MergeRequestEventData, ModelDefinition } from "@/types";
import Job from "@/models/Job";
import ValidatorTypes from "@/enums/validator-types";
import MergeRequestTypes from "@/enums/merge-request-types";
import MergeRequestEventTypes from "@/enums/merge-request-event-types";
import MergeRequest from "@/models/MergeRequest";

@modelDecorator()
class MergeRequestEvent<T extends MergeRequestEventTypes = MergeRequestEventTypes> extends Model {
  static __name = "MergeRequestEvent";
  static slug = "mergeRequestEvents";
  static definition: ModelDefinition = {
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "request" } }],
  };

  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(MergeRequestEventTypes),
    strict: true,
    default: MergeRequestTypes.STATIC,
  })
  type: T;

  @fieldDecorator(FieldTypes.NESTED)
  data: FieldDefinitionNested<MergeRequestEventData<T>>;

  @fieldDecorator(FieldTypes.RELATION, { ref: MergeRequest.slug })
  request: FieldDefinitionRelation<MergeRequest>;

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default MergeRequestEvent;
