import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { MergeRequestOptions, ModelDefinition } from "../types";
import Job from "./Job";
import MergeRequestTypes from "../enums/merge-request-types";
declare class MergeRequest<T extends MergeRequestTypes = MergeRequestTypes> extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static allowMultipleOperations: boolean;
    slug: FieldDefinitionText;
    type: T;
    options: FieldDefinitionNested<MergeRequestOptions<T>>;
    target: FieldDefinitionText;
    _closed: FieldDefinitionBoolean;
    _job: FieldDefinitionRelation<Job>;
}
export default MergeRequest;
