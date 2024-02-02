import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Settings extends Model {
  static __name = "Settings";
  static scope = ModelEnvScopes.ENV;
  static slug = "settings" as const;
  static definition = {
    keyField: "key",
    fields: {
      key: { type: FieldTypes.TEXT },
      data: { type: FieldTypes.NESTED },
    },
  } satisfies ModelDefinition;
}

export default Settings;
