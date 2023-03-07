import Model from "../lib/Model";
import { modelDecorator } from "../lib/modelDecorator";
import ModelEnvScopes from "../enums/model-env-scopes";

@modelDecorator()
class Media extends Model {
  static __name = "Media";

  static slug = "medias";
  static scope = ModelEnvScopes.PROJECT;
}

export default Media;
