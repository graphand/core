import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Key extends Model {
  static __name = "Key";
  static scope = ModelEnvScopes.PROJECT;
  static slug = "keys" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: { type: FieldTypes.TEXT },
      value: { type: FieldTypes.TEXT },
    },
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "value" } }],
  } satisfies ModelDefinition;
}

export default Key;
