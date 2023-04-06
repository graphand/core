import DataModel from "../../models/DataModel";
import { faker } from "@faker-js/faker";
import Data from "../../lib/Data";
import { mockAdapter, mockModel } from "../../lib/test-utils";
import CoreError from "../../lib/CoreError";
import FieldTypes from "../../enums/field-types";
import Model from "../../lib/Model";
import { getAdaptedModel } from "../../lib/utils";

describe("Data", () => {
  const adapter = mockAdapter({
    modelDefinition: { fields: {}, validators: [] },
  });

  describe("model unicity", () => {
    it("should get same model from slug and from datamodel instance with same adapter", async () => {
      const slug = faker.animal.type();

      const datamodel = new DataModel({ slug });

      const modelFromDM = Data.getFromDatamodel(datamodel, adapter);
      const modelFromSlug = Data.getFromSlug(slug, adapter);

      expect(modelFromDM).toBe(modelFromSlug);
    });

    it("should get different models from slug and from datamodel instance with different adapters", async () => {
      const slug = faker.animal.type();

      const datamodel = new DataModel({ slug });

      const modelFromDM = Data.getFromDatamodel(datamodel);
      const modelFromSlug = Data.getFromSlug(slug, adapter);

      expect(modelFromDM).not.toBe(modelFromSlug);
    });

    it("getFromDatamodel should returns model with the instance adapter", async () => {
      const DM = DataModel.withAdapter(adapter);
      const datamodel = new DM({ slug: faker.animal.type() });

      const modelFromDM = Data.getFromDatamodel(datamodel);

      expect(modelFromDM.__adapter?.constructor).toBe(adapter);
    });

    it("getFromDatamodel should save adapted model in cache", () => {
      const DM = DataModel.withAdapter(adapter);
      const datamodel = new DM({ slug: faker.animal.type() });

      const modelFromDM = Data.getFromDatamodel(datamodel, adapter);
      const modelFromDataSlug = Data.__getFromSlug(datamodel.slug, adapter);
      const modelFromModelSlug = Model.getFromSlug(datamodel.slug, adapter);

      expect(modelFromDM).toBe(modelFromDataSlug);
      expect(modelFromDM).toBe(modelFromModelSlug);
      expect(modelFromDataSlug).toBe(modelFromModelSlug);
    });

    it("getFromDatamodel should override adapted model in cache", () => {
      const DM = DataModel.withAdapter(adapter);
      const datamodel = new DM({ slug: faker.animal.type() });

      const modelFromDataSlug = Data.__getFromSlug(datamodel.slug, adapter);
      const modelFromDM = Data.getFromDatamodel(datamodel, adapter);
      const modelFromModelSlug = Model.getFromSlug(datamodel.slug, adapter);

      expect(modelFromModelSlug).toBe(modelFromDM);
      expect(modelFromDM).not.toBe(modelFromDataSlug);

      const adaptedModelFromModel = getAdaptedModel(modelFromDataSlug, adapter);

      expect(adaptedModelFromModel).toBe(modelFromModelSlug);
      expect(modelFromDM).toBe(modelFromModelSlug);
    });
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

  it("Multiple model get should return the same model & initialize once", async () => {
    const DM = DataModel.withAdapter(adapter);
    const slug = faker.lorem.word();
    await DM.create({ slug });

    const model = Data.getFromSlug(slug, adapter);
    const modelBis = Data.getFromSlug(slug, adapter);

    expect(model).toBe(modelBis);

    const spy = jest.spyOn(model, "reloadModel");

    expect(spy).toHaveBeenCalledTimes(0);

    await expect(model.initialize()).resolves.toBeUndefined();
    await expect(modelBis.initialize()).resolves.toBeUndefined();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
