import { ObjectId } from "bson";
import { generateRandomString, mockAdapter, mockModel } from "@/lib/test-utils";
import FieldTypes from "@/enums/field-types";
import { faker } from "@faker-js/faker";
import Field from "@/lib/Field";
import Validator from "@/lib/Validator";
import ValidatorTypes from "@/enums/validator-types";
import ValidationError from "@/lib/ValidationError";
import PromiseModel from "@/lib/PromiseModel";
import { DataModel, JSONType, Model, models } from "@/index";
import PromiseModelList from "@/lib/PromiseModelList";

describe("test fieldsMap", () => {
  const adapter = mockAdapter({});

  describe("TEXT field", () => {
    it("should return default value if undefined", async () => {
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
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({});
      expect(i.title).toEqual(defaultText);
    });

    it("should return string value by default", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const title = faker.lorem.word();

      const i = model.fromDoc({ title });
      expect(i.title).toEqual(title);
    });

    it("should return string from array by default", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const titleArray = [faker.lorem.word(), faker.lorem.word()];

      const i = model.fromDoc({ title: titleArray } as object);
      expect(typeof i.title).toBe("string");
    });

    it("should not be able to save an _id in a TEXT field", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({ title: String(new ObjectId()) });

      await expect(model.validate([i])).rejects.toThrow(ValidationError);
    });

    describe("options.options", () => {
      it("should return value within options", async () => {
        const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const title = options[0];

        const i = model.fromDoc({ title });
        expect(i.title).toEqual(title);
      });

      it("should return value not in options if strict mode is not enabled", async () => {
        const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const title = "notInOptions";

        const i = model.fromDoc({ title });
        expect(i.title).toEqual(title);
      });

      it("should return value within options if value is valid & strict mode is enabled", async () => {
        const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                strict: true,
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const title = options[0];

        const i = model.fromDoc({ title });
        expect(i.title).toEqual(title);
      });

      it("should return null if value not in options and strict mode is enabled", async () => {
        const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                strict: true,
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const title = "notInOptions";

        const i = model.fromDoc({ title });
        expect(i.title).toEqual(undefined);
      });

      it("should not throw error if value is in options and strict mode is enabled", async () => {
        const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                strict: true,
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const title = options[0];

        const i = model.fromDoc({ title });
        await expect(model.validate([i])).resolves.toBeTruthy();
      });

      it("should throw error if value not in options and strict mode is enabled", async () => {
        const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

        const model = mockModel({
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                options,
                strict: true,
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const title = "notInOptions";

        const i = model.fromDoc({ title });
        await expect(model.validate([i])).rejects.toThrow(ValidationError);
      });
    });
  });

  describe("Nested field", () => {
    it("should return default value if undefined", async () => {
      const defaultJSON = { default: true };

      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
            options: {
              default: defaultJSON,
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({});
      expect(i.obj).toEqual(defaultJSON);
    });

    it("should return object value by default", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const obj = { title: faker.lorem.word() };

      const i = model.fromDoc({ obj });
      expect(i.obj).toBeInstanceOf(Object);
    });

    it("should return object from array by default", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const obj = [{ title: faker.lorem.word() }, { title: faker.lorem.word() }];

      const i = model.fromDoc({ obj } as object);
      expect(i.obj).toBeInstanceOf(Object);
      expect(Array.isArray(i.obj)).toBeFalsy();
    });

    it("should return undefined if no value", async () => {
      const model = DataModel.extend({ adapterClass: adapter });

      const i = await model.create({
        slug: generateRandomString(),
        definition: {
          fields: {
            test: {
              type: FieldTypes.NESTED,
            },
          },
        },
      });
      expect(i.get("definition.fields.test.options", "json")).toBe(undefined);
    });

    it("should not bind default values in document format", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
            options: {
              default: { test: 1 },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({});

      expect(i.get("obj")).toEqual({ test: 1 });
      expect(i.get("obj", "document")).toEqual(undefined);
    });

    it("should not bind default values in document format in nested fields", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                foo: {
                  type: FieldTypes.TEXT,
                  options: {
                    default: "bar",
                  },
                },
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        obj: {},
      });

      expect(i.get("obj.foo")).toEqual("bar");
      expect(i.get("obj.foo", "document")).toEqual(undefined);
    });

    describe("Proxy", () => {
      it("should return an object proxy", async () => {
        const model = mockModel({
          fields: {
            obj: {
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
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const i = model.fromDoc({
          obj: {},
        });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.__isProxy).toBe(true);
      });

      it("should not call other fields serializers thanks to the proxy", async () => {
        const serializeText = jest.fn(value => {
          return typeof value === "string" ? value : String(value);
        });

        const serializeNumber = jest.fn(value => {
          return parseFloat(value);
        });

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: class extends Field<FieldTypes.TEXT> {
              serialize = serializeText;
            },
            [FieldTypes.NUMBER]: class extends Field<FieldTypes.NUMBER> {
              serialize = serializeNumber;
            },
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  title: {
                    type: FieldTypes.TEXT,
                  },
                  value: {
                    type: FieldTypes.NUMBER,
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        expect(serializeText).not.toHaveBeenCalled();
        expect(serializeNumber).not.toHaveBeenCalled();

        const i = model.fromDoc({
          obj: {
            title: "test",
            value: 123,
          },
        });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toBe("test");

        expect(serializeText).toHaveBeenCalledTimes(1);
        expect(serializeNumber).not.toHaveBeenCalled();
      });

      it("should not call other fields serializers thanks to the proxy even in nested objects", async () => {
        const serializeText = jest.fn(value => {
          return typeof value === "string" ? value : String(value);
        });

        const serializeNumber = jest.fn(value => {
          return parseFloat(value);
        });

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: class extends Field<FieldTypes.TEXT> {
              serialize = serializeText;
            },
            [FieldTypes.NUMBER]: class extends Field<FieldTypes.NUMBER> {
              serialize = serializeNumber;
            },
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  subObj: {
                    type: FieldTypes.NESTED,
                    options: {
                      fields: {
                        title: {
                          type: FieldTypes.TEXT,
                        },
                        value: {
                          type: FieldTypes.NUMBER,
                        },
                      },
                    },
                  },
                  subValue: {
                    type: FieldTypes.NUMBER,
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        expect(serializeText).not.toHaveBeenCalled();
        expect(serializeNumber).not.toHaveBeenCalled();

        const i = model.fromDoc({
          obj: {
            subObj: {
              title: "test",
              value: 123,
            },
            subValue: 456,
          },
        });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.subObj).toBeInstanceOf(Object);
        expect(i.obj.subObj.title).toBe("test");
        expect(serializeText).toHaveBeenCalledTimes(1);

        expect(i.get("obj.subObj.title")).toBe("test");

        expect(serializeNumber).not.toHaveBeenCalled();
      });

      it("should not call other fields serializers thanks to the proxy even in nested array", async () => {
        const serializeText = jest.fn(value => {
          return typeof value === "string" ? value : String(value);
        });

        const serializeNumber = jest.fn(value => {
          return parseFloat(value);
        });

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: class extends Field<FieldTypes.TEXT> {
              serialize = serializeText;
            },
            [FieldTypes.NUMBER]: class extends Field<FieldTypes.NUMBER> {
              serialize = serializeNumber;
            },
          },
        });

        const model = mockModel({
          fields: {
            arr: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      title: {
                        type: FieldTypes.TEXT,
                      },
                      value: {
                        type: FieldTypes.NUMBER,
                      },
                    },
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        expect(serializeText).not.toHaveBeenCalled();
        expect(serializeNumber).not.toHaveBeenCalled();

        const i = model.fromDoc({
          arr: [
            {
              title: "test",
              value: 123,
            },
          ],
        });

        expect(i.arr).toBeInstanceOf(Array);
        expect(i.arr[0]).toBeInstanceOf(Object);
        expect(i.arr[0].title).toBe("test");

        expect(serializeText).toHaveBeenCalledTimes(1);
        expect(serializeNumber).not.toHaveBeenCalled();
      });
    });

    describe("options.strict", () => {
      it("should return only defined fields in options when strict", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: adapter });
        await model.initialize();

        const obj = {
          title: faker.lorem.word(),
          fieldNotDefined: faker.lorem.word(),
        };

        const i = model.fromDoc({ obj });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _obj = i.obj as any;

        expect(_obj).toBeInstanceOf(Object);
        expect(_obj.title).toEqual(obj.title);
        expect(_obj.fieldNotDefined).toBe(undefined);
      });
    });

    describe("options.fields", () => {
      it("should serialize from fields defined in options", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);

        class TestFieldText extends Field<FieldTypes.TEXT> {
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = {
          title: faker.lorem.word(),
        };

        const i = model.fromDoc({ obj });
        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(serializedText);
      });

      it("should validate fields defined in options", async () => {
        const testValidator = jest.fn(() => Promise.resolve(true));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = { title: faker.lorem.word() };

        const i = model.fromDoc({ obj });

        expect(testValidator).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidator).toBeCalledTimes(1);
      });

      it("should support nested JSON fields", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);
        const testValidator = jest.fn(() => Promise.resolve(true));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  nested: {
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
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = {
          nested: {
            title: faker.lorem.word(),
          },
        };

        const i = model.fromDoc({ obj });
        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.nested).toBeInstanceOf(Object);
        expect(i.obj.nested.title).toEqual(serializedText);

        expect(testValidator).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidator).toBeCalledTimes(1);
      });

      it("should throw error if error happens in field validation", async () => {
        const testValidator = jest.fn(() => Promise.resolve(false));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  nested: {
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
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = {
          nested: {
            title: faker.lorem.word(),
          },
        };

        const i = model.fromDoc({ obj });

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeInstanceOf(ValidationError);
          expect(e.fieldsPaths.includes("obj.nested.title")).toBeTruthy();
        }
      });
    });

    describe("options.validators", () => {
      it("should validate validators defined in options", async () => {
        const testValidate = jest.fn(() => Promise.resolve(true));

        const _adapter = mockAdapter({
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: class extends Validator<ValidatorTypes.REQUIRED> {
              validate = testValidate;
            },
          },
        });

        const model = mockModel({
          validators: [],
          fields: {
            obj: {
              type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = {};

        const i = model.fromDoc({ obj });

        expect(testValidate).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidate).toBeCalledTimes(1);
      });

      it("should throw error if error happens in validator", async () => {
        const testValidate = jest.fn(() => Promise.resolve(false));

        const _adapter = mockAdapter({
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: class extends Validator<ValidatorTypes.REQUIRED> {
              validate = testValidate;
            },
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = {};
        const i = model.fromDoc({ obj });

        expect.assertions(1);

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeDefined();
        }
      });

      it("should support nested JSON fields and should not validate if nested value undefined", async () => {
        const testValidate = jest.fn(() => Promise.resolve(true));

        const _adapter = mockAdapter({
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: class extends Validator<ValidatorTypes.REQUIRED> {
              validate = testValidate;
            },
          },
        });

        const model = mockModel({
          validators: [],
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  nested: {
                    type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = {};

        const i = model.fromDoc({ obj });

        expect(testValidate).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidate).toBeCalledTimes(0);
      });

      it("should support nested JSON fields and should validate if nested value is not undefined", async () => {
        const testValidate = jest.fn(() => Promise.resolve(true));

        const _adapter = mockAdapter({
          validatorsMap: {
            [ValidatorTypes.REQUIRED]: class extends Validator<ValidatorTypes.REQUIRED> {
              validate = testValidate;
            },
          },
        });

        const model = mockModel({
          validators: [],
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  nested: {
                    type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const obj = { nested: {} };

        const i = model.fromDoc({ obj });

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
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                defaultField: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const i = model.fromDoc({ obj: { title: "test" } });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = i.obj as any;

        expect(obj).toBeInstanceOf(Object);
        expect(obj.title).toEqual(serializedText);
      });

      it("should use defaultField by default to serialize in json", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);

        class TestFieldText extends Field<FieldTypes.TEXT> {
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                defaultField: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const i = model.fromDoc({ obj: { title: "test" } });

        const json = i.toJSON();

        expect(json.obj).toBeInstanceOf(Object);
        expect(json.obj.title).toEqual(serializedText);
      });

      it("should use defaultField only for not defined fields", async () => {
        const serializedText = faker.lorem.word();
        const testSerializer = jest.fn(() => serializedText);

        class TestFieldText extends Field<FieldTypes.TEXT> {
          serialize = testSerializer;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const fakerNumber = parseFloat(faker.random.numeric());
        const i = model.fromDoc({ obj: { title: "test", test: fakerNumber } } as object);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = i.obj as any;

        expect(obj).toBeInstanceOf(Object);
        expect(obj.title).toEqual(serializedText);
        expect(obj.test).toEqual(fakerNumber);
      });

      it("should use defaultField by default to validate", async () => {
        const testValidator = jest.fn(() => Promise.resolve(true));

        class TestFieldText extends Field<FieldTypes.TEXT> {
          validate = testValidator;
          sTo = ({ value }) => value;
        }

        const _adapter = mockAdapter({
          fieldsMap: {
            [FieldTypes.TEXT]: TestFieldText,
          },
        });

        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
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
        }).extend({ adapterClass: _adapter });
        await model.initialize();

        const fakeNumber = faker.random.numeric();
        const i = model.fromDoc({
          obj: { title: "test", title2: "test2", test: fakeNumber },
        } as object);

        expect(i.obj).toBeInstanceOf(Object);
        expect(testValidator).toBeCalledTimes(0);

        await model.validate([i]);

        expect(testValidator).toBeCalledTimes(2);
      });
    });

    describe("consistency", () => {
      const _testConsistency = (model: typeof Model, obj: JSONType, f = "obj") => {
        const i = model.fromDoc({ [f]: obj });

        const obj1 = i.get(f, "json");
        const obj2 = model.fromDoc({ [f]: obj1 }).get(f, "json");

        expect(obj1).toEqual(obj2);
      };

      it("should be consistent with nested text field", async () => {
        const model = mockModel({
          fields: {
            obj: {
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
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          title: faker.lorem.word(),
        });
      });

      it("should be consistent with nested number field", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  value: {
                    type: FieldTypes.NUMBER,
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          value: Math.random(),
        });
      });

      it("should be consistent with nested boolean field", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  value: {
                    type: FieldTypes.BOOLEAN,
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          value: Math.random() > 0.5,
        });
      });

      it("should be consistent with nested date field", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  value: {
                    type: FieldTypes.DATE,
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          value: new Date(),
        });
      });

      it("should be consistent with nested identity field", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  value: {
                    type: FieldTypes.IDENTITY,
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          value: new ObjectId().toString(),
        });
      });

      it("should be consistent with nested relation field", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  value: {
                    type: FieldTypes.RELATION,
                    options: {
                      ref: "accounts",
                    },
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          value: new ObjectId().toString(),
        });
      });

      it("should be consistent with nested array field", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      value: {
                        type: FieldTypes.NUMBER,
                      },
                    },
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, [
          {
            value: Math.random(),
          },
        ]);
      });

      it("should be consistent with nested array field in nested object", async () => {
        const model = mockModel({
          fields: {
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  arr: {
                    type: FieldTypes.ARRAY,
                    options: {
                      items: {
                        type: FieldTypes.NESTED,
                        options: {
                          fields: {
                            value: {
                              type: FieldTypes.NUMBER,
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
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, {
          arr: [
            {
              value: Math.random(),
            },
          ],
        });
      });

      it("should be consistent with nested array field in nested array", async () => {
        const model = mockModel({
          fields: {
            arr: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      arr: {
                        type: FieldTypes.ARRAY,
                        options: {
                          items: {
                            type: FieldTypes.NUMBER,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }).extend({ adapterClass: adapter });
        await model.initialize();

        _testConsistency(model, [
          {
            arr: [Math.random()],
          },
        ]);
      });
    });
  });

  describe("Identity field", () => {
    it("should throw error if is invalid", async () => {
      const model = mockModel({
        fields: {
          identity: {
            type: FieldTypes.IDENTITY,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      await expect(model.create({ identity: "invalid" })).rejects.toThrow(ValidationError);

      await expect(model.create({ identity: "account:test" })).rejects.toThrow(ValidationError);
    });

    it("should not throw error if is valid", async () => {
      const model = mockModel({
        fields: {
          identity: {
            type: FieldTypes.IDENTITY,
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      await expect(
        model.create({ identity: "account:507f191e810c19729de860ea" }),
      ).resolves.toBeInstanceOf(model);
    });
  });

  describe("Relation field", () => {
    it("should return valid PromiseModel instance", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const _id = String(new ObjectId());
      const i = model.fromDoc({ rel: _id });

      expect(i.rel).toBeInstanceOf(PromiseModel);
      expect(i.rel.model?.getBaseClass()).toBe(models.Account);
      expect(i.rel.query).toEqual(_id);
    });

    it("should return null if value is null", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({ rel: null });

      expect(i.rel).toBe(null);
    });

    it("should return null if value is invalid", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({ rel: "invalid" });

      expect(i.rel).toBe(null);
    });

    it("should return string in JSON format", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const _id = String(new ObjectId());
      const i = model.fromDoc({ rel: _id });

      expect(i.get("rel", "json")).toEqual(_id);
    });
  });

  describe("Array field", () => {
    it("should throw error if is relation with invalid value", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.RELATION,
                options: {
                  ref: "accounts",
                },
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      await expect(
        model.create({
          arr: ["507f191e810c19729de860ea", "invalid"],
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("should not throw error if is relation with valid value", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.RELATION,
                options: {
                  ref: "accounts",
                },
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      await expect(
        model.create({
          arr: ["507f191e810c19729de860ea"],
        }),
      ).resolves.toBeInstanceOf(model);
    });

    it("should return valid serialized array from items option", async () => {
      const options = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];

      const model = mockModel({
        fields: {
          arrTextWithOpts: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
                options: {
                  options,
                  strict: true,
                },
              },
            },
          },
          arrNumbers: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NUMBER,
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        arrTextWithOpts: ["invalid1", options[1], "invalid2"],
        arrNumbers: ["1", "2", "3"],
      } as object);

      expect(i.arrTextWithOpts).toEqual([undefined, options[1], undefined]);
      expect(i.arrNumbers).toEqual([1, 2, 3]);
    });

    it("should return PromiseModelList for relation array with format object", async () => {
      const model = mockModel({
        fields: {
          arrRel: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.RELATION,
                options: {
                  ref: "accounts",
                },
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        arrRel: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      });

      expect(i.arrRel).toBeInstanceOf(PromiseModelList);
      expect(i.arrRel.model?.getBaseClass()).toBe(models.Account);
      expect(i.arrRel.query).toEqual({
        ids: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      });
    });

    it("should return array of ids for relation array with format json", async () => {
      const model = mockModel({
        fields: {
          arrRel: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.RELATION,
                options: {
                  ref: "accounts",
                },
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        arrRel: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      });

      const jsonArrRel = i.get("arrRel", "json");

      expect(jsonArrRel).toBeInstanceOf(Array);
      expect(jsonArrRel).toEqual(["507f191e810c19729de860ea", "507f191e810c19729de860eb"]);
    });

    it("should return array of objects for json field", async () => {
      const model = mockModel({
        fields: {
          arrJson: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        arrJson: [{ test: "test" }, { test2: "test2" }],
      });

      expect(i.arrJson).toBeInstanceOf(Array);
      expect(i.arrJson).toEqual([{ test: "test" }, { test2: "test2" }]);
    });

    it("should return array from non-array with json field", async () => {
      const model = mockModel({
        fields: {
          arrJson: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        arrJson: { test: "test" },
      } as object);

      expect(i.arrJson).toBeInstanceOf(Array);
      expect(i.arrJson).toEqual([{ test: "test" }]);
    });

    it("should return serialized item from index", async () => {
      const model = mockModel({
        fields: {
          arrJson: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
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
          },
        },
      }).extend({ adapterClass: adapter });
      await model.initialize();

      const i = model.fromDoc({
        arrJson: [
          { title: 1, test: "1" },
          { title: 2, test: "2" },
          "invalid",
          { title: 3, test: "3" },
        ],
      } as object);

      expect(i.get("arrJson.[0].title")).toEqual("1");
      expect(i.get("arrJson.[0].test")).toBe(undefined);

      expect(i.get("arrJson.[1].title")).toEqual("2");
      expect(i.get("arrJson.[1].test")).toBe(undefined);

      expect(i.get("arrJson.[2].title")).toBe(null);
      expect(i.get("arrJson.[2].test")).toBe(undefined);

      expect(i.get("arrJson.[3].title")).toEqual("3");
      expect(i.get("arrJson.[3].test")).toBe(undefined);
    });

    it("should return serialized item from index within array", async () => {
      const model = mockModel({
        fields: {
          arrRel: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.RELATION,
                options: {
                  ref: "accounts",
                },
              },
            },
          },
        },
      }).extend({ adapterClass: adapter });

      await model.initialize();

      const ids = Array.from({ length: 3 }, () => new ObjectId().toString());

      const i = model.fromDoc({
        arrRel: ids,
      });

      expect(i.get("arrRel")).toBeInstanceOf(PromiseModelList);
      expect(i.get("arrRel.[]")).toBeInstanceOf(Array);
      expect(i.get("arrRel.[]").every(i => i instanceof PromiseModel)).toBeTruthy();

      expect(i.get("arrRel.[0]")).toBeInstanceOf(PromiseModel);
      expect(i.get("arrRel.[0]").query).toEqual(ids[0]);

      expect(i.get("arrRel.[1]")).toBeInstanceOf(PromiseModel);
      expect(i.get("arrRel.[1]").query).toEqual(ids[1]);

      expect(i.get("arrRel.[2]")).toBeInstanceOf(PromiseModel);
      expect(i.get("arrRel.[2]").query).toEqual(ids[2]);

      expect(i.get("arrRel.[3]")).toBe(undefined);
    });
  });
});
