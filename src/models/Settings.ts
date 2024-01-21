import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import { JSONType, ModelDefinition } from "@/types";
import FieldTypes from "@/enums/field-types";

@modelDecorator()
class Settings extends Model {
  static __name = "Settings";
  static slug = "settings";
  static definition: ModelDefinition = {
    keyField: "key",
  };

  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT)
  key: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED)
  data: FieldDefinitionNested<JSONType>;
}

export default Settings;
