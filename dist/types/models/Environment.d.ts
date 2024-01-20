import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
import Job from "./Job";
import MergeRequest from "./MergeRequest";
declare class Environment extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static allowMultipleOperations: boolean;
    name: FieldDefinitionText;
    base: FieldDefinitionRelation<Environment>;
    _job: FieldDefinitionRelation<Job>;
    _fromRequest: FieldDefinitionRelation<MergeRequest>;
}
export default Environment;
