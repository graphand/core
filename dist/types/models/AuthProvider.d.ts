import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { AuthProviderRegisterOptions, AuthProviderOptions, ModelDefinition } from "../types";
import AuthProviders from "../enums/auth-providers";
import Role from "./Role";
declare class AuthProvider<T extends AuthProviders = AuthProviders> extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    type: T;
    options: FieldDefinitionNested<AuthProviderOptions<T>>;
    enabled: FieldDefinitionBoolean;
    register: FieldDefinitionNested<{
        enabled: FieldDefinitionBoolean;
        role: FieldDefinitionRelation<Role>;
        options: FieldDefinitionNested<AuthProviderRegisterOptions<T>>;
    }>;
}
export default AuthProvider;
