import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import ValidatorTypes from "../enums/validator-types";
import { AccountAuthConfiguration, ModelDefinition } from "../types";
import Account from "./Account";
import AuthProvider from "./AuthProvider";
import AuthProviders from "../enums/auth-providers";

@modelDecorator()
class AccountAuthProvider<
  T extends AuthProviders = AuthProviders
> extends Model {
  static __name = "AccountAuthProvider";
  static slug = "accounts_authProviders";
  static definition: ModelDefinition = {
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "account" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "provider" } },
    ],
  };

  static exposed = false;
  static systemFields = false;
  static scope = ModelEnvScopes.ENV;

  @fieldDecorator(FieldTypes.RELATION, { ref: Account.slug })
  account: FieldDefinitionRelation<Account>;

  @fieldDecorator(FieldTypes.RELATION, { ref: AuthProvider.slug })
  provider: FieldDefinitionRelation<AuthProvider<T>>;

  @fieldDecorator(FieldTypes.NESTED)
  configuration: FieldDefinitionNested<AccountAuthConfiguration<T>>;
}

export default AccountAuthProvider;
