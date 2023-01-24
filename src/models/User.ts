import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class User extends Model {
  static __name = "User";

  static extendable = true;
  static slug = "users";
  static scope = ModelEnvScopes.GLOBAL;
}

export default User;
