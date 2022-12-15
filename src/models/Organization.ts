import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { FieldTextDefinition } from "../types";

@modelDecorator()
class Organization extends Model {
  static __name = "Organization";
  static slug = "organizations";
  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator(FieldTypes.TEXT)
  name: FieldTextDefinition;
}

export default Organization;
