import Model from "../lib/Model";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class Media extends Model {
  static __name = "Media";
  static slug = "medias";
}

export default Media;
