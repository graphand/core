import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Role from "@/models/Role";
import { ModelDefinition } from "@/types";

@modelDecorator()
class AuthProvider extends Model {
  // class AuthProvider<T extends AuthProviders = AuthProviders> extends Model {
  static __name = "AuthProvider";
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

  static scope = ModelEnvScopes.ENV;

  // @fieldDecorator(FieldTypes.TEXT, {
  //   options: Object.values(AuthProviders),
  //   strict: true,
  // })
  // type: T;

  // @fieldDecorator(FieldTypes.NESTED)
  // options: FieldDefinitionNested<AuthProviderOptions<T>>;

  // @fieldDecorator(FieldTypes.BOOLEAN, { default: true })
  // enabled: FieldDefinitionBoolean;

  // @fieldDecorator(FieldTypes.NESTED, {
  //   fields: {
  //     enabled: { type: FieldTypes.BOOLEAN, options: { default: true } },
  //     role: { type: FieldTypes.RELATION, options: { ref: Role.slug } },
  //     options: { type: FieldTypes.NESTED },
  //   },
  // })
  // register: FieldDefinitionNested<{
  //   enabled: FieldDefinitionBoolean;
  //   role: FieldDefinitionRelation<Role>;
  //   options: FieldDefinitionNested<AuthProviderRegisterOptions<T>>;
  // }>;
}

export default AuthProvider;
