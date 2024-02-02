import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import { ModelDefinition } from "@/types";

@modelDecorator()
class Terms extends Model {
  static __name = "Terms";
  static scope = ModelEnvScopes.GLOBAL;
  static slug = "terms" as const;
  static definition = {
    fields: {
      introduction: { type: FieldTypes.TEXT },
      service: { type: FieldTypes.TEXT }, // Terms of Service and Acceptable Use Policy
      privacy: { type: FieldTypes.TEXT }, // Privacy and Data Protection (Privacy Notice, Cookie Notice, Data Processing Addendum for Customers, Privacy FAQ, etc)
      security: { type: FieldTypes.TEXT }, // Security and Compliance
      payment: { type: FieldTypes.TEXT }, // Payment, Subscriptions, and Service Level Agreement (terms for payment and subscriptions with the service level agreement)
      legal: { type: FieldTypes.TEXT }, // Legal and Additional Policies
    },
  } satisfies ModelDefinition;
}

export default Terms;
