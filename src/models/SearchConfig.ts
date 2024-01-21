import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { Filter, JSONType, ModelDefinition } from "@/types";
import ValidatorTypes from "@/enums/validator-types";
import Job from "@/models/Job";

@modelDecorator()
class SearchConfig extends Model {
  static __name = "SearchConfig";
  static slug = "searchConfigs";
  static definition: ModelDefinition = {
    keyField: "slug",
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "source" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "properties" } },
    ],
  };

  static scope = ModelEnvScopes.ENV;
  static allowMultipleOperations = false;

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  source: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED)
  filter: FieldDefinitionNested<Filter>;

  @fieldDecorator(FieldTypes.NESTED)
  properties: FieldDefinitionNested<JSONType>; // mappings.properties

  @fieldDecorator(FieldTypes.NESTED)
  analysis: FieldDefinitionNested<JSONType>; // settings.analysis

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default SearchConfig;
