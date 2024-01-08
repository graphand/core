import {
  mockAdapter,
  mockModel,
  generateRandomString,
} from "../../lib/test-utils";
import Field from "../../lib/Field";
import Model from "../../lib/Model";
import FieldTypes from "../../enums/field-types";
import Validator from "../../lib/Validator";
import ValidatorTypes from "../../enums/validator-types";
import {
  Account,
  CoreError,
  DataModel,
  ErrorCodes,
  PromiseModelList,
  SerializerFormat,
} from "../../index";
import {
  getRecursiveValidatorsFromModel,
  getAdaptedModel,
} from "../../lib/utils";
import Data from "../../lib/Data";
import PromiseModel from "../../lib/PromiseModel";

describe("Test Model", () => {
  let adapter = mockAdapter();
  let BaseModel = mockModel();

  describe("Model crud", () => {
    it("Should be able to Model.create", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const created = await TestModel.create({});
      expect(created).toBeInstanceOf(TestModel);
    });

    it("Should be able to Model.createMultiple", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const created = await TestModel.createMultiple([{}, {}, {}]);
      expect(created).toBeInstanceOf(Array);
      created.forEach((i) => {
        expect(i).toBeInstanceOf(TestModel);
      });
    });

    it("Should be able to Model.count", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const count = await TestModel.count();
      expect(typeof count).toBe("number");
    });

    it("Should be able to Model.count", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const count = await TestModel.count();
      expect(typeof count).toBe("number");
    });
  });

  describe("Model initialization", () => {
    it("Model should load fields from adapter", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const created = await TestModel.create({});
      expect(created.model.fieldsMap.get("title")).toBeInstanceOf(Field);
    });

    it("Model should load validators from adapter", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const created = await TestModel.create({});
      expect(created.model.validatorsArray).toBeInstanceOf(Array);
      expect(created.model.validatorsArray.length).toEqual(1);
    });

    it("Should be able to getFromSlug with adapter", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const AccountModel = TestModel.getFromSlug("accounts");
      expect(AccountModel.getAdapter(false)).toBeInstanceOf(adapter);
    });

    it("Should be able to getFromSlug without adapter", async () => {
      const AccountModel = Model.getFromSlug("accounts");
      expect(AccountModel.getAdapter(false)).toBeUndefined();
    });

    it("Model initialization should execute hooks", async () => {
      const _model = mockModel();
      const model = _model.withAdapter(adapter);

      const hookBefore = jest.fn();
      const hookAfter = jest.fn();
      model.hook("before", "initialize", hookBefore);
      model.hook("after", "initialize", hookAfter);

      await model.initialize();

      expect(hookBefore).toBeCalledTimes(1);
      expect(hookAfter).toBeCalledTimes(1);
    });

    it("Model initialization should execute hooks only at first initialization", async () => {
      const _model = mockModel();
      const model = _model.withAdapter(adapter);

      const hookBefore = jest.fn();
      const hookAfter = jest.fn();
      model.hook("before", "initialize", hookBefore);
      model.hook("after", "initialize", hookAfter);

      await model.initialize();

      expect(hookBefore).toBeCalledTimes(1);
      expect(hookAfter).toBeCalledTimes(1);

      await model.initialize();

      expect(hookBefore).toBeCalledTimes(1);
      expect(hookAfter).toBeCalledTimes(1);
    });

    it("Model initialization with hook error should throw error", async () => {
      const _model = mockModel();
      const model = _model.withAdapter(adapter);

      const hookBefore = jest.fn(() => {
        throw new Error("test");
      });
      model.hook("before", "initialize", hookBefore);

      await expect(model.initialize()).rejects.toThrowError("test");
    });

    it("Model initialization should use __initOptions", async () => {
      const _model = mockModel();
      const model = _model.withAdapter(adapter);

      const initFn = jest.spyOn(model, "reloadModel");

      expect(initFn).toBeCalledTimes(0);

      await model.initialize();

      expect(initFn).toBeCalledTimes(1);

      await model.initialize();

      expect(initFn).toBeCalledTimes(1);

      const lastCallArgs = initFn.mock.calls[0][0];

      expect(lastCallArgs.datamodel).toBeUndefined();
      expect(lastCallArgs.ctx).toBeUndefined();

      const model2 = model.clone({
        datamodel: new DataModel({
          keyField: "test",
        }),
      });

      const initFn2 = jest.spyOn(model2, "reloadModel");

      expect(initFn2).toBeCalledTimes(1);

      await model2.initialize();

      expect(initFn2).toBeCalledTimes(2);

      const lastCall2Args = initFn2.mock.calls[1][0];

      expect(lastCall2Args?.datamodel).toBeInstanceOf(DataModel);

      expect(model.keyField).toBeUndefined();
      expect(model2.keyField).toEqual("test");
    });
  });

  describe("Model getter", () => {
    it("Model should returns field default value if undefined", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
            options: {
              default: "default",
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});
      expect(created.get("test")).toBe("default");
    });

    it("should serialize with field from adapter", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        test: 123,
      });

      expect(created.get("test")).toBe("123");
    });

    it("should serialize with nested fields in json", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                nested: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        test: {
          nested: 123,
        },
      });

      expect(created.get("test.nested")).toBe("123");
      expect(created.test.nested).toBe("123");
    });

    it("should serialize with nested fields in array", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        test: [123],
      });

      expect(created.get("test")).toEqual(["123"]);
      expect(created.get("test.[]")).toEqual(["123"]);
      expect(created.get("test.toto")).toEqual([undefined]);
      expect(created.test).toBeInstanceOf(Array);
      expect(created.test.length).toEqual(1);
      expect(created.test[0]).toEqual("123");
    });

    it("should serialize with nested fields in array of array", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.ARRAY,
                options: {
                  items: {
                    type: FieldTypes.TEXT,
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        test: [[123], [456]],
      });

      expect(created.get("test")).toEqual([["123"], ["456"]]);
      expect(created.get("test.[]")).toEqual([["123"], ["456"]]);
    });

    it("should serialize with nested json field in array of array", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.ARRAY,
                options: {
                  items: {
                    type: FieldTypes.NESTED,
                    options: {
                      fields: {
                        nested: {
                          type: FieldTypes.TEXT,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        test: [
          [
            {
              nested: 123,
            },
            {
              nested: 456,
            },
          ],
          [
            {
              nested: 123,
            },
            {
              nested: 456,
            },
          ],
        ],
      });

      expect(created.get("test")).toEqual([
        [
          {
            nested: "123",
          },
          {
            nested: "456",
          },
        ],
        [
          {
            nested: "123",
          },
          {
            nested: "456",
          },
        ],
      ]);

      expect(created.get("test.[]")).toEqual([
        [
          {
            nested: "123",
          },
          {
            nested: "456",
          },
        ],
        [
          {
            nested: "123",
          },
          {
            nested: "456",
          },
        ],
      ]);

      expect(created.get("test.nested")).toEqual([undefined, undefined]);

      expect(created.get("test.[].nested")).toEqual([
        ["123", "456"],
        ["123", "456"],
      ]);

      expect(created.get("test.[].[].nested")).toEqual([
        ["123", "456"],
        ["123", "456"],
      ]);

      expect(created.get("test.[].[].nested.[]")).toEqual([
        [undefined, undefined],
        [undefined, undefined],
      ]);
    });

    it("should serialize with nested fields in array of json", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
                  fields: {
                    nested: {
                      type: FieldTypes.TEXT,
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        test: [
          {
            nested: 123,
          },
          {
            nested: 456,
          },
        ],
      });

      expect(created.get("test")).toEqual([
        {
          nested: "123",
        },
        {
          nested: "456",
        },
      ]);

      expect(created.get("test.[]")).toEqual([
        {
          nested: "123",
        },
        {
          nested: "456",
        },
      ]);

      expect(created.get("test.nested")).toEqual(["123", "456"]);

      expect(created.get("test.[].nested")).toEqual(["123", "456"]);

      expect(created.get("test.nested.undefined")).toEqual([
        undefined,
        undefined,
      ]);
    });

    it("should serialize with complex schema fields", async () => {
      const model = mockModel({
        fields: {
          field1: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
                  fields: {
                    field2: {
                      type: FieldTypes.TEXT,
                    },
                    field3: {
                      type: FieldTypes.ARRAY,
                      options: {
                        items: {
                          type: FieldTypes.NESTED,
                          options: {
                            fields: {
                              field4: {
                                type: FieldTypes.TEXT,
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
      }).withAdapter(adapter);

      const created = await model.create({
        field1: [
          {
            field2: "test1",
            field3: [
              {
                field4: "test1.1",
              },
              {
                field4: "test1.2",
              },
            ],
          },
          {
            field2: "test2",
            field3: [
              {
                field4: "test2.1",
              },
              {
                field4: "test2.2",
              },
            ],
          },
        ],
      });

      expect(created.get("field1")).toEqual([
        {
          field2: "test1",
          field3: [
            {
              field4: "test1.1",
            },
            {
              field4: "test1.2",
            },
          ],
        },
        {
          field2: "test2",
          field3: [
            {
              field4: "test2.1",
            },
            {
              field4: "test2.2",
            },
          ],
        },
      ]);

      expect(created.get("field1.field2")).toEqual(["test1", "test2"]);
      expect(created.get("field1.[].field2")).toEqual(["test1", "test2"]);
      expect(created.get("field1.field3")).toEqual([
        [
          {
            field4: "test1.1",
          },
          {
            field4: "test1.2",
          },
        ],
        [
          {
            field4: "test2.1",
          },
          {
            field4: "test2.2",
          },
        ],
      ]);

      expect(created.get("field1.field3.field4")).toEqual([
        ["test1.1", "test1.2"],
        ["test2.1", "test2.2"],
      ]);

      expect(created.get("field1.[].field3.field4")).toEqual([
        ["test1.1", "test1.2"],
        ["test2.1", "test2.2"],
      ]);

      expect(created.get("field1.[].field3.[].field4")).toEqual([
        ["test1.1", "test1.2"],
        ["test2.1", "test2.2"],
      ]);

      expect(created.get("field1.[].field3.[].field4.undefined")).toEqual([
        [undefined, undefined],
        [undefined, undefined],
      ]);
    });

    it("should serialize array of relation to PromiseModelList", async () => {
      const model = mockModel({
        fields: {
          test: {
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

      const created = await model.create({
        test: ["63fdefb5debe7dae686d3575", "63fdefb5debe7dae686d3575"],
      });

      expect(created.get("test")).toBeInstanceOf(PromiseModelList);
    });

    it("should serialize array of relation to PromiseModelList even if json nested", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
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
                    rel: {
                      type: FieldTypes.RELATION,
                      options: {
                        ref: "accounts",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        arr: [
          {
            arrRel: ["63fdefb5debe7dae686d3575", "63fdefb5debe7dae686d3575"],
            rel: "63fdefb5debe7dae686d3575",
          },
          {
            arrRel: ["63fdefb5debe7dae686d3575", "63fdefb5debe7dae686d3575"],
            rel: "63fdefb5debe7dae686d3575",
          },
        ],
      });

      expect(created.get("arr")).toBeInstanceOf(Array);

      const rels = created.get("arr.rel");
      expect(rels).toBeInstanceOf(Array);
      expect(rels.every((r) => r instanceof PromiseModel)).toBeTruthy();

      const arrRels = created.get("arr.arrRel");
      expect(arrRels).toBeInstanceOf(Array);
      expect(arrRels.every((r) => r instanceof PromiseModelList)).toBeTruthy();
    });

    it("should serialize to undefined nested fields of null", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                test: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});

      expect(created.get("test.test")).toBe(undefined);
    });

    it("should serialize to undefined nested fields of null array", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
                  fields: {
                    test: {
                      type: FieldTypes.TEXT,
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({ test: [] });

      expect(created.get("test.test")).toEqual([]);
      expect(created.get("test.test2")).toEqual([]);
    });

    it("should serialize to undefined nested fields of nested unexisting field", async () => {
      const model = mockModel({
        fields: {},
      }).withAdapter(adapter);

      const created = await model.create({});

      expect(created.get("obj")).toEqual(undefined);
    });

    it("should not call useless serializer", async () => {
      const serializeText = jest.fn((value: any): any => value);

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: class extends Field<FieldTypes.TEXT> {
            serialize = serializeText;
          },
        },
      });

      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                field1: {
                  type: FieldTypes.TEXT,
                },
                field2: {
                  type: FieldTypes.TEXT,
                },
                field3: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        },
      }).withAdapter(_adapter);

      const created = await model.create({
        obj: {
          field1: "test1",
          field2: "test2",
          field3: "test3",
        },
      });

      expect(serializeText).toBeCalledTimes(0);

      created.get("obj.field1");

      expect(serializeText).toBeCalledTimes(1);
    });
  });

  describe("Model setter", () => {
    it("should set simple field value", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});

      expect(created.get("test")).toBe(undefined);
      created.set("test", "test");
      expect(created.get("test")).toEqual("test");
    });

    it("should serialize value", async () => {
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});

      created.set("test", 123);
      expect(created.getDoc().test).toEqual("123");
    });

    it("should set nested json field", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                nested: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({ obj: { nested: "toto" } });

      expect(created.get("obj.nested")).toBe("toto");
      created.set("obj.nested", "test");
      expect(created.get("obj.nested")).toEqual("test");
    });

    it("should set nested json field even if not exists", async () => {
      const model = mockModel({
        fields: {
          obj: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                nested: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});

      expect(created.get("obj.nested")).toBe(undefined);
      created.set("obj.nested", "test");
      expect(created.get("obj.nested")).toEqual("test");
    });

    it("should set value as array", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});

      expect(created.get("arr")).toEqual(undefined);
      created.set("arr", ["test1", "test2"]);
      expect(created.get("arr")).toEqual(["test1", "test2"]);
    });

    it("should set value in array", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({ arr: ["test1"] });

      expect(created.get("arr")).toEqual(["test1"]);
      created.set("arr.[]", "test2");
      expect(created.get("arr")).toEqual(["test2"]);
    });

    it("should set value in array of json", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
                  fields: {
                    nested: {
                      type: FieldTypes.TEXT,
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        arr: [
          {
            nested: "test1",
          },
          {
            nested: "test2",
          },
        ],
      });

      expect(created.get("arr.nested")).toEqual(["test1", "test2"]);
      created.set("arr.nested", "test3");
      expect(created.get("arr")).toEqual([
        {
          nested: "test3",
        },
        {
          nested: "test3",
        },
      ]);
      expect(created.get("arr.nested")).toEqual(["test3", "test3"]);
    });

    it("should return the setted value", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
                  fields: {
                    nested: {
                      type: FieldTypes.TEXT,
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({
        arr: [
          {
            nested: "test1",
          },
          {
            nested: "test2",
          },
        ],
      });

      expect(
        created.set("arr", [
          {
            nested: "test3a",
          },
          {
            nested: "test3a",
          },
        ])
      ).toEqual([
        {
          nested: "test3a",
        },
        {
          nested: "test3a",
        },
      ]);
      expect(
        created.set("arr.[]", {
          nested: "test3b",
        })
      ).toEqual([
        {
          nested: "test3b",
        },
        {
          nested: "test3b",
        },
      ]);
      expect(created.set("arr.nested", "test3")).toEqual(["test3", "test3"]);
    });

    it("should throw error if field doesn't exist", async () => {
      const model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.NESTED,
                options: {
                  fields: {
                    nested: {
                      type: FieldTypes.TEXT,
                    },
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({});

      expect(() => created.set("arr.undefined", "")).toThrow();
      expect(() => created.set("arr.[].undefined", "")).toThrow();
      expect(() => created.set("undefined.arr", "")).toThrow();
    });
  });

  describe("Model getter and setter should be consistant", () => {
    let model;

    beforeAll(() => {
      model = mockModel({
        fields: {
          text: {
            type: FieldTypes.TEXT,
          },
          obj: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                nested: {
                  type: FieldTypes.TEXT,
                },
              },
            },
          },
          relSingle: {
            type: FieldTypes.RELATION,
            options: {
              ref: "accounts",
            },
          },
          relArray: {
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
          arrOfText: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
              },
            },
          },
          complex: {
            type: FieldTypes.NESTED,
            options: {
              fields: {
                nestedArr: {
                  type: FieldTypes.ARRAY,
                  options: {
                    items: {
                      type: FieldTypes.NESTED,
                      options: {
                        fields: {
                          nested: {
                            type: FieldTypes.TEXT,
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
      }).withAdapter(adapter);
    });

    const _testWith = async (field, value, create?) => {
      create ??= { [field]: value };
      const created = await model.create(create);
      const v = created.get(field);
      const r = created.set(field, v);
      expect(r).toEqual(value);

      const v2 = created.get(field, SerializerFormat.DOCUMENT);
      expect(v2).toEqual(value);
    };

    it("with simple text field", async () => {
      await _testWith("text", "test");
    });

    it("with array of text field", async () => {
      await _testWith("arrOfText", ["test1", "test2"]);
    });

    it("with json field", async () => {
      await _testWith("obj", { nested: "test" });
    });

    it("with json field nested", async () => {
      await _testWith("obj.nested", "test", {
        obj: { nested: "test" },
      });
    });

    it("with relation field", async () => {
      await _testWith("relSingle", "507f191e810c19729de860ea");
    });

    it("with array of relation field", async () => {
      await _testWith("relArray", [
        "507f191e810c19729de860ea",
        "507f191e810c19729de860eb",
      ]);
    });

    it("with complex nested fields", async () => {
      await _testWith("complex", {
        nestedArr: [],
      });

      await _testWith("complex.nestedArr", [], {
        complex: {
          nestedArr: [],
        },
      });

      const created = await model.create({
        complex: {
          nestedArr: [
            {
              nested: "test1",
            },
            {
              nested: "test2",
            },
          ],
        },
      });

      expect(created.get("complex.nestedArr.nested")).toEqual([
        "test1",
        "test2",
      ]);

      const r = created.set("complex.nestedArr.nested", "test3");

      expect(r).toEqual(created.get("complex.nestedArr.nested"));
      expect(r).toEqual(["test3", "test3"]);
    });
  });

  describe("Model validation", () => {
    it("Model should have keyField validator if keyField is defined", async () => {
      const BaseModelWithKeyField = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      });
      BaseModelWithKeyField.keyField = "title";
      const TestModel = BaseModelWithKeyField.withAdapter(adapter);

      const keyFieldValidator = TestModel.validatorsArray.find(
        (v) => v.type === ValidatorTypes.KEY_FIELD
      );
      expect(keyFieldValidator).toBeDefined();
    });

    it("Model should have keyField validator if keyField is defined and should filter unique and required validators", async () => {
      const BaseModelWithKeyField = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        validators: [
          { type: ValidatorTypes.UNIQUE, options: { field: "title" } },
          { type: ValidatorTypes.REQUIRED, options: { field: "title" } },
        ],
      });
      BaseModelWithKeyField.keyField = "title";
      const TestModel = BaseModelWithKeyField.withAdapter(adapter);

      const validators = TestModel.validatorsArray;

      const keyFieldValidator = validators.find(
        (v) => v.type === ValidatorTypes.KEY_FIELD
      );
      const uniqueValidator = validators.find(
        (v) => v.type === ValidatorTypes.UNIQUE
      );
      const requiredValidator = validators.find(
        (v) => v.type === ValidatorTypes.REQUIRED
      );

      expect(keyFieldValidator).toBeDefined();
      expect(uniqueValidator).toBeUndefined();
      expect(requiredValidator).toBeUndefined();
    });

    it("Model should validate with validator from adapter", async () => {
      const testValidate = jest.fn(() => Promise.resolve(true));

      class TestValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
        validate = testValidate;
      }

      const _adapter = mockAdapter({
        validatorsMap: {
          [ValidatorTypes.SAMPLE]: TestValidatorSample,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);
      await TestModel.initialize();
      const i = new TestModel({});
      expect(testValidate).toHaveBeenCalledTimes(0);

      await TestModel.validate([i]);

      expect(testValidate).toHaveBeenCalledTimes(1);
    });

    it("Model should throw error with validator returning false", async () => {
      const testValidate = jest.fn(() => Promise.resolve(false));

      class TestValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
        validate = testValidate;
      }

      const _adapter = mockAdapter({
        validatorsMap: {
          [ValidatorTypes.SAMPLE]: TestValidatorSample,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);
      await TestModel.initialize();
      const i = new TestModel({});

      expect.assertions(1);

      try {
        await TestModel.validate([i]);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it("Model should validate with field from adapter", async () => {
      const testValidate = jest.fn(() => Promise.resolve(true));

      class TestFieldText extends Field<FieldTypes.TEXT> {
        validate = testValidate;
      }

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: TestFieldText,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);
      await TestModel.initialize();
      const i = new TestModel({});
      expect(testValidate).toHaveBeenCalledTimes(0);

      await TestModel.validate([i]);

      expect(testValidate).toHaveBeenCalledTimes(1);
    });

    it("Model should throw error with field validator returning false", async () => {
      const testValidate = jest.fn(() => Promise.resolve(false));

      class TestFieldText extends Field<FieldTypes.TEXT> {
        validate = testValidate;
      }

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: TestFieldText,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);
      await TestModel.initialize();
      const i = new TestModel({});

      expect.assertions(1);

      try {
        await TestModel.validate([i]);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it("Model should validate validators & fields on create", async () => {
      const testValidateField = jest.fn(() => Promise.resolve(true));
      const testValidateValidator = jest.fn(() => Promise.resolve(true));

      class TestFieldText extends Field<FieldTypes.TEXT> {
        validate = testValidateField;
      }

      class TestValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
        validate = testValidateValidator;
      }

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: TestFieldText,
        },
        validatorsMap: {
          [ValidatorTypes.SAMPLE]: TestValidatorSample,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);

      expect(testValidateField).toHaveBeenCalledTimes(0);
      expect(testValidateValidator).toHaveBeenCalledTimes(0);

      await TestModel.create({});

      expect(testValidateField).toHaveBeenCalledTimes(1);
      expect(testValidateValidator).toHaveBeenCalledTimes(1);
    });

    it("Model should validate validators & fields once by value on createMultiple", async () => {
      const testValidateField = jest.fn(() => Promise.resolve(true));
      const testValidateValidator = jest.fn(() => Promise.resolve(true));

      class TestFieldText extends Field<FieldTypes.TEXT> {
        validate = testValidateField;
      }

      class TestValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
        validate = testValidateValidator;
      }

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: TestFieldText,
        },
        validatorsMap: {
          [ValidatorTypes.SAMPLE]: TestValidatorSample,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);

      expect(testValidateField).toHaveBeenCalledTimes(0);
      expect(testValidateValidator).toHaveBeenCalledTimes(0);

      await TestModel.createMultiple([{}, {}, {}]);

      expect(testValidateField).toHaveBeenCalledTimes(1);
      expect(testValidateValidator).toHaveBeenCalledTimes(1);
    });

    it("Model should validate validators & fields once on createMultiple", async () => {
      const testValidateField = jest.fn(() => Promise.resolve(true));
      const testValidateValidator = jest.fn(() => Promise.resolve(true));

      class TestFieldText extends Field<FieldTypes.TEXT> {
        validate = testValidateField;
      }

      class TestValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
        validate = testValidateValidator;
      }

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: TestFieldText,
        },
        validatorsMap: {
          [ValidatorTypes.SAMPLE]: TestValidatorSample,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);

      expect(testValidateField).toHaveBeenCalledTimes(0);
      expect(testValidateValidator).toHaveBeenCalledTimes(0);

      await TestModel.createMultiple([
        {
          title: "title",
        },
        {
          title: "title",
        },
        {
          title: "title_bis",
        },
      ]);

      expect(testValidateField).toHaveBeenCalledTimes(1);
      expect(testValidateValidator).toHaveBeenCalledTimes(1);
    });
  });

  describe("Model hooks", () => {
    it("Should be able to hook", async () => {
      const TestModel = BaseModel.withAdapter(adapter);

      const beforeCreateFn = jest.fn();
      const afterCreateFn = jest.fn();

      TestModel.hook("before", "createOne", beforeCreateFn);
      TestModel.hook("after", "createOne", afterCreateFn);

      expect(beforeCreateFn).toHaveBeenCalledTimes(0);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);

      await TestModel.create({});

      expect(beforeCreateFn).toHaveBeenCalledTimes(1);
      expect(afterCreateFn).toHaveBeenCalledTimes(1);
    });

    it("Should be able to declare after hook inside the before hook", async () => {
      const TestModel = BaseModel.withAdapter(adapter);

      const afterCreateFn = jest.fn();
      const beforeCreateFn = jest.fn(() => {
        TestModel.hook("after", "createOne", afterCreateFn);
      });

      TestModel.hook("before", "createOne", beforeCreateFn);

      expect(beforeCreateFn).toHaveBeenCalledTimes(0);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);

      await TestModel.create({});

      expect(beforeCreateFn).toHaveBeenCalledTimes(1);
      expect(afterCreateFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Model utils", () => {
    it("Should be able to stringify and then hydrate from string", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const i = await TestModel.get({});
      const str = i.toString();
      const hydrated = TestModel.fromString(str);

      expect(hydrated).toBeInstanceOf(TestModel);
      expect(hydrated._id).toEqual(i._id);
    });

    it("Should be cloneable", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const i = await TestModel.create({});
      const clone = i.clone();
      expect(clone).toBeInstanceOf(TestModel);
      expect(clone._id).toEqual(i._id);
    });

    it("getRecursiveValidatorsFromModel should returns keyField validator if model has a keyField", () => {
      const validators = getRecursiveValidatorsFromModel(DataModel);
      const keyFieldValidator = validators.find(
        (v) => v.type === ValidatorTypes.KEY_FIELD
      );
      expect(keyFieldValidator).toBeDefined();
    });
  });

  describe("Model baseClass", () => {
    it("should keep baseClass when withAdapter", () => {
      let model = BaseModel;

      expect(model.getBaseClass()).toBe(BaseModel);

      Array(5)
        .fill(null)
        .forEach(() => {
          const prevModel = model;
          model = model.withAdapter(adapter);
          expect(model).not.toBe(prevModel);
          expect(model.getBaseClass()).toBe(BaseModel);
        });
    });
  });

  describe("Model unicity", () => {
    it("should get same model from slug with same adapter", () => {
      const model = Model.getFromSlug("accounts", adapter);
      const modelBis = Model.getFromSlug("accounts", adapter);

      expect(model).toBe(modelBis);
    });

    it("should get different models from slug with different adapter", () => {
      const model = Model.getFromSlug("accounts");
      const modelBis = Model.getFromSlug("accounts", adapter);

      expect(model).not.toBe(modelBis);
    });

    it("should returns same model from slug and then adapter", () => {
      BaseModel = mockModel();

      const model = Model.getFromSlug(BaseModel.slug, adapter);
      const modelBis = getAdaptedModel(BaseModel, adapter);

      expect(model).toBe(modelBis);
    });

    it("should returns same model from adapter and then slug", () => {
      BaseModel = mockModel();

      const model = getAdaptedModel(BaseModel, adapter);
      const modelBis = Model.getFromSlug(BaseModel.slug, adapter);

      expect(model).toBe(modelBis);
    });

    it("should returns first cached model", () => {
      const baseAccountFromSlug = Model.getFromSlug("accounts", adapter);
      const baseAccountFromModel = getAdaptedModel(Account, adapter);

      expect(baseAccountFromSlug).toBe(baseAccountFromModel);

      const extendedAccount = class extends Account {};

      const extendedAccountFromModel = getAdaptedModel(
        extendedAccount,
        adapter
      );

      expect(extendedAccountFromModel.getBaseClass()).not.toBe(extendedAccount);
      expect(extendedAccountFromModel.getBaseClass()).toBe(Account);
    });

    it("should be able to override model", () => {
      const baseAccountFromSlug = Model.getFromSlug("accounts", adapter);
      const baseAccountFromModel = getAdaptedModel(Account, adapter);

      expect(baseAccountFromSlug).toBe(baseAccountFromModel);

      const extendedAccount = class extends Account {};

      const extendedAccountFromModel = getAdaptedModel(
        extendedAccount,
        adapter,
        true
      );

      expect(extendedAccountFromModel.getBaseClass()).toBe(extendedAccount);
    });

    it("Should be able to get adapted model from slug once it has been adapted from model", () => {
      const baseAccountFromSlug = Model.getFromSlug("accounts", adapter);
      const baseAccountFromModel = getAdaptedModel(Account, adapter);

      expect(baseAccountFromSlug).toBe(baseAccountFromModel);

      const extendedAccount = class ExtendedAccount extends Account {};

      const extendedAccountFromModel = getAdaptedModel(
        extendedAccount,
        adapter,
        true
      );

      expect(extendedAccountFromModel.getBaseClass()).toBe(extendedAccount);

      const extendedAccountFromSlug = Model.getFromSlug("accounts", adapter);

      expect(extendedAccountFromSlug.getBaseClass()).toBe(extendedAccount);
    });

    it("Should be able to get adapted model from slug once it has been adapted from model on data", () => {
      const slug = "example";

      const ExampleModel = class ExampleModel extends Data {
        static slug = slug;
      };

      const baseModelFromSlug = Model.getFromSlug(slug, adapter);
      const baseModelFromModel = getAdaptedModel(ExampleModel, adapter);

      expect(baseModelFromSlug).toBe(baseModelFromModel);
      expect(baseModelFromModel.getBaseClass()).not.toBe(ExampleModel);

      const extendedModelFromModel = getAdaptedModel(
        ExampleModel,
        adapter,
        true
      );

      expect(extendedModelFromModel.getBaseClass()).toBe(ExampleModel);

      const extendedModelFromSlug = Model.getFromSlug(slug, adapter);

      expect(extendedModelFromSlug.getBaseClass()).toBe(ExampleModel);
      expect(extendedModelFromSlug).toBe(extendedModelFromModel);
    });
  });

  describe("Model page", () => {
    const DocModel = mockModel({
      single: true,
      fields: {
        test: {
          type: FieldTypes.TEXT,
          options: {
            default: "defaultValue",
          },
        },
        nested: {
          type: FieldTypes.NESTED,
          options: {
            fields: {
              subtitle: {
                type: FieldTypes.TEXT,
              },
            },
          },
        },
      },
    }).withAdapter(adapter);

    it("Should be able to get data from model", async () => {
      const getPromise = DocModel.get();
      expect(getPromise).toBeInstanceOf(PromiseModel);

      const i = await getPromise;
      expect(i).toBeInstanceOf(DocModel);

      expect(i.test).toEqual("defaultValue");
    });

    it("Should not be able to create an instance", async () => {
      const creatingPromise = DocModel.create({});

      await expect(creatingPromise).rejects.toThrow(CoreError);
      await expect(creatingPromise).rejects.toHaveProperty(
        "code",
        ErrorCodes.INVALID_OPERATION
      );
    });
  });

  describe("Model execution", () => {
    it("should retry execution when throwing retryToken in before hook", async () => {
      const TestModel = mockModel().withAdapter(mockAdapter());

      const beforeCreateFn1 = jest.fn();
      const beforeCreateFn2 = jest.fn(({ ctx }) => {
        if (ctx.retryTimes < 2) {
          throw ctx.retryToken;
        }
      });
      const afterCreateFn = jest.fn();

      TestModel.hook("before", "createOne", beforeCreateFn1);
      TestModel.hook("before", "createOne", beforeCreateFn2);
      TestModel.hook("after", "createOne", afterCreateFn);

      expect(beforeCreateFn1).toHaveBeenCalledTimes(0);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);

      await TestModel.create({});

      expect(beforeCreateFn1).toHaveBeenCalledTimes(3);
      expect(beforeCreateFn2).toHaveBeenCalledTimes(3);
      expect(afterCreateFn).toHaveBeenCalledTimes(1);
    });

    it("should retry execution when throwing retryToken in after hook", async () => {
      const TestModel = mockModel().withAdapter(mockAdapter());

      const beforeCreateFn = jest.fn();
      const afterCreateFn1 = jest.fn(({ ctx }) => {
        if (ctx.retryTimes < 2) {
          throw ctx.retryToken;
        }
      });
      const afterCreateFn2 = jest.fn();

      TestModel.hook("before", "createOne", beforeCreateFn);
      TestModel.hook("after", "createOne", afterCreateFn1);
      TestModel.hook("after", "createOne", afterCreateFn2);

      expect(beforeCreateFn).toHaveBeenCalledTimes(0);
      expect(afterCreateFn1).toHaveBeenCalledTimes(0);
      expect(afterCreateFn2).toHaveBeenCalledTimes(0);

      await TestModel.create({});

      expect(beforeCreateFn).toHaveBeenCalledTimes(3);
      expect(afterCreateFn1).toHaveBeenCalledTimes(3);
      expect(afterCreateFn2).toHaveBeenCalledTimes(3);
    });

    it("should immediately stop execution when throwing abortToken in before hook", async () => {
      const TestModel = mockModel().withAdapter(adapter);

      const beforeCreateFn1 = jest.fn();
      const beforeCreateFn2 = jest.fn(({ ctx }) => {
        throw ctx.abortToken;
      });
      const afterCreateFn = jest.fn();

      TestModel.hook("before", "createOne", beforeCreateFn1);
      TestModel.hook("before", "createOne", beforeCreateFn2);
      TestModel.hook("after", "createOne", afterCreateFn);

      expect(beforeCreateFn1).toHaveBeenCalledTimes(0);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);

      await expect(TestModel.create({})).rejects.toThrow("aborted");

      expect(beforeCreateFn1).toHaveBeenCalledTimes(1);
      expect(beforeCreateFn2).toHaveBeenCalledTimes(1);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);
    });

    it("should immediately stop execution when throwing abortToken in first before hook", async () => {
      const TestModel = mockModel().withAdapter(adapter);

      const beforeCreateFn1 = jest.fn(({ ctx }) => {
        throw ctx.abortToken;
      });
      const beforeCreateFn2 = jest.fn();
      const afterCreateFn = jest.fn();

      TestModel.hook("before", "createOne", beforeCreateFn1);
      TestModel.hook("before", "createOne", beforeCreateFn2);
      TestModel.hook("after", "createOne", afterCreateFn);

      expect(beforeCreateFn1).toHaveBeenCalledTimes(0);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);

      await expect(TestModel.create({})).rejects.toThrow("aborted");

      expect(beforeCreateFn1).toHaveBeenCalledTimes(1);
      expect(beforeCreateFn2).toHaveBeenCalledTimes(0);
      expect(afterCreateFn).toHaveBeenCalledTimes(0);
    });

    it("should immediately stop execution when throwing abortToken in first after hook", async () => {
      const TestModel = mockModel().withAdapter(mockAdapter());

      const beforeCreateFn = jest.fn();
      const afterCreateFn1 = jest.fn(({ ctx }) => {
        throw ctx.abortToken;
      });
      const afterCreateFn2 = jest.fn();

      TestModel.hook("before", "createOne", beforeCreateFn);
      TestModel.hook("after", "createOne", afterCreateFn1);
      TestModel.hook("after", "createOne", afterCreateFn2);

      expect(beforeCreateFn).toHaveBeenCalledTimes(0);
      expect(afterCreateFn1).toHaveBeenCalledTimes(0);
      expect(afterCreateFn2).toHaveBeenCalledTimes(0);

      await expect(TestModel.create({})).rejects.toThrow("aborted");

      expect(beforeCreateFn).toHaveBeenCalledTimes(1);
      expect(afterCreateFn1).toHaveBeenCalledTimes(1);
      expect(afterCreateFn2).toHaveBeenCalledTimes(0);
    });
  });

  describe("Model allowMultipleOperations", () => {
    it("should throw error when trying to updateMultiple on models with allowMultipleOperations = false", async () => {
      const TestModel = mockModel({
        allowMultipleOperations: false,
      }).withAdapter(mockAdapter());

      await expect(TestModel.update({}, {})).rejects.toThrow(
        "Cannot run updateMultiple operation"
      );
    });
  });

  describe("Model reload", () => {
    it("should load fields from datamodel", async () => {
      const dm = await DataModel.withAdapter(adapter).create({
        slug: generateRandomString(),
        fields: {
          field1: {
            type: FieldTypes.TEXT,
          },
        },
      });

      const TestModel = Data.getFromDatamodel(dm);

      expect(TestModel.slug).toEqual(dm.slug);

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).toContain("field1");

      dm.getDoc().fields = {
        field2: {
          type: FieldTypes.TEXT,
        },
      };

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).not.toContain("field1");
      expect(TestModel.fieldsKeys).toContain("field2");
    });

    it("should load fields from single datamodel", async () => {
      const dm = await DataModel.withAdapter(adapter).create({
        slug: generateRandomString(),
        single: true,
        fields: {
          field1: {
            type: FieldTypes.TEXT,
          },
        },
      });

      const TestModel = Data.getFromDatamodel(dm);

      expect(TestModel.single).toBeTruthy();

      expect(TestModel.slug).toEqual(dm.slug);

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).toContain("field1");

      dm.getDoc().fields = {
        field2: {
          type: FieldTypes.TEXT,
        },
      };

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).not.toContain("field1");
      expect(TestModel.fieldsKeys).toContain("field2");
    });

    it("should support for keyField change", async () => {
      const dm = await DataModel.withAdapter(adapter).create({
        slug: generateRandomString(),
        keyField: "field1",
        fields: {
          field1: {
            type: FieldTypes.TEXT,
          },
        },
        validators: [
          {
            type: "required",
            options: { field: "field1" },
          },
        ],
      });

      const TestModel = Data.getFromDatamodel(dm);

      await TestModel.reloadModel();

      expect(TestModel.keyField).toEqual("field1");

      expect(TestModel.fieldsKeys).toContain("field1");

      dm.getDoc().keyField = "field2";
      dm.getDoc().fields = {
        field2: {
          type: FieldTypes.TEXT,
        },
      };

      await TestModel.reloadModel();

      expect(TestModel.keyField).toEqual("field2");

      expect(TestModel.fieldsKeys).not.toContain("field1");

      expect(TestModel.fieldsKeys).toContain("field2");
    });
  });

  it("should be able to updateMultiple on models with allowMultipleOperations = false and query as string (=updateOne)", async () => {
    const TestModel = mockModel({
      allowMultipleOperations: false,
    }).withAdapter(mockAdapter());

    await expect(TestModel.update("", {})).resolves.toBeDefined();
  });

  it("should throw error when trying to deleteMultiple on models with allowMultipleOperations = false", async () => {
    const TestModel = mockModel({
      allowMultipleOperations: false,
    }).withAdapter(mockAdapter());

    await expect(TestModel.delete({}, {})).rejects.toThrow(
      "Cannot run deleteMultiple operation"
    );
  });

  it("should be able to deleteMultiple on models with allowMultipleOperations = false and query as string (=deleteOne)", async () => {
    const TestModel = mockModel({
      allowMultipleOperations: false,
    }).withAdapter(mockAdapter());

    await expect(TestModel.delete("", {})).resolves.toBeDefined();
  });

  it("should be able to updateMultiple on models with allowMultipleOperations = true (default)", async () => {
    const TestModel = mockModel().withAdapter(mockAdapter());

    await expect(TestModel.update({}, {})).resolves.toBeDefined();
  });

  it("should be able to deleteMultiple on models with allowMultipleOperations = true (default)", async () => {
    const TestModel = mockModel().withAdapter(mockAdapter());

    await expect(TestModel.update({}, {})).resolves.toBeDefined();
  });

  it("should return right model constructor", async () => {
    const TestModel = mockModel().withAdapter(mockAdapter());

    const i = await TestModel.create({});

    expect(i.model).toBe(TestModel);
  });

  it("should return right model constructor when model is cloned", async () => {
    const TestModelCloned = mockModel().withAdapter(mockAdapter()).clone();

    const i = await TestModelCloned.create({});

    expect(i.model).toBe(TestModelCloned);
  });
});
