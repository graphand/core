import Model from "@/lib/Model";
import { modelDecorator } from "@/lib/modelDecorator";
import FieldTypes from "@/enums/field-types";
import Role from "@/models/Role";
import { ModelDefinition } from "@/types";

@modelDecorator()
class AuthProvider extends Model {
  static __name = "AuthProvider";
  static slug = "authProviders" as const;
  static isEnvironmentScoped = true;
  static definition = {
    keyField: "type",
    fields: {
      type: { type: FieldTypes.TEXT },
      options: {
        type: FieldTypes.NESTED,
        options: {
          strict: true,
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
