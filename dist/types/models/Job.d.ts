import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import FieldTypes from "../enums/field-types";
import JobTypes from "../enums/job-types";
import JobStatus from "../enums/job-status";
declare class Job extends Model {
    static __name: string;
    static slug: string;
    static scope: ModelEnvScopes;
    _type: FieldDefinitionText<{
        options: Array<JobTypes>;
        strict: true;
    }>;
    _status: FieldDefinitionText<{
        options: Array<JobStatus>;
        strict: true;
    }>;
    _refs: Array<string>;
    _startedAt: FieldDefinitionDate;
    _completedAt: FieldDefinitionDate;
    _alerts: FieldDefinitionArray<{
        type: FieldTypes.NESTED;
        definition: any;
    }>;
    _result: Record<string, any>;
}
export default Job;
