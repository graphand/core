import ValidationError from "../lib/ValidationError";
import { generateRandomString, mockAdapter } from "../lib/test-utils";
import DataModel from "../models/DataModel";

describe("Global tests", () => {
  it("should not be able to create datamodel with invalid fields", async () => {
    const slug = generateRandomString();
    const adapter = mockAdapter();

    const model = DataModel.withAdapter(adapter);

    await expect(
      model.validate([new model({ slug, fields: "toto" })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            field1: "toto",
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            field1: {
              type: {},
            },
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            field1: {
              type: "invalid",
            },
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  it("should not be able to create datamodel with invalid validators", async () => {
    const slug = generateRandomString();
    const adapter = mockAdapter();

    const model = DataModel.withAdapter(adapter);

    await expect(
      model.validate([new model({ slug, validators: "toto" })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([new model({ slug, validators: {} })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([new model({ slug, validators: ["required"] })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          validators: [
            {
              type: "invalid",
            },
          ],
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });
});
