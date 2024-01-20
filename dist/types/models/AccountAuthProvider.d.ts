import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { AccountAuthConfiguration, ModelDefinition } from "../types";
import Account from "./Account";
import AuthProvider from "./AuthProvider";
import AuthProviders from "../enums/auth-providers";
declare class AccountAuthProvider<T extends AuthProviders = AuthProviders> extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static exposed: boolean;
    static systemFields: boolean;
    static scope: ModelEnvScopes;
    account: FieldDefinitionRelation<Account>;
    provider: FieldDefinitionRelation<AuthProvider<T>>;
    configuration: FieldDefinitionNested<AccountAuthConfiguration<T>>;
}
export default AccountAuthProvider;
