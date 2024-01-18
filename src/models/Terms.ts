import Model from "@/lib/Model";
import ModelEnvScopes from "@/enums/model-env-scopes";
import { fieldDecorator } from "@/lib/fieldDecorator";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";

@modelDecorator()
class Terms extends Model {
  static __name = "Terms";
  static slug = "terms";

  static scope = ModelEnvScopes.GLOBAL;

  @fieldDecorator(FieldTypes.TEXT)
  introduction: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  service: FieldDefinitionText; // Terms of Service and Acceptable Use Policy

  @fieldDecorator(FieldTypes.TEXT)
  privacy: FieldDefinitionText; // Privacy and Data Protection (Privacy Notice, Cookie Notice, Data Processing Addendum for Customers, Privacy FAQ, etc)

  @fieldDecorator(FieldTypes.TEXT)
  security: FieldDefinitionText; // Security and Compliance

  @fieldDecorator(FieldTypes.TEXT)
  payment: FieldDefinitionText; // Payment, Subscriptions, and Service Level Agreement (terms for payment and subscriptions with the service level agreement)

  @fieldDecorator(FieldTypes.TEXT)
  legal: FieldDefinitionText; // Legal and Additional Policies
}

export default Terms;
