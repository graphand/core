import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";
import { fieldDecorator } from "../lib/fieldDecorator";
import FieldTypes from "../enums/field-types";
import { FieldTextDefinition } from "../fields";

@modelDecorator()
class User extends Model {
  static __name = "User";

  static extendable = false;
  static slug = "users";
  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator(FieldTypes.TEXT)
  email: FieldTextDefinition;

  @fieldDecorator(FieldTypes.TEXT)
  password: FieldTextDefinition;
}

export default User;
