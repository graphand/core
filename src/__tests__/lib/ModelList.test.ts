import ModelList from "@/lib/ModelList";
import { mockModel } from "@/lib/test-utils";

describe("test ModelList", () => {
  let model;

  beforeAll(async () => {
    model = mockModel();
  });

  it("Should be able to get ids list", async () => {
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
    ids.forEach((id) => {
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
});
