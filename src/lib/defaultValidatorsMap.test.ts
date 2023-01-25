import { mockAdapter, mockModel } from "../test-utils";
import ValidatorTypes from "../enums/validator-types";
import ValidationError from "./ValidationError";
import { faker } from "@faker-js/faker";
import FieldTypes from "../enums/field-types";
import Model from "./Model";

describe("test validatorsMap", () => {
  const adapter = mockAdapter({
    modelDefinition: { fields: {}, validators: [] },
  });

  describe("required validator", () => {
    const model = mockModel({
      fields: {
        title: {
          type: FieldTypes.TEXT,
        },
      },
      validators: [
        {
          type: ValidatorTypes.REQUIRED,
          options: {
            field: "title",
          },
        },
      ],
    }).withAdapter(adapter);

    beforeAll(async () => {
      await model.initialize();
    });

    const _containsValidator = (e: ValidationError) => {
      return e.validators.some(
        ({ validator: v }) =>
          v.type === ValidatorTypes.REQUIRED && v.options.field === "title"
      );
    };

    describe("create", () => {
      it("create without field title should throw error", async () => {
        expect.assertions(2);

        try {
          await model.create({});
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("create with field title should not throw error", async () => {
        const title = faker.lorem.word();
        const i = await model.create({ title });
        expect(i).toBeInstanceOf(model);
      });

      it("create with null or empty field title should throw error", async () => {
        expect.assertions(2);

        try {
          await model.create({ title: null });
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });
    });

    describe("createMultiple", () => {
      it("createMultiple without field title in list should throw error", async () => {
        expect.assertions(2);
        const title = faker.lorem.word();

        try {
          await model.createMultiple([{}, { title }]);
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("createMultiple with field title in every item of list should not throw error", async () => {
        const title = faker.lorem.word();
        const list = await model.createMultiple([{ title }, { title }]);
        expect(list).toBeInstanceOf(Array);
        expect(list.every((i) => i instanceof model)).toBeTruthy();
      });

      it("createMultiple with one null or empty field title in list should throw error", async () => {
        expect.assertions(2);
        const title = faker.lorem.word();

        try {
          await model.createMultiple([{ title }, { title: null }]);
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });
    });

    describe("update prototype", () => {
      it("update title field to null should throw error", async () => {
        expect.assertions(2);
        const title = faker.lorem.word();
        const i = await model.create({ title });

        try {
          await i.update({ $set: { title: null } });
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("unset title field should throw error", async () => {
        expect.assertions(2);
        const title = faker.lorem.word();
        const i = await model.create({ title });

        try {
          await i.update({ $unset: { title: true } });
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("update title field should not throw error", async () => {
        const title = faker.lorem.word();
        const i = await model.create({ title });

        const updateTitle = faker.lorem.word();
        await i.update({ $set: { title: updateTitle } });
        expect(i.__doc.title).toBe(updateTitle);
      });
    });

    describe("update model", () => {
      it("update title field on model to null should throw error", async () => {
        expect.assertions(2);
        const title = faker.lorem.word();
        const i = await model.create({ title });

        try {
          const _model = model as typeof Model;
          await _model.update(
            { filter: { _id: i._id } },
            { $set: { title: null } }
          );
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("unset title field on model should throw error", async () => {
        expect.assertions(2);
        const title = faker.lorem.word();
        const i = await model.create({ title });

        try {
          const _model = model as typeof Model;
          await _model.update(
            { filter: { _id: i._id } },
            { $unset: { title: true } }
          );
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("update title field on model should not throw error", async () => {
        const title = faker.lorem.word();
        const updateTitle = faker.lorem.word();
        const i = await model.create({ title });

        const _model = model as typeof Model;
        const res = await _model.update(
          { filter: { _id: i._id } },
          { $set: { title: updateTitle } }
        );

        expect(res).toBeInstanceOf(Array);
        expect(res.every((i) => i instanceof _model)).toBeTruthy();
      });
    });

    describe("validate", () => {
      it("should throw error if no field", async () => {
        expect.assertions(2);

        try {
          await model.validate([{}]);
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("should throw error if field is empty string", async () => {
        expect.assertions(2);

        try {
          await model.validate([{ title: "" }]);
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("should throw error if field is specified as undefined", async () => {
        expect.assertions(2);

        try {
          await model.validate([{ title: undefined }]);
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("should throw error if field is null", async () => {
        expect.assertions(2);

        try {
          await model.validate([{ title: null }]);
        } catch (_e: any) {
          const e = _e as ValidationError;
          expect(e).toBeInstanceOf(ValidationError);
          expect(_containsValidator(e)).toBeTruthy();
        }
      });

      it("should not throw error if field is valid", async () => {
        const title = faker.lorem.word();
        const validated = await model.validate([{ title }]);
        expect(validated).toBeTruthy();
      });
    });
  });
});
