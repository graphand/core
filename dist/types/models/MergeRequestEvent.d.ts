import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { MergeRequestEventData, ModelDefinition } from "../types";
import Job from "./Job";
import MergeRequestEventTypes from "../enums/merge-request-event-types";
import MergeRequest from "./MergeRequest";
declare class MergeRequestEvent<T extends MergeRequestEventTypes = MergeRequestEventTypes> extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static allowMultipleOperations: boolean;
    type: T;
    data: FieldDefinitionNested<MergeRequestEventData<T>>;
    request: FieldDefinitionRelation<MergeRequest>;
    _job: FieldDefinitionRelation<Job>;
}
export default MergeRequestEvent;
