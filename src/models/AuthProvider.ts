import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Role from "@/models/Role";
import { ModelDefinition } from "@/types";

@modelDecorator()
class AuthProvider extends Model {
  static __name = "AuthProvider";
  static scope = ModelEnvScopes.ENV;
  static slug = "authProviders" as const;
  static definition = {
    keyField: "type",
    fields: {
      type: { type: FieldTypes.TEXT },
      options: { type: FieldTypes.NESTED },
      enabled: { type: FieldTypes.BOOLEAN, options: { default: true } },
      register: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            enabled: { type: FieldTypes.BOOLEAN, options: { default: true } },
            role: {
              type: FieldTypes.RELATION,
              options: {
                ref: Role.slug,
              },
            },
            options: { type: FieldTypes.NESTED },
          },
        },
      },
    },
  } satisfies ModelDefinition;
}

export default AuthProvider;
