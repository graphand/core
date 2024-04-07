import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import JobTypes from "@/enums/job-types";
import JobStatus from "@/enums/job-status";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Job extends Model {
  static __name = "Job";
  static slug = "jobs" as const;
  static definition = {
    fields: {
      _type: {
        type: FieldTypes.TEXT,
        options: {
          enum: Object.values(JobTypes),
          strict: true,
        },
      },
      _status: {
        type: FieldTypes.TEXT,
        options: {
          enum: Object.values(JobStatus),
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
            options: {
              fields: {
                message: {
                  type: FieldTypes.TEXT,
                },
                log: {
                  type: FieldTypes.NESTED,
                },
              },
            },
          },
        },
      },
      _result: {
        type: FieldTypes.NESTED,
      },
    },
  } satisfies ModelDefinition;
}

export default Job;
