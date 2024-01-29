import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import ValidatorTypes from "@/enums/validator-types";
import Account from "@/models/Account";
import AuthProvider from "@/models/AuthProvider";
import { ModelDefinition } from "@/types";

@modelDecorator()
class AccountAuthProvider extends Model {
  static __name = "AccountAuthProvider";
  static slug = "accounts_authProviders" as const;
  static definition = {
    fields: {
      account: {
        type: FieldTypes.RELATION,
        options: {
          ref: Account.slug,
        },
      },
      provider: {
        type: FieldTypes.RELATION,
        options: {
          ref: AuthProvider.slug,
        },
      },
      configuration: {
        type: FieldTypes.NESTED,
      },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "account" } },
      { type: ValidatorTypes.REQUIRED, options: { field: "provider" } },
    ],
  } satisfies ModelDefinition;

  static exposed = false;
  static systemFields = null;
  static scope = ModelEnvScopes.ENV;

  // @fieldDecorator(FieldTypes.RELATION, { ref: AuthProvider.slug })
  // provider: FieldDefinitionRelation<AuthProvider<T>>;

  // @fieldDecorator(FieldTypes.NESTED)
  // configuration: FieldDefinitionNested<AccountAuthConfiguration<T>>;
}

export default AccountAuthProvider;
