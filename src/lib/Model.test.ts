import { mockAdapter, mockModel } from "../test-utils";
import Field from "./Field";

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
    const fields = created.model.getRecursiveFields();
    expect(fields.get("title")).toBeInstanceOf(Field);
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
});
