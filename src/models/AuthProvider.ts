import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { AuthProviderOptions } from "../types";
import AuthProviders from "../enums/auth-providers";

@modelDecorator()
class AuthProvider<T extends AuthProviders = AuthProviders> extends Model {
  static __name = "AuthProvider";

  static slug = "authProviders";
  static scope = ModelEnvScopes.ENV;
  static keyField = "type";

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(AuthProviders),
    strict: true,
  })
  type: FieldDefinitionText<{
    options: Array<AuthProviders>;
    strict: true;
  }>;

  @fieldDecorator(FieldTypes.NESTED)
  options: FieldDefinitionNested<AuthProviderOptions<T>>;

  @fieldDecorator(FieldTypes.BOOLEAN, { default: true })
  enabled: boolean;
}

export default AuthProvider;
