import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import JobTypes from "@/enums/job-types";
import JobStatus from "@/enums/job-status";
import { JSONType } from "@/types";

@modelDecorator()
class Job extends Model {
  static __name = "Job";
  static slug = "jobs";
  static scope = ModelEnvScopes.PROJECT;

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(JobTypes),
    strict: true,
  })
  _type: FieldDefinitionText<{
    options: Array<JobTypes>;
    strict: true;
  }>;

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(JobStatus),
    strict: true,
    default: JobStatus.QUEUED,
  })
  _status: FieldDefinitionText<{
    options: Array<JobStatus>;
    strict: true;
  }>;

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
      type: FieldTypes.TEXT,
    },
  })
  _refs: FieldDefinitionArray<{
    type: FieldTypes.TEXT;
  }>;

  @fieldDecorator(FieldTypes.DATE)
  _startedAt: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.DATE)
  _completedAt: FieldDefinitionDate;

  @fieldDecorator(FieldTypes.ARRAY, {
    items: {
      type: FieldTypes.NESTED,
    },
  })
  _alerts: FieldDefinitionArray<{
    type: FieldTypes.NESTED;
    options: JSONType;
  }>;

  @fieldDecorator(FieldTypes.NESTED)
  _result: FieldDefinitionNested<JSONType>;
}

export default Job;
