import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Media extends Model {
  static __name = "Media";
  static extensible = true;
  static connectable = true;
  static slug = "medias" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: { type: FieldTypes.TEXT },
      private: { type: FieldTypes.BOOLEAN, options: { default: false } },
      _mimetype: { type: FieldTypes.TEXT },
      _originalname: { type: FieldTypes.TEXT },
      _size: { type: FieldTypes.NUMBER },
    },
  } satisfies ModelDefinition;
}

export default Media;
