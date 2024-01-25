import Model from "@/lib/Model";
import FieldTypes from "./enums/field-types";
import { ModelDefinition } from "@/types";
import PromiseModel from "./lib/PromiseModel";
import Account from "./models/Account";
import Role from "./models/Role";

describe("test types", () => {
  const simulateTypeCheck = <ExpectedType>(obj: ExpectedType) => obj;

  type NoType<T, ExpectedType> = T extends ExpectedType ? never : T;
  type NoProperty<T, Prop extends PropertyKey> = {
    [K in keyof T]: K extends Prop ? never : T[K];
  };

  describe("fields type check", () => {
    it("utils should work", () => {
      class CustomModel extends Model {
        static definition = {
          fields: {
            title: {
              type: FieldTypes.TEXT,
            },
          },
        } satisfies ModelDefinition;
      }

      const i = CustomModel.fromDoc();

      simulateTypeCheck<string>(i.title); // Check title found as a string
      simulateTypeCheck<string>(i._id); // Check _id found as a string
      simulateTypeCheck<NoType<typeof i.title, number>>(i.title); // Check title is not a number
      simulateTypeCheck<NoProperty<typeof i, "subtitle">>(i); // Check subtitle is not found in i
    });

    describe("test object", () => {
      describe("text field", () => {
        it("should validate text field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.TEXT,
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<string>(i.field); // Check the field is a string
        });

        it("should validate text field with options and strict", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.TEXT,
                  options: {
                    options: ["a", "b", "c"] as const,
                    strict: true,
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<"a" | "b" | "c">(i.field); // Check the field is a literal enum
        });

        it("should validate text field with options and not strict", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.TEXT,
                  options: {
                    options: ["a", "b", "c"] as const,
                    strict: false,
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<string>(i.field); // Check the field is a string
        });
      });

      describe("nested field", () => {
        it("should validate nested field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      title: {
                        type: FieldTypes.TEXT,
                      },
                    },
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<string>(i.field?.title); // Check the field is a string
        });
      });

      describe("relation field", () => {
        it("should validate relation field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.RELATION,
                  options: {
                    ref: "accounts" as const,
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<PromiseModel<typeof Account>>(i.field); // Check the field is a PromiseModel
        });
      });

      describe("date field", () => {
        it("should validate date field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.DATE,
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<Date>(i.field); // Check the field is a Date
        });
      });
    });

    describe("test document", () => {
      describe("relation field", () => {
        class CustomModel extends Model {
          static definition = {
            fields: {
              title: {
                type: FieldTypes.TEXT,
              },
              field: {
                type: FieldTypes.RELATION,
                options: {
                  ref: "accounts" as const,
                },
              },
            },
          } satisfies ModelDefinition;
        }

        CustomModel.fromDoc({
          title: "ok",
          field: "blabla",
        });
      });

      describe("array field", () => {
        it("should validate array of relation", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.ARRAY,
                  options: {
                    items: { type: FieldTypes.TEXT },
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc({
            field: ["id1"],
          });

          simulateTypeCheck<string[]>(i.field); // Check the field is a string[]
        });
      });

      describe("date field", () => {
        it("should validate date field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.DATE,
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc({
            field: new Date(),
          });

          simulateTypeCheck<Date>(i.field); // Check the field is a Date
        });
      });
    });

    describe("test json", () => {
      describe("date field", () => {
        it("should validate date field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.DATE,
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<Date>(i.field); // Check the field is a string

          const json = i.toJSON();

          simulateTypeCheck<string>(json.field); // Check the field is a string
          simulateTypeCheck<NoProperty<typeof json, "subtitle">>(json); // Check subtitle is not found in json
        });
      });

      describe("relation field", () => {
        it("should validate relation field", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.RELATION,
                  options: {
                    ref: "accounts" as const,
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<PromiseModel<typeof Account>>(i.field);

          const json = i.toJSON();

          simulateTypeCheck<string>(json.field);
        });
      });

      describe("array field", () => {
        it("should validate array of relation", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.ARRAY,
                  options: {
                    items: { type: FieldTypes.TEXT },
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.fromDoc();

          simulateTypeCheck<string[]>(i.field); // Check the field is a string[]

          const json = i.toJSON();

          simulateTypeCheck<string[]>(json.field); // Check the field is a string[]
          simulateTypeCheck<NoProperty<typeof json, "subtitle">>(json); // Check subtitle is not found in json
        });
      });
    });
  });

  describe("inline model", () => {
    it("should validate relation field", () => {
      const i = Model.fromDoc<{
        fields: {
          title: {
            type: FieldTypes.TEXT;
          };
          field: {
            type: FieldTypes.RELATION;
            options: {
              ref: "accounts";
            };
          };
        };
      }>({
        title: "ok",
        field: "blabla",
      });

      simulateTypeCheck<string>(i.title); // Check the field is a PromiseModel
      simulateTypeCheck<PromiseModel<typeof Account>>(i.field); // Check the field is a PromiseModel

      const json = i.toJSON();

      simulateTypeCheck<string>(json.field); // Check the field is a string
      simulateTypeCheck<NoProperty<typeof json, "subtitle">>(json); // Check subtitle is not found in json
    });
  });

  it("should ...", () => {
    const i = Role.fromDoc();

    simulateTypeCheck<string>(i.slug); // Check the field is a string
    simulateTypeCheck<Function>(i.getRulesInherited); // Check the field is a string

    const json = i.toJSON();

    simulateTypeCheck<string>(json.slug); // Check the field is a string
  });

  it("should ...", () => {
    const model = Model.getClass<typeof Model>("test");

    const i = model.fromDoc<{
      fields: {
        field: {
          type: FieldTypes.TEXT;
        };
      };
    }>();

    simulateTypeCheck<string>(i.field); // Check the field is a string
  });
});
