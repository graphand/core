import DataModel from "../models/DataModel";
import { faker } from "@faker-js/faker";
import Data from "./Data";
import { mockAdapter, mockModel } from "../test-utils";
import CoreError from "./CoreError";
import FieldTypes from "../enums/field-types";

describe("Data", () => {
  const adapter = mockAdapter({
    modelDefinition: { fields: {}, validators: [] },
  });

  it("should get same model from slug and from datamodel instance", async () => {
    const slug = faker.animal.type();

    const datamodel = new DataModel({ slug });

    const modelFromDM = Data.getFromDatamodel(datamodel);
    const modelFromSlug = Data.getFromSlug(slug);

    expect(modelFromDM).toBe(modelFromSlug);
  });

  it("getFromDatamodel should returns model with the instance adapter", async () => {
    const DM = DataModel.withAdapter(adapter);
    const datamodel = new DM({ slug: faker.animal.type() });

    const modelFromDM = Data.getFromDatamodel(datamodel);

    expect(modelFromDM.__adapter?.constructor).toBe(adapter);
  });

  it("should throw error at initializing if no adapter", async () => {
    const slug = faker.animal.type();

    const model = Data.getFromSlug(slug);

    await expect(model.initialize()).rejects.toThrow(CoreError);
  });

  it("should throw error at initializing if datamodel doesn't exist", async () => {
    const slug = faker.lorem.word();

    const model = Data.getFromSlug(slug).withAdapter(adapter);

    await expect(model.initialize()).rejects.toThrow(CoreError);
  });

  it("should not throw error at initializing if datamodel exists", async () => {
    const DM = DataModel.withAdapter(adapter);
    const slug = faker.lorem.word();
    await DM.create({ slug });

    const model = Data.getFromSlug(slug).withAdapter(adapter);

    await expect(model.initialize()).resolves.toBeUndefined();
  });

  it("Should be able to manually define fields", () => {
    const model = mockModel({
      fields: {
        title: {
          type: FieldTypes.TEXT,
          options: {},
        },
      },
    }).withAdapter(adapter);

    expect(model.fieldsKeys).toContain("title");
  });

  it("Test", () => {});
});
