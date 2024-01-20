import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import FieldTypes from "../enums/field-types";
import { FieldsRestriction, ModelDefinition, Rule } from "../types";
declare class Role extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    slug: FieldDefinitionText;
    _admin: FieldDefinitionBoolean;
    inherits: FieldDefinitionArray<{
        type: FieldTypes.RELATION;
        definition: Role;
    }>;
    systemNotifications: FieldDefinitionBoolean;
    rules: FieldDefinitionArray<{
        type: FieldTypes.NESTED;
        definition: Rule;
    }>;
    fieldsRestrictions: FieldDefinitionArray<{
        type: FieldTypes.NESTED;
        definition: FieldsRestriction;
    }>;
    getRulesInherited(): Promise<Array<Rule>>;
    getFieldsRestrictionsInherited(): Promise<Array<FieldsRestriction>>;
}
export default Role;
