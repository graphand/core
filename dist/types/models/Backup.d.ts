import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
import Project from "./Project";
import Job from "./Job";
declare class Backup extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static controllersScope: typeof Model["controllersScope"];
    static allowMultipleOperations: boolean;
    _project: FieldDefinitionRelation<Project>;
    _expireAt: FieldDefinitionDate;
    _job: FieldDefinitionRelation<Job>;
}
export default Backup;
