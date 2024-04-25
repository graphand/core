import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Settings extends Model {
  static __name = "Settings";
  static allowMultipleOperations = false;
  static slug = "settings" as const;
  static definition = {
    keyField: "key",
    fields: {
      key: { type: FieldTypes.TEXT },
      data: {
        type: FieldTypes.NESTED,
        options: { default: {} },
      },
    },
  } satisfies ModelDefinition;
}

export default Settings;
