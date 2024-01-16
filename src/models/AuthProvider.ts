import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import {
  AuthProviderRegisterOptions,
  AuthProviderOptions,
  ModelDefinition,
} from "@/types";
import AuthProviders from "@/enums/auth-providers";
import Role from "@/models/Role";

@modelDecorator()
class AuthProvider<T extends AuthProviders = AuthProviders> extends Model {
  static __name = "AuthProvider";
  static slug = "authProviders";
  static definition: ModelDefinition = {
    keyField: "type",
  };

  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(AuthProviders),
    strict: true,
  })
  type: T;

  @fieldDecorator(FieldTypes.NESTED)
  options: FieldDefinitionNested<AuthProviderOptions<T>>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: true })
  enabled: FieldDefinitionBoolean;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      enabled: { type: FieldTypes.BOOLEAN, options: { default: true } },
      role: { type: FieldTypes.RELATION, options: { ref: Role.slug } },
      options: { type: FieldTypes.NESTED },
    },
  })
  register: FieldDefinitionNested<{
    enabled: FieldDefinitionBoolean;
    role: FieldDefinitionRelation<Role>;
    options: FieldDefinitionNested<AuthProviderRegisterOptions<T>>;
  }>;
}

export default AuthProvider;
