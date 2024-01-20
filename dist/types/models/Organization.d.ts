import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import FieldTypes from "../enums/field-types";
import { ModelDefinition } from "../types";
import User from "./User";
import Terms from "./Terms";
declare class Organization extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static allowMultipleOperations: boolean;
    name: FieldDefinitionText;
    slug: FieldDefinitionText;
    owner: FieldDefinitionRelation<User>;
    _users: FieldDefinitionArray<{
        type: FieldTypes.RELATION;
        options: {
            model: User;
        };
    }>;
    _consent: FieldDefinitionNested<{
        terms: FieldDefinitionRelation<Terms>;
        user: FieldDefinitionRelation<User>;
    }>;
}
export default Organization;
