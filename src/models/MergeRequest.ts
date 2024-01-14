import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";
import Job from "@/models/Job";
import ValidatorTypes from "@/enums/validator-types";

@modelDecorator()
class MergeRequest extends Model {
  static __name = "MergeRequest";
  static slug = "mergeRequests";
  static definition: ModelDefinition = {
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "source" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "target" } },
    ],
  };

  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  source: FieldDefinitionText; // Account merge, manual, IA, etc

  @fieldDecorator(FieldTypes.TEXT)
  target: FieldDefinitionText; // The target environment name

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default MergeRequest;
