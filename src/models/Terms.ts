import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";

@modelDecorator()
class Terms extends Model {
  static __name = "Terms";

  static slug = "terms";
  static scope = ModelEnvScopes.GLOBAL;
  static validators: ValidatorsDefinition = [
    { type: ValidatorTypes.REQUIRED, options: { field: "content" } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  content: FieldDefinitionText;
}

export default Terms;
