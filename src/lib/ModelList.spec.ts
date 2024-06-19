import ModelList from "@/lib/ModelList";
import { mockModel } from "@/lib/test-utils";

describe("test ModelList", () => {
  let model;

  beforeAll(async () => {
    model = mockModel();
  });

  it("should return the model class", () => {
    const list = new ModelList(model);
    expect(list.model).toBe(model);
  });

  it("should return the correct query object", () => {
    const query = { filter: "test" };
    const list = new ModelList(model, [], query);
    expect(list.query).toEqual(query);
  });

  it("should return the correct count", () => {
    const count = 10;
    const list = new ModelList(model, [], {}, count);
    expect(list.count).toBe(count);
  });

  it("should be able to get ids list", async () => {
    const list = new ModelList(model, [
      new model({
        _id: "a",
        _updatedAt: new Date("2023-04-20T10:30:00"),
        _createdAt: new Date("2023-04-19T12:00:00"),
      }),
      new model({
        _id: "b",
        _updatedAt: new Date("2023-04-20T11:00:00"),
        _createdAt: new Date("2023-04-19T11:00:00"),
      }),
      new model({
        _id: "c",
        _updatedAt: new Date("2023-04-20T12:00:00"),
        _createdAt: new Date("2023-04-19T10:00:00"),
      }),
    ]);

    const ids = list.getIds();

    expect(ids.length).toEqual(list.length);
    ids.forEach(id => {
      expect(typeof id).toBe("string");
    });
  });

  it("lastUpdated should return the last updated element", async () => {
    const _list = new ModelList(model, [
      new model({
        _id: "a",
        _updatedAt: new Date("2023-04-20T10:30:00"),
        _createdAt: new Date("2023-04-19T12:00:00"),
      }),
      new model({
        _id: "b",
        _updatedAt: new Date("2023-04-20T12:00:00"),
        _createdAt: new Date("2023-04-19T11:00:00"),
      }),
      new model({
        _id: "c",
        _updatedAt: new Date("2023-04-20T12:00:00"),
        _createdAt: new Date("2023-04-19T10:00:00"),
      }),
    ]);

    expect(_list.lastUpdated).toBeDefined();
    expect(_list.lastUpdated?._id).toBe("b");
  });

  it("lastUpdated should use createdAt field if updatedAt is empty", async () => {
    const _list = new ModelList(model, [
      new model({
        _id: "a",
        _updatedAt: new Date("2023-04-20T10:30:00"),
        _createdAt: new Date("2023-04-19T12:00:00"),
      }),
      new model({
        _id: "b",
        _updatedAt: null,
        _createdAt: new Date("2023-04-20T12:00:00"),
      }),
      new model({
        _id: "c",
        _updatedAt: new Date("2023-04-20T12:00:00"),
        _createdAt: new Date("2023-04-19T10:00:00"),
      }),
    ]);

    expect(_list.lastUpdated).toBeDefined();
    expect(_list.lastUpdated?._id).toBe("b");
  });

  it("lastUpdated should return last element if multiple elements are updated at the same time", async () => {
    const _list = new ModelList(model, [
      new model({
        _id: "a",
        _updatedAt: new Date("2023-04-20T10:30:00"),
        _createdAt: new Date("2023-04-19T12:00:00"),
      }),
      new model({
        _id: "b",
        _updatedAt: new Date("2023-04-20T11:00:00"),
        _createdAt: new Date("2023-04-19T11:00:00"),
      }),
      new model({
        _id: "c",
        _updatedAt: new Date("2023-04-20T12:00:00"),
        _createdAt: new Date("2023-04-19T10:00:00"),
      }),
    ]);

    expect(_list.lastUpdated).toBeDefined();
    expect(_list.lastUpdated?._id).toBe("c");
  });

  it("should reload the list correctly", async () => {
    const list = new ModelList(model);
    const reloadSpy = jest.spyOn(model, "getList").mockResolvedValue(
      new ModelList(
        model,
        [
          new model({
            _id: "d",
            _updatedAt: new Date("2023-05-01T10:00:00"),
            _createdAt: new Date("2023-04-30T10:00:00"),
          }),
        ],
        {},
        1,
      ),
    );

    await list.reload();

    expect(reloadSpy).toHaveBeenCalled();
    expect(list.length).toBe(1);
    expect(list[0]._id).toBe("d");
  });

  it("should return the correct loading state", async () => {
    const list = new ModelList(model);
    expect(list.loading).toBe(false);

    const reloadPromise = list.reload();
    expect(list.loading).toBe(true);

    await reloadPromise;
    expect(list.loading).toBe(false);
  });

  it("toArray should return a native array", () => {
    const instance = new model({
      _id: "a",
      _updatedAt: new Date("2023-04-20T10:30:00"),
      _createdAt: new Date("2023-04-19T12:00:00"),
    });
    const list = new ModelList(model, [instance]);

    const arr = list.toArray();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr[0]._id).toBe("a");
  });

  it("toJSON should return a JSON representation of the list", () => {
    const instance = new model({
      _id: "a",
      _updatedAt: new Date("2023-04-20T10:30:00"),
      _createdAt: new Date("2023-04-19T12:00:00"),
    });
    const list = new ModelList(model, [instance], {}, 1);

    const json = list.toJSON();
    expect(json).toEqual({
      rows: [instance.toJSON()],
      count: 1,
    });
  });

  it("should return the correct count when no count is provided", () => {
    const instance = new model({
      _id: "a",
      _updatedAt: new Date("2023-04-20T10:30:00"),
      _createdAt: new Date("2023-04-19T12:00:00"),
    });
    const list = new ModelList(model, [instance]);

    expect(list.count).toBe(1);
  });
});
