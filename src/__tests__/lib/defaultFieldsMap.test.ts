import { ObjectId } from "bson";
import { mockAdapter, mockModel } from "../../lib/test-utils";
import FieldTypes from "../../enums/field-types";
import { faker } from "@faker-js/faker";
import Field from "../../lib/Field";
import Validator from "../../lib/Validator";
import ValidatorTypes from "../../enums/validator-types";
import ValidationError from "../../lib/ValidationError";
import PromiseModel from "../../lib/PromiseModel";
import { getFieldFromDefinition, models } from "../../index";
import PromiseModelList from "../../lib/PromiseModelList";
import SerializerFormat from "../../enums/serializer-format";

describe("test fieldsMap", () => {
  const adapter = mockAdapter({});

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

    describe("options.options", () => {
      it("Should returns value within options", async () => {
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
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = options[0];

        const i = new model({ title });
        expect(i.title).toEqual(title);
      });

      it("Should returns value not in options if strict mode is not enabled", async () => {
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
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = "notInOptions";

        const i = new model({ title });
        expect(i.title).toEqual(title);
      });

      it("Should returns value within options if value is valid & strict mode is enabled", async () => {
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
                strict: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = options[0];

        const i = new model({ title });
        expect(i.title).toEqual(title);
      });

      it("Should returns null if value not in options and strict mode is enabled", async () => {
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
                strict: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = "notInOptions";

        const i = new model({ title });
        expect(i.title).toEqual(undefined);
      });

      it("Should not throw error if value is in options and strict mode is enabled", async () => {
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
                strict: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = options[0];

        const i = new model({ title });
        await expect(model.validate([i])).resolves.toBeTruthy();
      });

      it("Should throw error if value not in options and strict mode is enabled", async () => {
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
                strict: true,
              },
            },
          },
        }).withAdapter(adapter);
        await model.initialize();

        const title = "notInOptions";

        const i = new model({ title });
        await expect(model.validate([i])).rejects.toThrow(ValidationError);
      });
    });
  });

  describe("Nested field", () => {
    it("Should returns default value if undefined", async () => {
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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({});
      expect(i.obj).toEqual(defaultJSON);
    });

    it("Should returns object value by default", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
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
            type: FieldTypes.NESTED,
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
      expect(Array.isArray(i.obj)).toBeFalsy();
    });

    describe("Proxy", () => {
      it("Should returns an object proxy", async () => {
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
        }).withAdapter(adapter);
        await model.initialize();

        const i = new model({
          obj: {},
        });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.__isProxy).toBe(true);
      });

      it("Should not call other fields serializers thanks to the proxy", async () => {
        const serializeText = jest.fn((value: any): any => {
          return typeof value === "string" ? value : String(value);
        });

        const serializeNumber = jest.fn((value: any): any => {
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
        }).withAdapter(_adapter);
        await model.initialize();

        expect(serializeText).not.toHaveBeenCalled();
        expect(serializeNumber).not.toHaveBeenCalled();

        const i = new model({
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

      it("Should not call other fields serializers thanks to the proxy even in nested objects", async () => {
        const serializeText = jest.fn((value: any): any => {
          return typeof value === "string" ? value : String(value);
        });

        const serializeNumber = jest.fn((value: any): any => {
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
        }).withAdapter(_adapter);
        await model.initialize();

        expect(serializeText).not.toHaveBeenCalled();
        expect(serializeNumber).not.toHaveBeenCalled();

        const i = new model({
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

      it("Should not call other fields serializers thanks to the proxy even in nested array", async () => {
        const serializeText = jest.fn((value: any): any => {
          return typeof value === "string" ? value : String(value);
        });

        const serializeNumber = jest.fn((value: any): any => {
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
        }).withAdapter(_adapter);
        await model.initialize();

        expect(serializeText).not.toHaveBeenCalled();
        expect(serializeNumber).not.toHaveBeenCalled();

        const i = new model({
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
      it("Should returns only defined fields in options when strict", async () => {
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
        }).withAdapter(_adapter);
        await model.initialize();

        const obj = {
          nested: {
            title: faker.lorem.word(),
          },
        };

        const i = new model({ obj });

        try {
          await model.validate([i]);
        } catch (e) {
          expect(e).toBeInstanceOf(ValidationError);
          expect(e.fieldsPaths.includes("obj.nested.title")).toBeTruthy();
        }
      });
    });

    describe("options.validators", () => {
      it("Should validate validators defined in options", async () => {
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
        }).withAdapter(_adapter);
        await model.initialize();

        const i = new model({ obj: { title: "test" } });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(serializedText);
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
        }).withAdapter(_adapter);
        await model.initialize();

        const i = new model({ obj: { title: "test" } });

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
        }).withAdapter(_adapter);
        await model.initialize();

        const fakerNumber = parseFloat(faker.random.numeric());
        const i = new model({ obj: { title: "test", test: fakerNumber } });

        expect(i.obj).toBeInstanceOf(Object);
        expect(i.obj.title).toEqual(serializedText);
        expect(i.obj.test).toEqual(fakerNumber);
      });

      it("should use defaultField by default to validate", async () => {
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

  describe("Identity field", () => {
    it("Should throw error if is invalid", async () => {
      const model = mockModel({
        fields: {
          identity: {
            type: FieldTypes.IDENTITY,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      await expect(model.create({ identity: "invalid" })).rejects.toThrow(
        ValidationError
      );

      await expect(model.create({ identity: "account:test" })).rejects.toThrow(
        ValidationError
      );
    });

    it("Should not throw error if is valid", async () => {
      const model = mockModel({
        fields: {
          identity: {
            type: FieldTypes.IDENTITY,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      await expect(
        model.create({ identity: "account:507f191e810c19729de860ea" })
      ).resolves.toBeInstanceOf(model);
    });
  });

  describe("Relation field", () => {
    it("should returns valid PromiseModel instance", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({ rel: "507f191e810c19729de860ea" });

      expect(i.rel).toBeInstanceOf(PromiseModel);
      expect(i.rel.model?.getBaseClass()).toBe(models.Account);
      expect(i.rel.query).toEqual("507f191e810c19729de860ea");
    });

    it("should returns null if value is null", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({ rel: null });

      expect(i.rel).toBe(null);
    });

    it("should returns null if value is invalid", async () => {
      const model = mockModel({
        fields: {
          rel: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({ rel: "invalid" });

      expect(i.rel).toBe(null);
    });
  });

  describe("Array field", () => {
    it("should returns valid serialized array from items option", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({
        arrTextWithOpts: ["invalid1", options[1], "invalid2"],
        arrNumbers: ["1", "2", "3"],
      });

      expect(i.arrTextWithOpts).toEqual([undefined, options[1], undefined]);
      expect(i.arrNumbers).toEqual([1, 2, 3]);
    });

    it("should returns PromiseModelList for relation array with format object", async () => {
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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({
        arrRel: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      });

      expect(i.arrRel).toBeInstanceOf(PromiseModelList);
      expect(i.arrRel.model?.getBaseClass()).toBe(models.Account);
      expect(i.arrRel.query).toEqual({
        ids: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      });
    });

    it("should returns array of ids for relation array with format json", async () => {
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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({
        arrRel: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      });

      const jsonArrRel = i.get("arrRel", SerializerFormat.JSON);

      expect(jsonArrRel).toBeInstanceOf(Array);
      expect(jsonArrRel).toEqual([
        "507f191e810c19729de860ea",
        "507f191e810c19729de860eb",
      ]);
    });

    it("should returns array of objects for json field", async () => {
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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({
        arrJson: [{ test: "test" }, { test2: "test2" }],
      });

      expect(i.arrJson).toBeInstanceOf(Array);
      expect(i.arrJson).toEqual([{ test: "test" }, { test2: "test2" }]);
    });

    it("should returns array from non-array with json field", async () => {
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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({
        arrJson: { test: "test" },
      });

      expect(i.arrJson).toBeInstanceOf(Array);
      expect(i.arrJson).toEqual([{ test: "test" }]);
    });

    it("should returns serialized item from index", async () => {
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
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({
        arrJson: [
          { title: 1, test: "1" },
          { title: 2, test: "2" },
          "invalid",
          { title: 3, test: "3" },
        ],
      });

      const value = i.get("arrJson.[2].title");

      expect(i.get("arrJson.[0].title")).toEqual("1");
      expect(i.get("arrJson.[0].test")).toBe(undefined);

      expect(i.get("arrJson.[1].title")).toEqual("2");
      expect(i.get("arrJson.[1].test")).toBe(undefined);

      expect(i.get("arrJson.[2].title")).toBe(null);
      expect(i.get("arrJson.[2].test")).toBe(undefined);

      expect(i.get("arrJson.[3].title")).toEqual("3");
      expect(i.get("arrJson.[3].test")).toBe(undefined);
    });

    it("should returns serialized item from index within array", async () => {
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
      }).withAdapter(adapter);

      await model.initialize();

      const ids = Array.from({ length: 3 }, () => new ObjectId().toString());

      const i = new model({
        arrRel: ids,
      });

      expect(i.get("arrRel")).toBeInstanceOf(PromiseModelList);
      expect(i.get("arrRel.[]")).toBeInstanceOf(Array);
      expect(
        i.get("arrRel.[]").every((i) => i instanceof PromiseModel)
      ).toBeTruthy();

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
