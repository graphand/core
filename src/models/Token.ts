import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Role from "@/models/Role";
import ValidatorTypes from "@/enums/validator-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Token extends Model {
  static __name = "Token";
  static slug = "tokens" as const;
  static definition = {
    keyField: "name",
    fields: {
      name: { type: FieldTypes.TEXT },
      expiration: { type: FieldTypes.DATE },
      lifetime: { type: FieldTypes.NUMBER },
      maxGen: { type: FieldTypes.NUMBER },
      role: {
        type: FieldTypes.RELATION,
        options: {
          ref: Role.slug,
        },
      },
      _generation: {
        type: FieldTypes.NUMBER,
        options: {
          default: 0,
        },
      },
    },
    validators: [{ type: ValidatorTypes.REQUIRED, options: { field: "role" } }],
  } satisfies ModelDefinition;

  static scope = ModelEnvScopes.PROJECT;
}

export default Token;
