import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { FieldTextDefinition } from "../lib/fields/FieldText";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class Organization extends Model {
  static __name = "Organization";
  static slug = "organizations";
  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator("Text")
  name: FieldTextDefinition;
}

export default Organization;
