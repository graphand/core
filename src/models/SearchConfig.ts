import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import Job from "@/models/Job";
import { ModelDefinition } from "@/types";

@modelDecorator()
class SearchConfig extends Model {
  static __name = "SearchConfig";
  static slug = "searchConfigs" as const;
  static definition = {
    keyField: "slug",
    fields: {
      slug: { type: FieldTypes.TEXT },
      source: { type: FieldTypes.TEXT },
      filter: { type: FieldTypes.NESTED },
      properties: { type: FieldTypes.NESTED },
      analysis: { type: FieldTypes.NESTED },
      _job: {
        type: FieldTypes.RELATION,
        options: {
          ref: Job.slug,
        },
      },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "source" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "properties" } },
    ],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.ENV;
  static allowMultipleOperations = false;
}

export default SearchConfig;
