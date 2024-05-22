import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Role from "@/models/Role";
import { ModelDefinition } from "@/types";
import ValidatorTypes from "@/enums/validator-types";

@modelDecorator()
class AuthProvider extends Model {
  static __name = "AuthProvider";
  static slug = "authProviders" as const;
  static isEnvironmentScoped = true;
  static definition = {
    keyField: "type",
    fields: {
      type: {
        type: FieldTypes.TEXT,
        options: {
          enum: ["local", "facebook", "google", "github", "apple", "graphand"],
          strict: true,
        },
      },
      options: {
        type: FieldTypes.NESTED,
        options: {
          strict: true,
          dependsOn: "type",
          default: {},
          fields: {
            local: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  confirmEmail: { type: FieldTypes.BOOLEAN, options: { default: false } },
                  confirmTokenLifetime: { type: FieldTypes.NUMBER, options: { default: 3600 } },
                  resetTokenLifetime: { type: FieldTypes.NUMBER, options: { default: 3600 } },
                },
              },
            },
            facebook: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  clientId: { type: FieldTypes.TEXT },
                  clientSecret: { type: FieldTypes.TEXT },
                  fieldsMap: {
                    type: FieldTypes.NESTED,
                    options: { defaultField: { type: FieldTypes.TEXT } },
                  },
                },
                validators: [
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientId" } },
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientSecret" } },
                ],
              },
            },
            graphand: {
              type: FieldTypes.NESTED,
              options: {
                default: {},
                fields: {
                  autoRegister: { type: FieldTypes.BOOLEAN, options: { default: true } },
                },
              },
            },
            google: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  clientId: { type: FieldTypes.TEXT },
                  clientSecret: { type: FieldTypes.TEXT },
                  fieldsMap: {
                    type: FieldTypes.NESTED,
                    options: { defaultField: { type: FieldTypes.TEXT } },
                  },
                },
                validators: [
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientId" } },
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientSecret" } },
                ],
              },
            },
            github: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  clientId: { type: FieldTypes.TEXT },
                  clientSecret: { type: FieldTypes.TEXT },
                  fieldsMap: {
                    type: FieldTypes.NESTED,
                    options: { defaultField: { type: FieldTypes.TEXT } },
                  },
                },
                validators: [
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientId" } },
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientSecret" } },
                ],
              },
            },
            apple: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  clientId: { type: FieldTypes.TEXT },
                  teamId: { type: FieldTypes.TEXT },
                  keyId: { type: FieldTypes.TEXT },
                  privateKey: { type: FieldTypes.TEXT },
                  fieldsMap: {
                    type: FieldTypes.NESTED,
                    options: { defaultField: { type: FieldTypes.TEXT } },
                  },
                },
                validators: [
                  { type: ValidatorTypes.REQUIRED, options: { field: "clientId" } },
                  { type: ValidatorTypes.REQUIRED, options: { field: "teamId" } },
                  { type: ValidatorTypes.REQUIRED, options: { field: "keyId" } },
                  { type: ValidatorTypes.REQUIRED, options: { field: "privateKey" } },
                ],
              },
            },
          },
        },
      },
      enabled: { type: FieldTypes.BOOLEAN, options: { default: true } },
      register: {
        type: FieldTypes.NESTED,
        options: {
          fields: {
            enabled: { type: FieldTypes.BOOLEAN, options: { default: true } },
            role: {
              type: FieldTypes.RELATION,
              options: {
                ref: Role.slug,
              },
            },
            authorizedFields: {
              type: FieldTypes.ARRAY,
              options: { items: { type: FieldTypes.TEXT } },
            },
          },
        },
      },
    },
  } satisfies ModelDefinition;
}

export default AuthProvider;
