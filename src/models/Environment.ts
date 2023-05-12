import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import { ValidatorsDefinition } from "../types";
import Patterns from "../enums/patterns";

@modelDecorator()
class Environment extends Model {
  static __name = "Environment";

  static slug = "environments";
  static scope = ModelEnvScopes.PROJECT;
  static keyField = "name";
  static validators: ValidatorsDefinition = [
    {
      type: ValidatorTypes.REGEX,
      options: { field: "name", pattern: Patterns.SLUG },
    },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "name", pattern: "^(?!master$|main$).*$" },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.RELATION, { ref: Environment.slug })
  base: FieldDefinitionRelation<Environment>;
}

export default Environment;
