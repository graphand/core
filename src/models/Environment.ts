import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldRelationDefinition, FieldTextDefinition } from "../fields";
import ValidatorTypes from "../enums/validator-types";
import { ValidatorsDefinition } from "../types";

@modelDecorator()
class Environment extends Model {
  static __name = "Environment";

  static slug = "environments";
  static scope = ModelEnvScopes.PROJECT;
  static configKey = "name";
  static validators: ValidatorsDefinition = [
    {
      type: ValidatorTypes.REGEX,
      options: { field: "name", pattern: "^[a-zA-Z0-9_\\-\\.]+$" },
    },
    {
      type: ValidatorTypes.REGEX,
      options: { field: "name", pattern: "^(?!master$|main$).*$" },
    },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;

  @fieldDecorator(FieldTypes.RELATION, {
    ref: "environments",
    multiple: false,
  })
  base: FieldRelationDefinition<{
    model: Environment;
    multiple: false;
  }>;
}

export default Environment;
