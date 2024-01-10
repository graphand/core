import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ModelDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Terms extends Model {
  static __name = "Terms";
  static slug = "terms";
  static definition: ModelDefinition = {
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "content" } },
    ],
  };

  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator(FieldTypes.TEXT)
  content: FieldDefinitionText;
}

export default Terms;
