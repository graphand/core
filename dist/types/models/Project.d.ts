import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import Organization from "./Organization";
import { ModelDefinition } from "../types";
declare class Project extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static allowMultipleOperations: boolean;
    name: FieldDefinitionText;
    slug: FieldDefinitionText;
    organization: FieldDefinitionRelation<Organization>;
    accessTokenLifetime: FieldDefinitionNumber;
    refreshTokenLifetime: FieldDefinitionNumber;
    backupSchedule: FieldDefinitionNested<{
        enabled: FieldDefinitionBoolean;
        cronExpression: FieldDefinitionText;
    }>;
    version: FieldDefinitionText;
}
export default Project;
