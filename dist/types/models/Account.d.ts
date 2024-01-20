import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import Role from "./Role";
import User from "./User";
import { ModelDefinition } from "../types";
declare class Account extends Model {
    static __name: string;
    static searchable: boolean;
    static extensible: boolean;
    static scope: ModelEnvScopes;
    static slug: string;
    static definition: ModelDefinition;
    firstname: FieldDefinitionText;
    lastname: FieldDefinitionText;
    email: FieldDefinitionText;
    role: FieldDefinitionRelation<Role>;
    _user: FieldDefinitionRelation<User>;
    _lastLoginAt: FieldDefinitionDate;
}
export default Account;
