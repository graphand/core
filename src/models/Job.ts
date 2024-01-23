import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import JobTypes from "@/enums/job-types";
import JobStatus from "@/enums/job-status";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Job extends Model {
  static __name = "Job";
  static slug = "jobs" as const;
  static scope = ModelEnvScopes.PROJECT;
  static definition = {
    fields: {
      _type: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(JobTypes),
          strict: true,
        },
      },
      _status: {
        type: FieldTypes.TEXT,
        options: {
          options: Object.values(JobStatus),
          strict: true,
          default: JobStatus.QUEUED,
        },
      },
      _refs: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.TEXT,
          },
        },
      },
      _startedAt: {
        type: FieldTypes.DATE,
      },
      _completedAt: {
        type: FieldTypes.DATE,
      },
      _alerts: {
        type: FieldTypes.ARRAY,
        options: {
          items: {
            type: FieldTypes.NESTED,
          },
        },
      },
      _result: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            type: {
              type: FieldTypes.TEXT,
              options: {
                options: Object.values(FieldTypes),
                strict: true,
              },
            },
            options: {
              type: FieldTypes.NESTED,
            },
          },
        },
      },
    },
  } satisfies ModelDefinition;

  // @fieldDecorator(FieldTypes.TEXT, {
  //   options: Object.values(JobTypes),
  //   strict: true,
  // })
  // _type: FieldDefinitionText<{
  //   options: Array<JobTypes>;
  //   strict: true;
  // }>;

  // @fieldDecorator(FieldTypes.TEXT, {
  //   options: Object.values(JobStatus),
  //   strict: true,
  //   default: JobStatus.QUEUED,
  // })
  // _status: FieldDefinitionText<{
  //   options: Array<JobStatus>;
  //   strict: true;
  // }>;

  // @fieldDecorator(FieldTypes.ARRAY, {
  //   items: {
  //     type: FieldTypes.TEXT,
  //   },
  // })
  // _refs: FieldDefinitionArray<{
  //   type: FieldTypes.TEXT;
  // }>;

  // @fieldDecorator(FieldTypes.DATE)
  // _startedAt: FieldDefinitionDate;

  // @fieldDecorator(FieldTypes.DATE)
  // _completedAt: FieldDefinitionDate;

  // @fieldDecorator(FieldTypes.ARRAY, {
  //   items: {
  //     type: FieldTypes.NESTED,
  //   },
  // })
  // _alerts: FieldDefinitionArray<{
  //   type: FieldTypes.NESTED;
  //   options: JSONType;
  // }>;

  // @fieldDecorator(FieldTypes.NESTED)
  // _result: FieldDefinitionNested<JSONType>;
}

export default Job;
