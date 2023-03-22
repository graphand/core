import { mockAdapter, mockModel } from "../../test-utils";
import Field from "../../lib/Field";
import Model from "../../lib/Model";
import FieldTypes from "../../enums/field-types";
import Validator from "../../lib/Validator";
import ValidatorTypes from "../../enums/validator-types";
import { models } from "../../index";
import { getRecursiveValidatorsFromModel } from "../../lib/utils";
import Data from "../../lib/Data";
import PromiseModel from "../../lib/PromiseModel";

describe("Test Model", () => {
  let adapter;
  let BaseModel;

  beforeAll(() => {
    adapter = mockAdapter();
    BaseModel = mockModel();
  });

  afterAll(() => {});

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
      expect(AccountModel.__adapter).toBeInstanceOf(adapter);
    });

    it("Should be able to getFromSlug without adapter", async () => {
      const AccountModel = Model.getFromSlug("accounts");
      expect(AccountModel.__adapter).toBeUndefined();
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

      await model.initialize(true);

      expect(hookBefore).toBeCalledTimes(2);
      expect(hookAfter).toBeCalledTimes(2);
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
  });

  describe("Model fields", () => {
    it("Model should returns field default value if undefined", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const created = await TestModel.create({});
      expect(created.title).toBe("test");
    });

    it("Model should undefined if no field", async () => {
      const TestModel = BaseModel.withAdapter(adapter);
      const created = await TestModel.create({ noField: "test" });
      expect(created.noField).toBe(undefined);
    });

    it("Model getter should serialize with field from adapter", async () => {
      const testSerializer = jest.fn(() => "test");

      class TestFieldText extends Field<FieldTypes.TEXT> {
        serialize = testSerializer;
      }

      const _adapter = mockAdapter({
        fieldsMap: {
          [FieldTypes.TEXT]: TestFieldText,
        },
      });

      const TestModel = BaseModel.withAdapter(_adapter);
      const created = await TestModel.create({ title: "title" });
      expect(testSerializer).toHaveBeenCalledTimes(0);
      expect(created.title).toBeDefined();
      expect(testSerializer).toHaveBeenCalledTimes(1);
    });

    it("Model getter should be able to return value from within json", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
          obj: {
            type: FieldTypes.JSON,
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
        title: "title",
        obj: { nested: "nested" },
      });

      expect(created.title).toBe("title");
      expect(created.obj.nested).toBe("nested");
      expect(created.get("obj.nested")).toBe("nested");
    });

    it("Model getter should serialize value from within json", async () => {
      const model1 = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);

      const model2 = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
          obj: {
            type: FieldTypes.JSON,
            options: {
              fields: {
                nested: {
                  type: FieldTypes.RELATION,
                  options: {
                    ref: model1.slug,
                    multiple: false,
                  },
                },
              },
            },
          },
        },
      }).withAdapter(adapter);

      const instance1 = await model1.create({
        title: "title",
      });

      const instance2 = await model2.create({
        title: "title",
        obj: { nested: instance1._id },
      });

      const getNested = instance2.obj.nested?.catch?.((e) => null);

      expect(getNested).toBeInstanceOf(PromiseModel);
    });

    it("Model setter should be able to set value", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);

      const created = await model.create({ title: "title" });

      expect(created.title).toBe("title");
      created.set("title", "title2");
      expect(created.title).toBe("title2");
    });

    it("Model setter should be able to set value from within json", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
          obj: {
            type: FieldTypes.JSON,
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
        title: "title",
        obj: { nested: "" },
      });

      expect(created.title).toBe("title");

      expect(created.get("obj.nested")).toBe("");
      created.set("obj.nested", "nested");
      expect(created.get("obj.nested")).toBe("nested");
    });

    it("Model setter should be able to set value from within json even if object is undefined", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
          obj: {
            type: FieldTypes.JSON,
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

      const created = await model.create({ title: "title" });

      expect(created.get("obj.nested")).toBe(undefined);
      created.set("obj.nested", "nested");
      expect(created.get("obj")).toEqual({ nested: "nested" });
      expect(created.get("obj.nested")).toBe("nested");
    });
  });

  describe("Model validation", () => {
    it("Model should have configKey validator if configKey is defined", async () => {
      const BaseModelWithConfigKey = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        validators: [
          { type: ValidatorTypes.UNIQUE, options: { field: "title" } },
        ],
      });
      BaseModelWithConfigKey.configKey = "title";
      const TestModel = BaseModelWithConfigKey.withAdapter(adapter);

      const configKeyValidator = TestModel.validatorsArray.find(
        (v) => v.type === ValidatorTypes.CONFIG_KEY
      );
      expect(configKeyValidator).toBeDefined();
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
      const i = new TestModel();
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
      const i = new TestModel();

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
      const i = new TestModel();
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
      const i = new TestModel();

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

      expect(testValidateField).toHaveBeenCalledTimes(2);
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

    it("getRecursiveValidatorsFromModel should returns configKey validator if model has a configKey", () => {
      const validators = getRecursiveValidatorsFromModel(models.DataModel);
      const configKeyValidator = validators.find(
        (v) => v.type === ValidatorTypes.CONFIG_KEY
      );
      expect(configKeyValidator).toBeDefined();
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
      const modelBis = Model.getAdaptedModel(BaseModel, adapter);

      expect(model).toBe(modelBis);
    });

    it("should returns same model from adapter and then slug", () => {
      BaseModel = mockModel();

      const model = Model.getAdaptedModel(BaseModel, adapter);
      const modelBis = Model.getFromSlug(BaseModel.slug, adapter);

      expect(model).toBe(modelBis);
    });

    it("should returns first cached model", () => {
      const baseAccountFromSlug = Model.getFromSlug("accounts", adapter);
      const baseAccountFromModel = Model.getAdaptedModel(
        models.Account,
        adapter
      );

      expect(baseAccountFromSlug).toBe(baseAccountFromModel);

      const extendedAccount = class extends models.Account {};

      const extendedAccountFromModel = Model.getAdaptedModel(
        extendedAccount,
        adapter
      );

      expect(extendedAccountFromModel.getBaseClass()).not.toBe(extendedAccount);
      expect(extendedAccountFromModel.getBaseClass()).toBe(models.Account);
    });

    it("should be able to override model", () => {
      const baseAccountFromSlug = Model.getFromSlug("accounts", adapter);
      const baseAccountFromModel = Model.getAdaptedModel(
        models.Account,
        adapter
      );

      expect(baseAccountFromSlug).toBe(baseAccountFromModel);

      const extendedAccount = class extends models.Account {};

      const extendedAccountFromModel = Model.getAdaptedModel(
        extendedAccount,
        adapter,
        true
      );

      expect(extendedAccountFromModel.getBaseClass()).toBe(extendedAccount);
    });

    it("Should be able to get adapted model from slug once it has been adapted from model", () => {
      const baseAccountFromSlug = Model.getFromSlug("accounts", adapter);
      const baseAccountFromModel = Model.getAdaptedModel(
        models.Account,
        adapter
      );

      expect(baseAccountFromSlug).toBe(baseAccountFromModel);

      const extendedAccount = class ExtendedAccount extends models.Account {};

      const extendedAccountFromModel = Model.getAdaptedModel(
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
      const baseModelFromModel = Model.getAdaptedModel(ExampleModel, adapter);

      expect(baseModelFromSlug).toBe(baseModelFromModel);
      expect(baseModelFromModel.getBaseClass()).not.toBe(ExampleModel);

      const extendedModelFromModel = Model.getAdaptedModel(
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
});
