import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class User extends Model {
  static extendable = true;
  static __name = "User";
  static slug = "users";
  static scope = ModelEnvScopes.GLOBAL;
}

export default User;
