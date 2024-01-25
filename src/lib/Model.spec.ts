import { mockAdapter, mockModel, generateRandomString } from "@/lib/test-utils";
import Field from "@/lib/Field";
import Model from "@/lib/Model";
import FieldTypes from "@/enums/field-types";
import Validator from "@/lib/Validator";
import ValidatorTypes from "@/enums/validator-types";
import Account from "@/models/Account";
import CoreError from "@/lib/CoreError";
import DataModel from "@/models/DataModel";
import ErrorCodes from "@/enums/error-codes";
import Media from "@/models/Media";
import { ModelDefinition, ModelInstance } from "@/types";
import PromiseModelList from "@/lib/PromiseModelList";
import SerializerFormat from "@/enums/serializer-format";
import Data from "@/lib/Data";
import PromiseModel from "@/lib/PromiseModel";
import { faker } from "@faker-js/faker";
import { ObjectId } from "bson";

describe("Test Model", () => {
  const BaseModel = mockModel({
    fields: {
      title: {
        type: FieldTypes.TEXT,
      },
    },
    validators: [
      {
        type: ValidatorTypes.SAMPLE,
        options: {
          field: "title",
        },
      },
    ],
  });

  describe("Model crud", () => {
    it("should be able to Model.create", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const created = await TestModel.create({});
      expect(created).toBeInstanceOf(TestModel);
    });

    it("should be able to Model.createMultiple", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const created = await TestModel.createMultiple([{}, {}, {}]);
      expect(created).toBeInstanceOf(Array);
      created.forEach(i => {
        expect(i).toBeInstanceOf(TestModel);
      });
    });

    it("should be able to Model.count", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const count = await TestModel.count();
      expect(typeof count).toBe("number");
    });

    it("should be able to Model.count", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const count = await TestModel.count();
      expect(typeof count).toBe("number");
    });
  });

  describe("Model initialization", () => {
    it("should be able to manually define fields", () => {
      const adapter = mockAdapter();
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {},
          },
        },
      }).extend({ adapterClass: adapter });

      expect(model.fieldsKeys).toContain("title");
    });

    it("Model should load fields from adapter", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const created = await TestModel.create({});
      expect(created.model().fieldsMap.get("title")).toBeInstanceOf(Field);
    });

    it("Model should load validators from adapter", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const created = await TestModel.create({});
      expect(created.model().validatorsArray).toBeInstanceOf(Array);
      expect(created.model().validatorsArray.length).toEqual(1);
    });

    it("should be able to getClass with adapter", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const AccountModel = TestModel.getClass("accounts");
      expect(AccountModel.getAdapter(false)).toBeInstanceOf(adapter);
    });

    it("should be able to getClass without adapter", async () => {
      const AccountModel = Model.getClass("accounts");
      expect(AccountModel.getAdapter(false)).toBeUndefined();
    });

    it("Model initialization should execute hooks", async () => {
      const adapter = mockAdapter();
      const _model = mockModel();
      const model = _model.extend({ adapterClass: adapter });

      const hookBefore = jest.fn();
      const hookAfter = jest.fn();
      model.hook("before", "initialize", hookBefore);
      model.hook("after", "initialize", hookAfter);

      await model.initialize();

      expect(hookBefore).toBeCalledTimes(1);
      expect(hookAfter).toBeCalledTimes(1);
    });

    it("Model initialization should execute hooks only at first initialization", async () => {
      const adapter = mockAdapter();
      const _model = mockModel();
      const model = _model.extend({ adapterClass: adapter });

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
      const adapter = mockAdapter();
      const _model = mockModel();
      const model = _model.extend({ adapterClass: adapter });

      const hookBefore = jest.fn(() => {
        throw new Error("test");
      });
      model.hook("before", "initialize", hookBefore);

      await expect(model.initialize()).rejects.toThrowError("test");
    });

    it("Model initialization should use initOptions", async () => {
      const adapter = mockAdapter();
      const base = class extends Model {
        static slug = generateRandomString();
        static extensible: boolean = true;
      };

      const model = base.extend({ adapterClass: adapter });

      const initFn = jest.spyOn(model, "reloadModel");

      expect(initFn).toBeCalledTimes(0);

      await model.initialize();

      expect(initFn).toBeCalledTimes(1);

      await model.initialize();

      expect(initFn).toBeCalledTimes(1);

      const lastCallArgs = initFn.mock.calls[0][0];

      expect(lastCallArgs.datamodel).toBeUndefined();
      expect(lastCallArgs.ctx).toBeUndefined();

      const model2 = model.extend({
        initOptions: {
          datamodel: new DataModel({
            definition: {
              keyField: "test",
            },
          }),
        },
        adapterClass: mockAdapter(),
      });

      const initFn2 = jest.spyOn(model2, "reloadModel");

      expect(initFn2).toBeCalledTimes(0);

      await model2.initialize();

      expect(initFn2).toBeCalledTimes(1);

      const lastCall2Args = initFn2.mock.calls[0][0];

      expect(lastCall2Args?.datamodel).toBeInstanceOf(DataModel);

      expect(model.getKeyField()).toEqual("_id");
      expect(model2.getKeyField()).toEqual("test");
    });

    // it("Model clone should override fields", async () => {
    //   const adapter = mockAdapter();
    //   const model = class extends Data {
    //     static slug = "test";
    //     static definition: ModelDefinition = {
    //       fields: {
    //         test: {
    //           type: FieldTypes.TEXT,
    //         },
    //       },
    //     };
    //   }.extend({ adapterClass: adapter });

    //   const fieldTest = model.fieldsMap.get("test");
    //   expect(fieldTest).toBeInstanceOf(Field);
    //   expect(fieldTest.type).toEqual(FieldTypes.TEXT);

    //   const dm = await DataModel.extend({ adapterClass: adapter }).create({
    //     slug: "test",
    //     definition: {
    //       fields: {
    //         test: {
    //           type: FieldTypes.NUMBER,
    //         },
    //         test2: {
    //           type: FieldTypes.TEXT,
    //         },
    //       },
    //     },
    //   });

    //   const model2 = model.extend({
    //     initOptions: {
    //       datamodel: dm,
    //     },
    //     adapterClass: mockAdapter(),
    //   });

    //   await model2.initialize();

    //   expect(model2.fieldsMap?.get("test2")).toBeInstanceOf(Field);
    //   const fieldTest2 = model2.fieldsMap.get("test");
    //   expect(fieldTest2).toBeInstanceOf(Field);
    //   expect(fieldTest2.type).toEqual(FieldTypes.NUMBER);
    // });

    it("Model.keyField is not overriden by datamodel if declared in inherited class", async () => {
      const adapter = mockAdapter();
      const slug1 = generateRandomString();
      const slug2 = generateRandomString();
      const model = class extends Data {
        static slug = slug1;
        static definition: ModelDefinition = {
          keyField: "test",
        };
      }.extend({ adapterClass: adapter });

      await DataModel.extend({ adapterClass: adapter }).create({
        slug: slug2,
        definition: {
          keyField: "test2",
          fields: {
            test2: {
              type: FieldTypes.TEXT,
            },
          },
        },
      });

      const model2 = class extends model {
        static slug = slug2;
      }.extend({ adapterClass: adapter });

      await model2.initialize();

      expect(model2.getKeyField()).toEqual("test");
    });

    it("Medias keyField is not overriden by datamodel", async () => {
      const adapter = mockAdapter();
      await DataModel.extend({ adapterClass: adapter }).create({
        slug: Media.slug,
        definition: {
          keyField: "test2",
          fields: {
            test2: {
              type: FieldTypes.TEXT,
            },
          },
        },
      });

      const model = Media.extend({ adapterClass: adapter });
      await model.initialize();

      expect(model.fieldsMap.get("test2")).toBeInstanceOf(Field);
      expect(model.getKeyField()).toEqual("name");
    });
  });

  describe("Model getter", () => {
    it("Model should return field default value if undefined", async () => {
      const adapter = mockAdapter();
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
            options: {
              default: "default",
            },
          },
        },
      }).extend({ adapterClass: adapter });

      const created = await model.create({});
      expect(created.get("test")).toBe("default");
    });

    it("should serialize with field from adapter", async () => {
      const adapter = mockAdapter();
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
          },
        },
      }).extend({ adapterClass: adapter });

      const created = await model.create({
        test: 123 as unknown as string,
      });

      expect(created.get("test")).toBe("123");
    });

    it("should serialize with nested fields in json", async () => {
      const adapter = mockAdapter();
      const _model = mockModel({
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
      });
      const model = _model.extend({ adapterClass: adapter });

      const created = await model.create<{
        fields: {
          test: {
            type: FieldTypes.NESTED;
            options: {
              fields: {
                nested: {
                  type: FieldTypes.TEXT;
                };
              };
            };
          };
        };
      }>({
        test: {
          nested: 123 as unknown as string,
        },
      });

      expect(created.get("test.nested")).toBe("123");
      expect(created.test.nested).toBe("123");
    });

    it("should serialize with nested fields in array", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({
        test: [123 as unknown as string],
      });

      expect(created.get("test")).toEqual(["123"]);
      expect(created.get("test.[]")).toEqual(["123"]);
      expect(created.get("test.toto")).toEqual([undefined]);
      expect(created.test).toBeInstanceOf(Array);
      expect(created.test.length).toEqual(1);
      expect(created.test[0]).toEqual("123");
    });

    it("should serialize with nested fields in array of array", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({
        test: [[123 as unknown as string], [456 as unknown as string]],
      });

      expect(created.get("test")).toEqual([["123"], ["456"]]);
      expect(created.get("test.[]")).toEqual([["123"], ["456"]]);
    });

    it("should serialize with nested json field in array of array", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({
        test: [
          [
            {
              nested: 123 as unknown as string,
            },
            {
              nested: 456 as unknown as string,
            },
          ],
          [
            {
              nested: 123 as unknown as string,
            },
            {
              nested: 456 as unknown as string,
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
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({
        test: [
          {
            nested: 123 as unknown as string,
          },
          {
            nested: 456 as unknown as string,
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

      expect(created.get("test.nested.undefined")).toEqual([undefined, undefined]);
    });

    it("should serialize with complex schema fields", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

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
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({
        test: ["63fdefb5debe7dae686d3575", "63fdefb5debe7dae686d3575"],
      });

      expect(created.get("test")).toBeInstanceOf(PromiseModelList);
    });

    it("should serialize array of relation to PromiseModelList even if json nested", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

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
      expect(rels.every(r => r instanceof PromiseModel)).toBeTruthy();

      const arrRels = created.get("arr.arrRel");
      expect(arrRels).toBeInstanceOf(Array);
      expect(arrRels.every(r => r instanceof PromiseModelList)).toBeTruthy();
    });

    it("should serialize to undefined nested fields of null", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({});

      expect(created.get("test.test")).toBe(undefined);
    });

    it("should serialize to undefined nested fields of null array", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({ test: [] });

      expect(created.get("test.test")).toEqual([]);
      expect(created.get("test.test2")).toEqual([]);
    });

    it("should serialize to undefined nested fields of nested unexisting field", async () => {
      const adapter = mockAdapter();
      const model = mockModel({
        fields: {},
      }).extend({ adapterClass: adapter });

      const created = await model.create({});

      expect(created.get("obj")).toEqual(undefined);
    });

    it("should not call useless serializer", async () => {
      const serializeText = jest.fn(value => value);

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
      }).extend({ adapterClass: _adapter });

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
      const adapter = mockAdapter();
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
          },
        },
      }).extend({ adapterClass: adapter });

      const created = await model.create({});

      expect(created.get("test")).toBe(undefined);
      created.set("test", "test");
      expect(created.get("test")).toEqual("test");
    });

    it("should serialize value", async () => {
      const adapter = mockAdapter();
      const model = mockModel({
        fields: {
          test: {
            type: FieldTypes.TEXT,
          },
        },
      }).extend({ adapterClass: adapter });

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
      }).extend({ adapterClass: mockAdapter() });

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
      }).extend({ adapterClass: mockAdapter() });

      const created = await model.create({});

      expect(created.get("obj.nested")).toBe(undefined);
      created.set("obj.nested", "test");
      expect(created.get("obj.nested")).toEqual("test");
    });

    it("should set value as array", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({});

      expect(created.get("arr")).toEqual(undefined);
      created.set("arr", ["test1", "test2"]);
      expect(created.get("arr")).toEqual(["test1", "test2"]);
    });

    it("should set value in array", async () => {
      const adapter = mockAdapter();
      const model = class extends Model {
        static slug = generateRandomString();
        static definition = {
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
        };
      }.extend({ adapterClass: adapter });

      const created = await model.create({ arr: ["test1"] });

      expect(created.get("arr")).toEqual(["test1"]);
      created.set("arr.[]", "test2");
      expect(created.get("arr")).toEqual(["test2"]);
    });

    it("should set value in array of json", async () => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

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
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

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
        ]),
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
        }),
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
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });

      const created = await model.create({});

      expect(() => created.set("arr.undefined", "")).toThrow();
      expect(() => created.set("arr.[].undefined", "")).toThrow();
      expect(() => created.set("undefined.arr", "")).toThrow();
    });
  });

  describe("Model getter and setter should be consistant", () => {
    let model;

    beforeAll(() => {
      const adapter = mockAdapter();
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
      }).extend({ adapterClass: adapter });
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
      await _testWith("relArray", ["507f191e810c19729de860ea", "507f191e810c19729de860eb"]);
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

      expect(created.get("complex.nestedArr.nested")).toEqual(["test1", "test2"]);

      const r = created.set("complex.nestedArr.nested", "test3");

      expect(r).toEqual(created.get("complex.nestedArr.nested"));
      expect(r).toEqual(["test3", "test3"]);
    });
  });

  describe("Model validation", () => {
    it("Model should have keyField validator if keyField is defined", async () => {
      const adapter = mockAdapter();
      const BaseModelWithKeyField = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      });
      Object.assign(BaseModelWithKeyField.definition, { keyField: "title" });
      const TestModel = BaseModelWithKeyField.extend({ adapterClass: adapter });

      const keyFieldValidator = TestModel.validatorsArray.find(
        v => v.type === ValidatorTypes.KEY_FIELD,
      );
      expect(keyFieldValidator).toBeDefined();
    });

    it("Model should have keyField validator if keyField is defined and should filter unique and required validators", async () => {
      const adapter = mockAdapter();
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
      Object.assign(BaseModelWithKeyField.definition, { keyField: "title" });
      const TestModel = BaseModelWithKeyField.extend({ adapterClass: adapter });

      const validators = TestModel.validatorsArray;

      const keyFieldValidator = validators.find(v => v.type === ValidatorTypes.KEY_FIELD);
      const uniqueValidator = validators.find(v => v.type === ValidatorTypes.UNIQUE);
      const requiredValidator = validators.find(v => v.type === ValidatorTypes.REQUIRED);

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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });
      await TestModel.initialize();
      const i = TestModel.fromDoc({});
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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });
      await TestModel.initialize();
      const i = TestModel.fromDoc({});

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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });
      await TestModel.initialize();
      const i = TestModel.fromDoc({});
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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });
      await TestModel.initialize();
      const i = TestModel.fromDoc({});

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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });

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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });

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

      const TestModel = BaseModel.extend({ adapterClass: _adapter });

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
    it("should be able to hook", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });

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

    it("should be able to declare after hook inside the before hook", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });

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
    it("should be cloneable", async () => {
      const adapter = mockAdapter();
      const TestModel = BaseModel.extend({ adapterClass: adapter });
      const i = await TestModel.create({});
      const clone = i.clone();
      expect(clone).toBeInstanceOf(TestModel);
      expect(clone._id).toEqual(i._id);
    });
  });

  describe("Model baseClass", () => {
    it("should keep baseClass with extend", () => {
      let model = BaseModel;

      expect(model.getBaseClass()).toBe(BaseModel);

      Array(5)
        .fill(null)
        .forEach(() => {
          const prevModel = model;
          model = model.extend({ adapterClass: mockAdapter() });
          expect(model).not.toBe(prevModel);
          expect(model.getBaseClass()).toBe(BaseModel);
        });
    });

    it("should always return the base class", () => {
      expect(BaseModel.extend({ adapterClass: mockAdapter() }).getBaseClass()).toBe(BaseModel);

      class CustomAccount extends Account {}

      expect(CustomAccount.getBaseClass()).toBe(CustomAccount);
      expect(CustomAccount.extend({ adapterClass: mockAdapter() }).getBaseClass()).toBe(
        CustomAccount,
      );
    });
  });

  describe("Model unicity", () => {
    it("should get same model from slug with same adapter", () => {
      const adapter = mockAdapter();
      const model = Model.getClass("accounts", adapter);
      const modelBis = Model.getClass("accounts", adapter);

      expect(model).toBe(modelBis);
    });

    it("should get different models from slug with different adapter", () => {
      const adapter = mockAdapter();
      const model = Model.getClass("accounts");
      const modelBis = Model.getClass("accounts", adapter);

      expect(model).not.toBe(modelBis);
    });
  });

  describe("Model page", () => {
    const adapter = mockAdapter();
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
    }).extend({ adapterClass: adapter });

    it("should be able to get data from model", async () => {
      const getPromise = DocModel.get();
      expect(getPromise).toBeInstanceOf(PromiseModel);

      const i = await getPromise;
      expect(i).toBeInstanceOf(DocModel);

      expect(i.test).toEqual("defaultValue");
    });

    it("should not be able to create an instance", async () => {
      const creatingPromise = DocModel.create({});

      await expect(creatingPromise).rejects.toThrow(CoreError);
      await expect(creatingPromise).rejects.toHaveProperty("code", ErrorCodes.INVALID_OPERATION);
    });
  });

  describe("Model execution", () => {
    it("should immediately stop execution when throwing abortToken in before hook", async () => {
      const adapter = mockAdapter();
      const TestModel = mockModel().extend({ adapterClass: adapter });

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
      const adapter = mockAdapter();
      const TestModel = mockModel().extend({ adapterClass: adapter });

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
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

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
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      TestModel.allowMultipleOperations = false;

      await expect(TestModel.update({}, {})).rejects.toThrow("Cannot run updateMultiple operation");
    });

    it("should be able to updateMultiple on models with allowMultipleOperations = false and query as string (=updateOne)", async () => {
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      TestModel.allowMultipleOperations = false;

      await expect(TestModel.update("", {})).resolves.toBeDefined();
    });

    it("should throw error when trying to deleteMultiple on models with allowMultipleOperations = false", async () => {
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      TestModel.allowMultipleOperations = false;

      await expect(TestModel.delete({})).rejects.toThrow("Cannot run deleteMultiple operation");
    });

    it("should be able to deleteMultiple on models with allowMultipleOperations = false and query as string (=deleteOne)", async () => {
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      TestModel.allowMultipleOperations = false;

      await expect(TestModel.delete("")).resolves.toBeDefined();
    });

    it("should be able to updateMultiple on models with allowMultipleOperations = true (default)", async () => {
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      await expect(TestModel.update({}, {})).resolves.toBeDefined();
    });

    it("should be able to deleteMultiple on models with allowMultipleOperations = true (default)", async () => {
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      await expect(TestModel.update({}, {})).resolves.toBeDefined();
    });
  });

  describe("Model reload", () => {
    it("should load fields from datamodel", async () => {
      const adapter = mockAdapter();
      const dm = await DataModel.extend({ adapterClass: adapter }).create({
        slug: generateRandomString(),
        definition: {
          fields: {
            field1: {
              type: FieldTypes.TEXT,
            },
          },
        },
      });

      const TestModel = Model.getClass(dm);

      expect(TestModel.slug).toEqual(dm.slug);

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).toContain("field1");

      Object.assign(dm.definition, {
        fields: {
          field2: {
            type: FieldTypes.TEXT,
          },
        },
      });

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).not.toContain("field1");
      expect(TestModel.fieldsKeys).toContain("field2");
    });

    it("should load fields from single datamodel", async () => {
      const adapter = mockAdapter();
      const dm = await DataModel.extend({ adapterClass: adapter }).create({
        slug: generateRandomString(),
        definition: {
          single: true,
          fields: {
            field1: {
              type: FieldTypes.TEXT,
            },
          },
        },
      });

      const TestModel = Model.getClass(dm);

      await TestModel.initialize();

      expect(TestModel.isSingle()).toBeTruthy();

      expect(TestModel.slug).toEqual(dm.slug);

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).toContain("field1");

      Object.assign(dm.definition, {
        fields: {
          field2: {
            type: FieldTypes.TEXT,
          },
        },
      });

      await TestModel.reloadModel();

      expect(TestModel.fieldsKeys).not.toContain("field1");
      expect(TestModel.fieldsKeys).toContain("field2");
    });

    it("should support for keyField change", async () => {
      const adapter = mockAdapter();
      const dm = await DataModel.extend({ adapterClass: adapter }).create({
        slug: generateRandomString(),
        definition: {
          keyField: "field1",
          fields: {
            field1: {
              type: FieldTypes.TEXT,
            },
          },
          validators: [
            {
              type: ValidatorTypes.REQUIRED,
              options: { field: "field1" },
            },
          ],
        },
      });

      const TestModel = Model.getClass(dm);

      await TestModel.reloadModel();

      expect(TestModel.getKeyField()).toEqual("field1");

      expect(TestModel.fieldsKeys).toContain("field1");

      Object.assign(dm.definition, {
        keyField: "field2",
        fields: {
          field2: {
            type: FieldTypes.TEXT,
          },
        },
      });

      await TestModel.reloadModel();

      expect(TestModel.getKeyField()).toEqual("field2");

      expect(TestModel.fieldsKeys).not.toContain("field1");

      expect(TestModel.fieldsKeys).toContain("field2");
    });
  });

  describe("Model adapter", () => {
    it("should return model adapter", async () => {
      const adapter = mockAdapter();
      const TestModel = mockModel().extend({ adapterClass: adapter });

      expect(TestModel.getAdapter()?.base).toBe(adapter);
    });

    it("should be able to use global adapter", async () => {
      const GlobalModel = mockModel();
      const _adapterClass = mockAdapter();
      GlobalModel.adapterClass = _adapterClass;

      class model extends GlobalModel {}

      expect(model.getAdapter()?.base).toBe(_adapterClass);
    });

    it("should return the right adapter", async () => {
      const adapter1 = mockAdapter();
      const adapter2 = mockAdapter();
      const adapterGlobal = mockAdapter();

      const model = mockModel();
      model.adapterClass = adapterGlobal;
      const model1 = model.extend({ adapterClass: adapter1 });
      model1.slug = generateRandomString();
      const model2 = model.extend({ adapterClass: adapter2 });
      model2.slug = generateRandomString();
      const model3 = class extends model2 {};
      model3.slug = generateRandomString();
      const model4 = model3.extend({ adapterClass: adapter1 });
      model4.slug = generateRandomString();

      expect(model.getAdapter()?.base).toBe(adapterGlobal);
      expect(model1.getAdapter()?.base).toBe(adapter1);
      expect(model2.getAdapter()?.base).toBe(adapter2);
      expect(model3.getAdapter()?.base).toBe(adapterGlobal);
      expect(model4.getAdapter()?.base).toBe(adapter1);
    });

    it("should detect if model has changed on adapter", async () => {
      const adapter1 = mockAdapter();
      const adapter2 = mockAdapter();

      const GlobalModel = mockModel();
      GlobalModel.adapterClass = adapter1;

      const model1 = class extends GlobalModel {};
      expect(model1.getAdapter()?.base).toBe(adapter1);
      expect(model1.hasAdapterClassChanged()).toBeFalsy();
      GlobalModel.adapterClass = adapter2;
      expect(model1.getAdapter()?.base).not.toBe(adapter2);
      expect(model1.hasAdapterClassChanged()).toBeTruthy();
    });
  });

  describe("Model getClass", () => {
    it("should return the same model & initialize once with multiple model get", async () => {
      const adapter = mockAdapter();
      const slug = generateRandomString();
      await DataModel.extend({ adapterClass: adapter }).create({ slug });

      const model = Model.getClass(slug, adapter);
      const modelBis = Model.getClass(slug, adapter);

      expect(model).toBe(modelBis);

      const spy = jest.spyOn(model, "reloadModel");

      expect(spy).toHaveBeenCalledTimes(0);

      await expect(model.initialize()).resolves.toBeUndefined();
      await expect(modelBis.initialize()).resolves.toBeUndefined();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should throw error at initializing if no adapter", async () => {
      const slug = generateRandomString();

      const model = Model.getClass(slug);

      await expect(model.initialize()).rejects.toThrow(CoreError);
    });

    it("should not throw error at initializing if datamodel exists", async () => {
      const adapter = mockAdapter();
      const slug = generateRandomString();
      await DataModel.extend({ adapterClass: adapter }).create({ slug });

      const model = Model.getClass(slug).extend({ adapterClass: adapter });

      await expect(model.initialize()).resolves.toBeUndefined();
    });

    it("should not throw error at initializing if datamodel doesn't exists", async () => {
      const adapter = mockAdapter();
      const slug = generateRandomString();

      const model = Model.getClass(slug).extend({ adapterClass: adapter });

      await expect(model.initialize()).resolves.toBeUndefined();
    });

    it("getClass should return model with the instance adapter", async () => {
      const adapter = mockAdapter();
      const DM = DataModel.extend({ adapterClass: adapter });
      const datamodel = new DM({ slug: faker.animal.type() });

      const modelFromDM = Model.getClass(datamodel);

      expect(modelFromDM.getAdapter(false)?.base).toBe(adapter);
    });

    it("should return same model from slug and from datamodel instance with same adapter", async () => {
      const adapter = mockAdapter();
      const slug = generateRandomString();

      const datamodel = new DataModel({ slug });

      const modelFromDM = Model.getClass(datamodel, adapter);
      const modelFromSlug = Model.getClass(slug, adapter);

      expect(modelFromDM).toBe(modelFromSlug);
    });

    it("should return different models from slug and from datamodel instance with different adapters", async () => {
      const adapter = mockAdapter();
      const slug = generateRandomString();

      const datamodel = new DataModel({ slug });

      const modelFromDM = Model.getClass(datamodel);
      const modelFromSlug = Model.getClass(slug, adapter);

      expect(modelFromDM).not.toBe(modelFromSlug);
    });

    it("should return different models from slugs with different adapters", async () => {
      const adapter = mockAdapter();
      const slug = generateRandomString();

      const modelFromDM = Model.getClass(slug);
      const modelFromSlug = Model.getClass(slug, adapter);

      expect(modelFromDM).not.toBe(modelFromSlug);
    });

    it("should cache class on adapter by slug and use these models in relation fields", async () => {
      const adapter = mockAdapter();

      const slug1 = generateRandomString();
      const slug2 = generateRandomString();

      await DataModel.extend({ adapterClass: adapter }).createMultiple([
        {
          slug: slug1,
        },
        {
          slug: slug2,
          definition: {
            fields: {
              rel: {
                type: FieldTypes.RELATION,
                options: {
                  ref: slug1,
                },
              },
            },
          },
        },
      ]);

      const Model1 = class extends Data {
        static slug = slug1;
      }.extend({ adapterClass: adapter });

      const i1 = await Model.getClass(slug1, adapter).create({});

      i1._id = new ObjectId().toString();

      const i2 = await Model.getClass<
        typeof Model & {
          definition: {
            fields: {
              rel: {
                type: FieldTypes.RELATION;
                options: {
                  ref: "accounts";
                };
              };
            };
          };
        }
      >(slug2, adapter).create({ rel: i1._id });

      expect(i2.rel.model).toBe(Model1);
    });

    it("should cache class on adapter by slug and use these models in relation fields", async () => {
      const adapter = mockAdapter();

      const slug1 = generateRandomString();
      const slug2 = generateRandomString();

      await DataModel.extend({ adapterClass: adapter }).createMultiple([
        {
          slug: slug1,
        },
        {
          slug: slug2,
          definition: {
            fields: {
              rel: {
                type: FieldTypes.RELATION,
                options: {
                  ref: slug1,
                },
              },
            },
          },
        },
      ]);

      const i1 = await Model.getClass(slug1, adapter).create({});

      i1._id = new ObjectId().toString();

      const i2 = await Model.getClass(slug2, adapter).create<{
        fields: {
          rel: { type: FieldTypes.RELATION };
        };
      }>({ rel: i1._id });

      expect(i2.rel.model).toHaveProperty("slug", slug1);

      const Model1 = class extends Data {
        static slug = slug1;
      }.extend({ adapterClass: adapter, force: true });

      const i3 = await Model.getClass(slug2, adapter).create<{
        fields: {
          rel: { type: FieldTypes.RELATION };
        };
      }>({ rel: i1._id });

      expect(i3.rel.model).toBe(Model1);
    });

    it("should cache class on adapter by slug and use these models in array relation fields", async () => {
      const adapter = mockAdapter();

      const slug1 = generateRandomString();
      const slug2 = generateRandomString();

      await DataModel.extend({ adapterClass: adapter }).createMultiple([
        {
          slug: slug1,
        },
        {
          slug: slug2,
          definition: {
            fields: {
              rel: {
                type: FieldTypes.ARRAY,
                options: {
                  items: {
                    type: FieldTypes.RELATION,
                    options: {
                      ref: slug1,
                    },
                  },
                },
              },
            },
          },
        },
      ]);

      const Model1 = class extends Data {
        static slug = slug1;
      }.extend({ adapterClass: adapter });

      const i1 = await Model.getClass(slug1, adapter).create({});

      i1._id = new ObjectId().toString();

      const i2 = await Model.getClass(slug2, adapter).create<{
        fields: {
          rel: {
            type: FieldTypes.ARRAY;
            options: {
              items: { type: FieldTypes.RELATION };
            };
          };
        };
      }>({ rel: [i1._id] });

      expect(i2.rel.model).toBe(Model1);
    });
  });

  describe("Model extend", () => {
    it("should return right model constructor", async () => {
      const TestModel = mockModel().extend({ adapterClass: mockAdapter() });

      const i = await TestModel.create({});

      expect(i.model()).toBe(TestModel);
    });

    it("should return right model constructor when model is cloned", async () => {
      const TestModelCloned = mockModel().extend({ adapterClass: mockAdapter() });

      const i = await TestModelCloned.create({});

      expect(i.model()).toBe(TestModelCloned);
    });

    it("should not throw error if model is extended with different adapter", async () => {
      const adapter1 = mockAdapter();
      const adapter2 = mockAdapter();

      const TestModel = mockModel().extend({ adapterClass: adapter1 });

      expect(TestModel.extend({ adapterClass: adapter2 })).toBeDefined();
    });

    it("should throw error if model is extended with same adapter as the model slug is already registered", async () => {
      const adapter = mockAdapter();

      const TestModel = mockModel().extend({ adapterClass: adapter });

      expect(() => TestModel.extend({ adapterClass: adapter })).toThrow("already registered");
    });

    it("should not throw error if model is extended with same adapter and register: false and not override adapter model", async () => {
      const adapter = mockAdapter();

      const TestModel = mockModel().extend({ adapterClass: adapter });

      expect(TestModel.extend({ adapterClass: adapter, register: false })).toBeDefined();

      const TestModel2 = TestModel.extend({ adapterClass: adapter, register: false });

      expect(adapter.getModel(TestModel.slug)).toBe(TestModel);
      expect(adapter.getModel(TestModel.slug)).not.toBe(TestModel2);
    });

    it("should not throw error if model is extended with same adapter and force: true and override adapter model", async () => {
      const adapter = mockAdapter();

      const TestModel = mockModel().extend({ adapterClass: adapter });

      expect(TestModel.extend({ adapterClass: adapter, force: true })).toBeDefined();

      const TestModel2 = TestModel.extend({ adapterClass: adapter, force: true });

      expect(adapter.getModel(TestModel.slug)).not.toBe(TestModel);
      expect(adapter.getModel(TestModel.slug)).toBe(TestModel2);
    });

    it("should be able to extend medias class fields", async () => {
      const cache = new Set<ModelInstance>();
      const adapter = mockAdapter({ privateCache: cache });

      await DataModel.extend({ adapterClass: adapter })
        .create({
          slug: "medias",
          definition: {
            fields: {
              title: {
                type: FieldTypes.TEXT,
                options: {
                  default: "1",
                },
              },
            },
          },
        })
        .catch(e => {
          console.log(e.stack);
          throw e;
        });

      const model = Model.getClass("medias", adapter);

      await model.initialize();

      expect(model.fieldsMap.has("title")).toBeTruthy();
    });

    it("should be able to extend multiple medias classes", async () => {
      const cache = new Set<ModelInstance>();

      const adapter1 = mockAdapter({ privateCache: cache });
      const adapter2 = mockAdapter({ privateCache: cache });

      await DataModel.extend({ adapterClass: adapter1 }).create({
        slug: "medias",
        definition: {
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {
                default: "1",
              },
            },
          },
        },
      });

      const medias1 = Model.getClass("medias", adapter1);
      const medias2 = Model.getClass("medias", adapter2);

      await medias1.initialize();
      await medias2.initialize();

      expect(medias1.fieldsMap.has("title")).toBeTruthy();
      expect(medias2.fieldsMap.has("title")).toBeTruthy();
    });
  });

  it("should ...", async () => {
    const slug = generateRandomString();
    const adapter = mockAdapter();

    const dm = await DataModel.extend({ adapterClass: adapter }).create({
      slug: slug,
      definition: {
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              default: "1",
            },
          },
        },
      },
    });

    const model1 = Model.getClass(slug, adapter);

    const spyReload = jest.spyOn(model1, "reloadModel");

    expect(spyReload).toHaveBeenCalledTimes(0);

    await model1.initialize();

    expect(spyReload).toHaveBeenCalledTimes(1);

    expect(model1.fieldsMap.has("title")).toBeTruthy();

    const model2 = Model.getClass(slug, adapter);

    const spyReload2 = jest.spyOn(model2, "reloadModel");

    expect(spyReload2).toHaveBeenCalledTimes(1);

    await model2.initialize();

    expect(spyReload2).toHaveBeenCalledTimes(1);

    expect(model2.fieldsMap.has("title")).toBeTruthy();

    await dm.update({
      $set: {
        definition: {
          fields: {
            subtitle: {
              type: FieldTypes.TEXT,
            },
          },
        },
      },
    });

    // console.log(model1.fieldsMap);
  });
});
