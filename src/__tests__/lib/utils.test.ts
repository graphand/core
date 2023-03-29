import { getFieldsPathsFromPath } from "../../lib/utils";
import Model from "../../lib/Model";
import FieldTypes from "../../enums/field-types";
import { FieldsDefinition } from "../../types";

describe("test utils", () => {
  describe("getFieldsPathsFromPath", () => {
    it("should returns single array entry for one field", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              __label: "field1",
              items: {
                type: FieldTypes.TEXT,
              },
            },
          },
        } as FieldsDefinition;
      };

      const fPath = getFieldsPathsFromPath(model, "field1");

      expect(fPath).toBeInstanceOf(Array);
      expect(fPath.length).toEqual(1);
      expect(fPath[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath[0].field).toHaveProperty("options.__label", "field1");
    });

    it("should decode nested array fields", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              __label: "field1",
              items: {
                type: FieldTypes.ARRAY,
                options: {
                  __label: "field1bis",
                  items: {
                    type: FieldTypes.JSON,
                    options: {
                      fields: {
                        field2: {
                          type: FieldTypes.TEXT,
                          options: {
                            __label: "field2",
                          },
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

      const fPath1 = getFieldsPathsFromPath(model, "field1.field2");

      expect(fPath1.length).toBe(3);
      expect(fPath1[0].key).toBe("field1");
      expect(fPath1[1].key).toBe("[]");
      expect(fPath1[2]).toBe(null);

      const fPath2 = getFieldsPathsFromPath(model, "field1.[].field2");

      expect(fPath2.length).toBe(4);
      expect(fPath2[0].key).toBe("field1");
      expect(fPath2[1].key).toBe("[]");
      expect(fPath2[2].key).toBe("[]");
      expect(fPath2[3].key).toBe("field2");

      const fPath3 = getFieldsPathsFromPath(model, "field1.[].[].field2");

      expect(fPath3.length).toBe(4);
      expect(fPath3[0].key).toBe("field1");
      expect(fPath3[1].key).toBe("[]");
      expect(fPath3[2].key).toBe("[]");
      expect(fPath3[3].key).toBe("field2");

      const fPath4 = getFieldsPathsFromPath(model, "field1.[]");

      expect(fPath4.length).toBe(2);
      expect(fPath4[0].key).toBe("field1");
      expect(fPath4[1].key).toBe("[]");
    });

    it("should decode array items field", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              __label: "field1",
              items: {
                type: FieldTypes.TEXT,
                options: {
                  __label: "field1bis",
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      const fPath = getFieldsPathsFromPath(model, "field1.[]");

      expect(fPath).toBeInstanceOf(Array);
      expect(fPath.length).toEqual(2);
      expect(fPath[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath[1].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath[1].field).toHaveProperty("options.__label", "field1bis");
    });

    it("should decode json fields field", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.JSON,
            options: {
              __label: "field1",
              fields: {
                field2: {
                  type: FieldTypes.TEXT,
                  options: {
                    __label: "field2",
                  },
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      const fPath = getFieldsPathsFromPath(model, "field1.field2");

      expect(fPath).toBeInstanceOf(Array);
      expect(fPath.length).toEqual(2);
      expect(fPath[0].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath[1].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath[1].field).toHaveProperty("options.__label", "field2");
    });

    it("should decode json in array items field", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              __label: "field1",
              items: {
                type: FieldTypes.JSON,
                options: {
                  __label: "field1bis",
                  fields: {
                    field2: {
                      type: FieldTypes.TEXT,
                      options: {
                        __label: "field2",
                      },
                    },
                  },
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      const fPath = getFieldsPathsFromPath(model, "field1.field2");

      expect(fPath).toBeInstanceOf(Array);
      expect(fPath.length).toEqual(3);
      expect(fPath[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath[2].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath[2].field).toHaveProperty("options.__label", "field2");

      const fPath2 = getFieldsPathsFromPath(model, "field1.[].field2");

      expect(fPath2).toBeInstanceOf(Array);
      expect(fPath2.length).toEqual(3);
      expect(fPath2[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath2[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath2[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath2[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath2[2].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath2[2].field).toHaveProperty("options.__label", "field2");
    });

    it("should return null field for invalid path", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              __label: "field1",
              items: {
                type: FieldTypes.JSON,
                options: {
                  __label: "field1bis",
                  fields: {
                    field2: {
                      type: FieldTypes.TEXT,
                      options: {
                        __label: "field2",
                      },
                    },
                  },
                },
              },
            },
          },
        } as FieldsDefinition;
      };

      const fPath = getFieldsPathsFromPath(model, "field1.field2.field3");

      expect(fPath).toBeInstanceOf(Array);
      expect(fPath.length).toEqual(4);
      expect(fPath[3]).toBe(null);

      const fPath2 = getFieldsPathsFromPath(model, "field1.[].field3");

      expect(fPath2).toBeInstanceOf(Array);
      expect(fPath2.length).toEqual(3);
      expect(fPath2[2]).toBe(null);

      const fPath3 = getFieldsPathsFromPath(model, "field2");

      expect(fPath3).toBeInstanceOf(Array);
      expect(fPath3.length).toEqual(1);
      expect(fPath3[0]).toBe(null);

      const fPath4 = getFieldsPathsFromPath(model, "field2.field1");

      expect(fPath4).toBeInstanceOf(Array);
      expect(fPath4.length).toEqual(2);
      expect(fPath4[0]).toBe(null);
      expect(fPath4[1]).toBe(null);
    });

    it("should decode complex schema fields", () => {
      const model = class extends Model {
        static fields = {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              __label: "field1",
              items: {
                type: FieldTypes.JSON,
                options: {
                  __label: "field1bis",
                  fields: {
                    field2: {
                      type: FieldTypes.TEXT,
                      options: {
                        __label: "field2",
                      },
                    },
                    field3: {
                      type: FieldTypes.ARRAY,
                      options: {
                        __label: "field3",
                        items: {
                          type: FieldTypes.JSON,
                          options: {
                            __label: "field3bis",
                            fields: {
                              field4: {
                                type: FieldTypes.TEXT,
                                options: {
                                  __label: "field4",
                                },
                              },
                            },
                          },
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

      const fPath = getFieldsPathsFromPath(model, "field1");

      expect(fPath).toBeInstanceOf(Array);
      expect(fPath.length).toEqual(1);
      expect(fPath[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath[0].field).toHaveProperty("options.__label", "field1");

      const fPath2 = getFieldsPathsFromPath(model, "field1.field2");

      expect(fPath2).toBeInstanceOf(Array);
      expect(fPath2.length).toEqual(3);
      expect(fPath2[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath2[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath2[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath2[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath2[2].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath2[2].field).toHaveProperty("options.__label", "field2");

      const fPath3 = getFieldsPathsFromPath(model, "field1.field3");

      expect(fPath3).toBeInstanceOf(Array);
      expect(fPath3.length).toEqual(3);
      expect(fPath3[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath3[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath3[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath3[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath3[2].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath3[2].field).toHaveProperty("options.__label", "field3");

      const fPath4 = getFieldsPathsFromPath(model, "field1.field3.field4");

      expect(fPath4).toBeInstanceOf(Array);
      expect(fPath4.length).toEqual(5);
      expect(fPath4[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath4[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath4[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath4[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath4[2].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath4[2].field).toHaveProperty("options.__label", "field3");
      expect(fPath4[3].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath4[3].field).toHaveProperty("options.__label", "field3bis");
      expect(fPath4[4].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath4[4].field).toHaveProperty("options.__label", "field4");

      const fPath5 = getFieldsPathsFromPath(model, "field1.[].field2");

      expect(fPath5).toBeInstanceOf(Array);
      expect(fPath5.length).toEqual(3);
      expect(fPath5[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath5[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath5[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath5[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath5[2].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath5[2].field).toHaveProperty("options.__label", "field2");

      const fPath6 = getFieldsPathsFromPath(model, "field1.[].field3");

      expect(fPath6).toBeInstanceOf(Array);
      expect(fPath6.length).toEqual(3);
      expect(fPath6[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath6[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath6[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath6[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath6[2].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath6[2].field).toHaveProperty("options.__label", "field3");

      const fPath7 = getFieldsPathsFromPath(
        model,
        "field1.[].field3.[].field4"
      );

      expect(fPath7).toBeInstanceOf(Array);
      expect(fPath7.length).toEqual(5);
      expect(fPath7[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath7[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath7[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath7[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath7[2].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath7[2].field).toHaveProperty("options.__label", "field3");
      expect(fPath7[3].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath7[3].field).toHaveProperty("options.__label", "field3bis");
      expect(fPath7[4].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath7[4].field).toHaveProperty("options.__label", "field4");

      const fPath8 = getFieldsPathsFromPath(
        model,
        "field1.[].field3.[].field4.field5"
      );

      expect(fPath8).toBeInstanceOf(Array);
      expect(fPath8.length).toEqual(6);
      expect(fPath8[0].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath8[0].field).toHaveProperty("options.__label", "field1");
      expect(fPath8[1].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath8[1].field).toHaveProperty("options.__label", "field1bis");
      expect(fPath8[2].field).toHaveProperty("type", FieldTypes.ARRAY);
      expect(fPath8[2].field).toHaveProperty("options.__label", "field3");
      expect(fPath8[3].field).toHaveProperty("type", FieldTypes.JSON);
      expect(fPath8[3].field).toHaveProperty("options.__label", "field3bis");
      expect(fPath8[4].field).toHaveProperty("type", FieldTypes.TEXT);
      expect(fPath8[4].field).toHaveProperty("options.__label", "field4");
      expect(fPath8[5]).toBe(null);
    });
  });
});
