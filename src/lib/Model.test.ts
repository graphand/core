import { mockAdapter, mockModel } from "../test-utils";
import Field from "./Field";
import Model from "./Model";
import { getRecursiveFieldsFromModel } from "../utils";

describe("Test Model", () => {
  let adapter;
  let BaseModel;

  beforeAll(() => {
    adapter = mockAdapter();
    BaseModel = mockModel();
  });

  afterAll(() => {});

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

  it("Model should load fields from adapter", async () => {
    const TestModel = BaseModel.withAdapter(adapter);
    const created = await TestModel.create({});
    expect(created.model.fieldsMap.get("title")).toBeInstanceOf(Field);
  });

  it("Model should returns field default value if undefined", async () => {
    const TestModel = BaseModel.withAdapter(adapter);
    const created = await TestModel.create({});
    expect(created.title).toBe("test");
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

  it("Should be able to getFromSlug with adapter", async () => {
    const TestModel = BaseModel.withAdapter(adapter);
    const AccountModel = TestModel.getFromSlug("accounts");
    expect(AccountModel.__adapter).toBeInstanceOf(adapter);
  });

  it("Should be able to getFromSlug without adapter", async () => {
    const AccountModel = Model.getFromSlug("accounts");
    expect(AccountModel.__adapter).toBeUndefined();
  });

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
    const i = await TestModel.get({});
    const clone = i.clone();
    expect(clone).toBeInstanceOf(TestModel);
    expect(clone._id).toEqual(i._id);
  });

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
