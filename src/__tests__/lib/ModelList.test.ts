import { mockAdapter, mockModel } from "../../test-utils";

describe("test ModelList", () => {
  let model;
  let adapter;
  let TestModel;
  let list;

  beforeAll(async () => {
    model = mockModel();
    adapter = mockAdapter();

    TestModel = model.withAdapter(adapter);
    list = await TestModel.getList();
  });

  afterAll(() => {});

  it("Should be able to get ids list", async () => {
    const ids = list.getIds();

    expect(ids.length).toEqual(list.length);
    ids.forEach((id) => {
      expect(typeof id).toBe("string");
    });
  });
});
