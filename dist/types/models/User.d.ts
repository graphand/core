import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
declare class User extends Model {
    static __name: string;
    static definition: ModelDefinition;
    static slug: string;
    static scope: ModelEnvScopes;
    firstname: FieldDefinitionText;
    lastname: FieldDefinitionText;
    email: FieldDefinitionText;
    password: FieldDefinitionText;
    pendingEmail: FieldDefinitionText;
}
export default User;
