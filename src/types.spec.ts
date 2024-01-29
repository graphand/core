import Model from "@/lib/Model";
import FieldTypes from "./enums/field-types";
import { JSONSubtype, ModelDefinition } from "@/types";
import PromiseModel from "./lib/PromiseModel";
import Account from "./models/Account";
import Role from "./models/Role";

class CustomModel extends Model {
  static slug = "customModel";
  static definition = {
    fields: {
      field: {
        type: FieldTypes.TEXT,
      },
    },
  } satisfies ModelDefinition;
}

declare module "./types/index" {
  export interface RefModelsMap {
    customModel: CustomModel;
  }
}

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

      const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

          simulateTypeCheck<string>(i.field?.title); // Check the field is a string
          simulateTypeCheck<JSONSubtype>(i.field?.unknown);
        });

        it("should respect options.strict", () => {
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
                    strict: true,
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.hydrate();

          simulateTypeCheck<string>(i.field?.title); // Check the field is a string
          simulateTypeCheck<NoProperty<typeof i.field, "unknown">>(i.field);
        });

        it("should respect _ts type", () => {
          class CustomModel extends Model {
            static definition = {
              fields: {
                field: {
                  type: FieldTypes.NESTED,
                  _ts: undefined as {
                    subfield: string;
                  },
                },
              },
            } satisfies ModelDefinition;
          }

          const i = CustomModel.hydrate();

          simulateTypeCheck<string>(i.field?.subfield); // Check the field is a string
          simulateTypeCheck<NoProperty<typeof i.field, "unknown">>(i.field); // Check subtitle is not found in json
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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

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

          const i = CustomModel.hydrate();

          simulateTypeCheck<string[]>(i.field); // Check the field is a string[]

          const json = i.toJSON();

          simulateTypeCheck<string[]>(json.field); // Check the field is a string[]
          simulateTypeCheck<NoProperty<typeof json, "subtitle">>(json); // Check subtitle is not found in json
        });
      });
    });
  });

  describe("generic model", () => {
    it("should validate relation field", () => {
      const i = (
        Model as typeof Model & {
          definition: {
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
          };
        }
      ).hydrate({
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
    const i = Role.hydrate();

    simulateTypeCheck<string>(i.slug); // Check the field is a string
    simulateTypeCheck<Function>(i.getRulesInherited); // Check the field is a string

    const json = i.toJSON();

    simulateTypeCheck<string>(json.slug); // Check the field is a string
  });

  it("should ...", () => {
    const model = Model.getClass<
      typeof Model & {
        definition: {
          fields: {
            field: {
              type: FieldTypes.TEXT;
            };
          };
        };
      }
    >("test");

    const i = model.hydrate();

    simulateTypeCheck<string>(i.field); // Check the field is a string
  });

  it("should ...", () => {
    const ModelFromSlug = Model.getClass("customModel");

    simulateTypeCheck<CustomModel>(ModelFromSlug);
  });

  it("should ...", () => {
    const i = (
      Model as typeof Model & {
        definition: {
          fields: {
            field1: {
              type: FieldTypes.TEXT;
            };
            field2: {
              type: FieldTypes.NUMBER;
            };
            rel: {
              type: FieldTypes.RELATION;
              options: {
                ref: "accounts";
              };
            };
          };
        };
      }
    ).hydrate();

    simulateTypeCheck<string>(i.get("field1", "json")); // Check the field is a string
    simulateTypeCheck<number>(i.get("field2", "json")); // Check the field is a string
  });
});
