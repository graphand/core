import Model from "../lib/Model";
import { modelDecorator } from "../lib/modelDecorator";

@modelDecorator()
class DataItem extends Model {
  static __slug: string;

  static generate = (slug: string): typeof DataItem => {
    return class extends DataItem {
      static __slug = slug;
    };
  };
}

export default DataItem;
