import {
  getFieldFromPath,
  getValueFromPath,
  setValueOnPath,
} from "../../lib/utils";
import Model from "../../lib/Model";
import FieldTypes from "../../enums/field-types";
import { FieldsDefinition } from "../../types";
import Field from "../../lib/Field";

describe("test utils", () => {
  describe("getFieldFromPath", () => {
    it("should return the field from the path", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.TEXT,
            options: {
              __label: "field1",
            },
          },
          field2: {
            type: FieldTypes.TEXT,
            options: {
              __label: "field2",
            },
          },
        } as FieldsDefinition;
      };

      const path = "field1";
      const field = getFieldFromPath(model, path);
      expect(field).toBeInstanceOf(Field);

      const label = (field.options as any).__label;
      expect(label).toBe("field1");
    });

    it("should returns the field from the path with nested fields", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.JSON,
            options: {
              __label: "field1",
              fields: {
                field2: {
                  type: FieldTypes.JSON,
                  options: {
                    __label: "field2",
                    fields: {
                      field3: {
                        type: FieldTypes.TEXT,
                        options: {
                          __label: "field3",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      const path = "field1.field2.field3";
      const field = getFieldFromPath(model, path);
      expect(field).toBeInstanceOf(Field);

      const label = (field.options as any).__label;
      expect(label).toBe("field3");
    });

    it("should returns the field from the path with nested fields", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.JSON,
            options: {
              __label: "field1",
              fields: {
                field2: {
                  type: FieldTypes.JSON,
                  options: {
                    __label: "field2",
                    fields: {
                      field3: {
                        type: FieldTypes.TEXT,
                        options: {
                          __label: "field3",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      expect(getFieldFromPath(model, "field1.field2.field3")).toHaveProperty(
        "options.__label",
        "field3"
      );

      expect(getFieldFromPath(model, "field1.field2")).toHaveProperty(
        "options.__label",
        "field2"
      );

      expect(getFieldFromPath(model, "field1")).toHaveProperty(
        "options.__label",
        "field1"
      );
    });

    it("Should return null if the field is not found", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.JSON,
            options: {
              __label: "field1",
              fields: {
                field2: {
                  type: FieldTypes.JSON,
                  options: {
                    __label: "field2",
                    fields: {
                      field3: {
                        type: FieldTypes.TEXT,
                        options: {
                          __label: "field3",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      expect(getFieldFromPath(model, "field1.field2.field4")).toBe(null);
      expect(getFieldFromPath(model, "field1.field2.")).toBe(null);
      expect(getFieldFromPath(model, "field1.field3")).toBe(null);
      expect(getFieldFromPath(model, "field1.field1")).toBe(null);
      expect(getFieldFromPath(model, "field2")).toBe(null);
    });
  });

  describe("getValueFromPath", () => {
    it("should return the value from the path", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.TEXT,
          },
          field2: {
            type: FieldTypes.TEXT,
          },
        } as FieldsDefinition;
      };

      const instance = new model({
        field1: "value1",
        field2: "value2",
      });
      expect(getValueFromPath(instance, "field1")).toEqual("value1");
      expect(getValueFromPath(instance, "field2")).toEqual("value2");
    });

    it("should return the value from the path in nested object", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.TEXT,
          },
          field2: {
            type: FieldTypes.TEXT,
          },
          field3: {
            type: FieldTypes.JSON,
            options: {
              fields: {
                field4: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      const instance = new model({
        field1: "value1",
        field2: "value2",
        field3: {
          field4: "value4",
        },
      });

      expect(getValueFromPath(instance, "field3")).toEqual({
        field4: "value4",
      });
      expect(getValueFromPath(instance, "field3").field4).toEqual("value4");
      expect(getValueFromPath(instance, "field3.field4")).toEqual("value4");
    });
  });

  describe("setValueOnPath", () => {
    it("should set the value on the path", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.TEXT,
          },
          field2: {
            type: FieldTypes.TEXT,
          },
        } as FieldsDefinition;

        field1;
        field2;

        constructor(doc) {
          super(doc);

          this.defineFieldsProperties();
        }
      };

      const instance = new model({
        field1: "value1",
        field2: "value2",
      });

      setValueOnPath(instance, "field1", "newValue1");
      setValueOnPath(instance, "field2", "newValue2");

      expect(instance.get("field1")).toEqual("newValue1");
      expect(instance.get("field2")).toEqual("newValue2");
    });

    it("should set the value on the path in nested object", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.TEXT,
          },
          field2: {
            type: FieldTypes.TEXT,
          },
          field3: {
            type: FieldTypes.JSON,
            options: {
              fields: {
                field4: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        } as FieldsDefinition;

        field1;
        field2;
        field3;

        constructor(doc) {
          super(doc);

          this.defineFieldsProperties();
        }
      };

      const instance = new model({
        field1: "value1",
        field2: "value2",
        field3: {
          field4: "value4",
        },
      });

      expect(instance.get("field3.field4")).toEqual("value4");
      setValueOnPath(instance, "field3.field4", "newValue4");
      expect(instance.get("field3.field4")).toEqual("newValue4");
    });
  });
});
