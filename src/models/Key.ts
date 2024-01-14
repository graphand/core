import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";
import ValidatorTypes from "@/enums/validator-types";

@modelDecorator()
class Key extends Model {
  static __name = "Key";
  static slug = "keys";
  static definition: ModelDefinition = {
    keyField: "name",
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "value" } },
    ],
  };

  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  value: FieldDefinitionDate;
}

export default Key;
