import { mockAdapter, mockModel } from "../test-utils";
import FieldTypes from "../enums/field-types";
import { faker } from "@faker-js/faker";
import Field from "./Field";
import Validator from "./Validator";
import ValidatorTypes from "../enums/validator-types";
import ValidationError from "./ValidationError";

describe("test fieldsMap", () => {
  const adapter = mockAdapter({
    modelDefinition: { fields: {}, validators: [] },
  });

  describe("TEXT field", () => {
    it("Should returns default value if undefined", async () => {
      const defaultText = faker.lorem.word();

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              default: defaultText,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({});
      expect(i.title).toEqual(defaultText);
    });

    it("Should returns string value by default", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = faker.lorem.word();

      const i = new model({ title });
      expect(i.title).toEqual(title);
    });

    it("Should returns string from array by default", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const titleArray = [faker.lorem.word(), faker.lorem.word()];

      const i = new model({ title: titleArray });
      expect(typeof i.title).toBe("string");
    });

    describe("options.multiple", () => {
      it("Should returns array of string when multiple", async () => {
        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                multiple: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = [faker.lorem.word(), faker.lorem.word()];

        const i = new model({ title });
        expect(i.title).toBeInstanceOf(Array);
        expect(i.title.length).toEqual(2);
        expect(i.title.every((t) => typeof t === "string")).toBeTruthy();
      });

      it("Should returns array from string when multiple", async () => {
        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                multiple: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = faker.lorem.word();

        const i = new model({ title });
        expect(i.title).toBeInstanceOf(Array);
        expect(i.title.length).toEqual(1);
        expect(i.title.every((t) => typeof t === "string")).toBeTruthy();
      });
    });

    describe("options.options", () => {
      it("Should returns values within options when not creatable and multiple", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                multiple: true,
                options,
                creatable: false,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = ["notInOptions", "notInOptions2"];

        const i = new model({ title });
        expect(i.title).toBeInstanceOf(Array);
        expect(i.title.length).toEqual(0);
      });

      it("Should returns all values when creatable and multiple", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                multiple: true,
                options,
                creatable: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = ["notInOptions", "notInOptions2"];

        const i = new model({ title });
        expect(i.title).toBeInstanceOf(Array);
        expect(i.title.length).toEqual(2);
      });

      it("Should returns values within options when not creatable and not multiple", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                creatable: false,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = "notInOptions";

        const i = new model({ title });
        expect(i.title).toBe(undefined);
      });

      it("Should returns all values when creatable and not multiple", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                creatable: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = "notInOptions";

        const i = new model({ title });
        expect(i.title).toBe(title);
      });

      it("Should throw error if value is not in options and no creatable", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                creatable: false,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = "notInOptions";

        const i = new model({ title });

        expect.assertions(2);

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeInstanceOf(ValidationError);
          expect(e.fieldsPaths.includes("title")).toBeTruthy();
        }
      });

      it("Should throw error if one of array value is not in options and no creatable", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                multiple: true,
                options,
                creatable: false,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = [options[0], "notInOptions"];

        const i = new model({ title });

        expect.assertions(2);

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeInstanceOf(ValidationError);
          expect(e.fieldsPaths.includes("title")).toBeTruthy();
        }
      });

      it("Should not throw error if every array value is in options and no creatable", async () => {
        const options = [
          faker.lorem.word(),
          faker.lorem.word(),
          faker.lorem.word(),
        ];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                multiple: true,
                options,
                creatable: false,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = [options[0], options[1]];

        const i = new model({ title });
        const validated = await model.validate([i]);

        expect(validated).toBeTruthy();
      });
    });
  });

  describe("JSON field", () => {
    it("Should returns default value if undefined", async () => {
      const defaultJSON = { default: true };

      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.JSON,
            options: {
              default: defaultJSON,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({});
      expect(i.obj).toEqual(defaultJSON);
    });

    it("Should returns object value by default", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.JSON,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const obj = { title: faker.lorem.word() };

      const i = new model({ obj });
      expect(i.obj).toBeInstanceOf(Object);
    });

    it("Should returns object from array by default", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.JSON,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const obj = [
        { title: faker.lorem.word() },
        { title: faker.lorem.word() },
      ];

      const i = new model({ obj });
      expect(i.obj).toBeInstanceOf(Object);
    });

    describe("options.multiple", () => {
      it("Should returns array of objects when multiple", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                multiple: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const obj = [
          { title: faker.lorem.word() },
          { title: faker.lorem.word() },
        ];

        const i = new model({ obj });
        expect(i.obj).toBeInstanceOf(Array);
      });

      it("Should returns array from object when multiple", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                multiple: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const obj = { title: faker.lorem.word() };

        const i = new model({ obj });
        expect(i.obj).toBeInstanceOf(Array);
      });
    });

    describe("options.strict", () => {
      it("Should returns only defined fields in options when strict", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                strict: true,
                fields: {
                  title: {
                    type: FieldTypes.TEXT,
                  },
                },
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const obj = {
          title: faker.lorem.word(),
          fieldNotDefined: faker.lorem.word(),
        };

        const i = new model({ obj });
        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(obj.title);
        expect(i.obj.fieldNotDefined).toBe(undefined);
      });
    });

    describe("options.fields", () => {
      it("Should serialize from fields defined in options", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);

        class TestFieldText extends Field<FieldTypes.TEXT> {
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                fields: {
                  title: {
                    type: FieldTypes.TEXT,
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {
          title: faker.lorem.word(),
        };

        const i = new model({ obj });
        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(serializedText);
      });

      it("Should validate fields defined in options", async () => {
        const testValidator = jest.fn(() => Promise.resolve(true));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                fields: {
                  title: {
                    type: FieldTypes.TEXT,
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = { title: faker.lorem.word() };

        const i = new model({ obj });

        expect(testValidator).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidator).toBeCalledTimes(1);
      });

      it("Should support nested JSON fields", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);
        const testValidator = jest.fn(() => Promise.resolve(true));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                fields: {
                  nested: {
                    type: FieldTypes.JSON,
                    options: {
                      fields: {
                        title: {
                          type: FieldTypes.TEXT,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {
          nested: {
            title: faker.lorem.word(),
          },
        };

        const i = new model({ obj });
        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.nested).toBeInstanceOf(Object);
        expect(i.obj.nested.title).toEqual(serializedText);

        expect(testValidator).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidator).toBeCalledTimes(1);
      });

      it("Should throw error if error happens in field validation", async () => {
        const testValidator = jest.fn(() => Promise.resolve(false));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                fields: {
                  nested: {
                    type: FieldTypes.JSON,
                    options: {
                      fields: {
                        title: {
                          type: FieldTypes.TEXT,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {
          nested: {
            title: faker.lorem.word(),
          },
        };

        const i = new model({ obj });

        expect.assertions(7);

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeInstanceOf(ValidationError);
          expect(e.fieldsPaths.includes("obj")).toBeTruthy();
          expect(e.fieldsPaths.includes("obj.nested")).toBeTruthy();
          expect(e.fieldsPaths.includes("obj.nested.title")).toBeTruthy();

          const objError = e.fields.find(
            (e) => e.slug === "obj"
          )?.validationError;

          expect(objError?.fieldsPaths.includes("nested")).toBeTruthy();
          expect(objError?.fieldsPaths.includes("nested.title")).toBeTruthy();

          const objNestedError = objError.fields.find(
            (e) => e.slug === "nested"
          )?.validationError;

          expect(objNestedError?.fieldsPaths.includes("title")).toBeTruthy();
        }
      });
    });

    describe("options.validators", () => {
      it("Should validate validators defined in options", async () => {
        const testValidate = jest.fn(() => Promise.resolve(true));

        class TestValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
          validate = testValidate;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: TestValidatorRequired,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                validators: [
                  {
                    type: ValidatorTypes.REQUIRED,
                    options: { field: "title" },
                  },
                ],
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {};

        const i = new model({ obj });

        expect(testValidate).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidate).toBeCalledTimes(1);
      });

      it("Should throw error if error happens in validator", async () => {
        const testValidate = jest.fn(() => Promise.resolve(false));

        class TestValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
          validate = testValidate;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: TestValidatorRequired,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                validators: [
                  {
                    type: ValidatorTypes.REQUIRED,
                    options: { field: "title" },
                  },
                ],
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {};
        const i = new model({ obj });

        expect.assertions(1);

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeDefined();
        }
      });

      it("Should support nested JSON fields and should not validate if nested value undefined", async () => {
        const testValidate = jest.fn(() => Promise.resolve(true));

        class TestValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
          validate = testValidate;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: TestValidatorRequired,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                fields: {
                  nested: {
                    type: FieldTypes.JSON,
                    options: {
                      validators: [
                        {
                          type: ValidatorTypes.REQUIRED,
                          options: { field: "title" },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {};

        const i = new model({ obj });

        expect(testValidate).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidate).toBeCalledTimes(0);
      });

      it("Should support nested JSON fields and should validate if nested value is not undefined", async () => {
        const testValidate = jest.fn(() => Promise.resolve(true));

        class TestValidatorRequired extends Validator<ValidatorTypes.REQUIRED> {
          validate = testValidate;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: TestValidatorRequired,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                fields: {
                  nested: {
                    type: FieldTypes.JSON,
                    options: {
                      validators: [
                        {
                          type: ValidatorTypes.REQUIRED,
                          options: { field: "title" },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = { nested: {} };

        const i = new model({ obj });

        expect(testValidate).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidate).toBeCalledTimes(1);
      });
    });

    describe("options.defaultField", () => {
      it("should use defaultField by default to serialize", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);

        class TestFieldText extends Field<FieldTypes.TEXT> {
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                defaultField: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const i = new model({ obj: { title: "test" } });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(serializedText);
      });

      it("should use defaultField only for not defined fields", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);

        class TestFieldText extends Field<FieldTypes.TEXT> {
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                defaultField: {
                  type: FieldTypes.TEXT,
                },
                fields: {
                  test: {
                    type: FieldTypes.NUMBER,
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const fakerNumber = parseFloat(faker.random.numeric());
        const i = new model({ obj: { title: "test", test: fakerNumber } });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(serializedText);
        expect(i.obj.test).toEqual(fakerNumber);
      });

      it("should use defaultField by default to validate", async () => {
        const testValidator = jest.fn((value) => Promise.resolve(true));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
        }

        const _adapter = mockAdapter({
          modelDefinition: { fields: {}, validators: [] },
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.JSON,
              options: {
                defaultField: {
                  type: FieldTypes.TEXT,
                },
                fields: {
                  test: {
                    type: FieldTypes.NUMBER,
                  },
                },
              },
            },
          },
        }).withAdapter(_adapter);
        await model.initialize();

        const fakeNumber = faker.random.numeric();
        const i = new model({
          obj: { title: "test", title2: "test2", test: fakeNumber },
        });

        expect(i.obj).toBeInstanceOf(Object);
        expect(testValidator).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidator).toBeCalledTimes(2);
      });
    });
  });
});
