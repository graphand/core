import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ModelDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";
import Job from "./Job";

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

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  source: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED)
  filter: FieldDefinitionNested<any>;

  @fieldDecorator(FieldTypes.NESTED)
  properties: FieldDefinitionNested<any>; // mappings.properties

  @fieldDecorator(FieldTypes.NESTED)
  analysis: FieldDefinitionNested<any>; // settings.analysis

  @fieldDecorator(FieldTypes.RELATION, { ref: Job.slug })
  _job: FieldDefinitionRelation<Job>;
}

export default SearchConfig;
