import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { FieldTextDefinition } from "../lib/fields/FieldText";
import { FieldJSONDefinition } from "../lib/fields/FieldJSON";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class DataModel extends Model {
  static __name = "DataModel";
  static slug = "datamodels";
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator("Text")
  name: FieldTextDefinition;

  @fieldDecorator("Text")
  slug: FieldTextDefinition;

  @fieldDecorator("JSON")
  schema: FieldJSONDefinition;
}

export default DataModel;
