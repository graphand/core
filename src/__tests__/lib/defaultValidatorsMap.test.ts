import {
  mockAdapter,
  mockModel,
  generateRandomString,
} from "../../lib/test-utils";
import ValidatorTypes from "../../enums/validator-types";
import ValidationError from "../../lib/ValidationError";
import { faker } from "@faker-js/faker";
import FieldTypes from "../../enums/field-types";
import Model from "../../lib/Model";
import Validator from "../../lib/Validator";
import { ValidatorOptions } from "../../types";
import { models } from "../../index";

describe("test validatorsMap", () => {
  const adapter = mockAdapter();

  describe("required validator", () => {
    const model = mockModel({
      fields: {
        title: {
          type: FieldTypes.TEXT,
        },
        obj: {
          type: FieldTypes.NESTED,
          options: {
            fields: {
              title: {
                type: FieldTypes.TEXT,
              },
            },
          },
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
      return e.validators.some((err) => {
        const v = err.validator as Validator<ValidatorTypes.REQUIRED>;
        return (
          v.type === ValidatorTypes.REQUIRED && v.options.field === "title"
        );
      });
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

      it("createMultiple with nested field title in every item of list should not throw error", async () => {
        const title = faker.lorem.word();
        const list = await model.createMultiple([
          { title, obj: { title } },
          { title, obj: { title } },
        ]);
        expect(list).toBeInstanceOf(Array);
        expect(list.every((i) => i instanceof model)).toBeTruthy();
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
        expect(i.getDoc().title).toBe(updateTitle);
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

      it("should validate within array", async () => {
        const _model = mockModel({
          fields: {
            arr: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.TEXT,
                },
                validators: [
                  {
                    type: ValidatorTypes.REQUIRED,
                  },
                ],
              },
            },
          },
        }).withAdapter(adapter);

        await expect(
          _model.validate([
            {
              arr: [faker.lorem.word()],
            },
          ])
        ).resolves.toBeTruthy();

        await expect(
          _model.validate([
            {
              arr: [faker.lorem.word(), ""],
            },
          ])
        ).rejects.toBeInstanceOf(ValidationError);
      });
    });
  });

  describe("regex validator", () => {
    const _mockModelWithRegexValidator = async (
      options: Partial<ValidatorOptions<ValidatorTypes.REGEX>> = {}
    ) => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        validators: [
          {
            type: ValidatorTypes.REGEX,
            options: {
              field: "title",
              ...options,
            } as ValidatorOptions<ValidatorTypes.REGEX>,
          },
        ],
      }).withAdapter(adapter);

      await model.initialize();

      return model;
    };

    describe("email regex", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({
          pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
        });
      });

      it("create with valid email should not throw error", async () => {
        const i = await model.create({ title: faker.internet.email() });

        expect(i).toBeInstanceOf(model);
      });

      it("create with undefined email should not throw error", async () => {
        const i = await model.create({});

        expect(i).toBeInstanceOf(model);
      });

      it("create with null email should not throw error", async () => {
        const i = await model.create({ title: null });

        expect(i).toBeInstanceOf(model);
      });

      it("create with invalid email should throw error", async () => {
        const invalidPromise = model.create({ title: "invalidEmail" });

        await expect(invalidPromise).rejects.toBeInstanceOf(ValidationError);
      });
    });

    describe("url regex", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({
          pattern: "^https?:\\/\\/.+",
        });
      });

      it("create with valid url should not throw error", async () => {
        const i = await model.create({ title: faker.internet.url() });

        expect(i).toBeInstanceOf(model);
      });

      it("create with undefined url should not throw error", async () => {
        const i = await model.create({});

        expect(i).toBeInstanceOf(model);
      });

      it("create with null url should not throw error", async () => {
        const i = await model.create({ title: null });

        expect(i).toBeInstanceOf(model);
      });

      it("create with invalid url should throw error", async () => {
        const invalidPromise = model.create({ title: "invalidUrl" });

        await expect(invalidPromise).rejects.toBeInstanceOf(ValidationError);
      });
    });

    it("should validate within array", async () => {
      const _model = mockModel({
        fields: {
          arr: {
            type: FieldTypes.ARRAY,
            options: {
              items: {
                type: FieldTypes.TEXT,
              },
              validators: [
                {
                  type: ValidatorTypes.REGEX,
                  options: {
                    pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
                  },
                },
              ],
            },
          },
        },
      }).withAdapter(adapter);

      await expect(
        _model.validate([
          {
            arr: [faker.internet.email()],
          },
        ])
      ).resolves.toBeTruthy();

      await expect(
        _model.validate([
          {
            arr: [faker.internet.email(), "invalidEmail"],
          },
        ])
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe("keyField validator", () => {
    const model = mockModel({
      fields: {
        title: {
          type: FieldTypes.TEXT,
        },
      },
      validators: [
        {
          type: ValidatorTypes.KEY_FIELD,
          options: {
            field: "title",
          },
        },
      ],
    }).withAdapter(adapter);

    beforeAll(async () => {
      await model.initialize();
    });

    it("create with no keyField should throw error", async () => {
      await expect(model.create({})).rejects.toBeInstanceOf(ValidationError);
    });

    it("create with valid keyField should not throw error", async () => {
      const i = await model.create({ title: "validKey" });
      expect(i).toBeInstanceOf(model);
    });
  });

  describe("datamodelKeyField validator", () => {
    const DataModel = models.DataModel.withAdapter(adapter);

    it("datamodel without keyField should not throw error", async () => {
      const datamodel = DataModel.create({
        slug: generateRandomString(),
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      });

      await expect(datamodel).resolves.toBeInstanceOf(DataModel);
    });

    it("datamodel with keyField and valid keyField field should not throw error", async () => {
      const datamodel = DataModel.create({
        slug: generateRandomString(),
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        keyField: "title",
      });

      await expect(datamodel).resolves.toBeInstanceOf(DataModel);
    });

    it("datamodel with keyField and not existing field should throw error", async () => {
      const datamodel = DataModel.create({
        slug: generateRandomString(),
        keyField: "title",
      });

      await expect(datamodel).rejects.toBeInstanceOf(ValidationError);
    });

    it("datamodel with keyField and invalid keyField field should throw error", async () => {
      const datamodel1 = DataModel.create({
        slug: generateRandomString(),
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        keyField: "test",
      });

      await expect(datamodel1).rejects.toBeInstanceOf(ValidationError);

      const datamodel2 = DataModel.create({
        slug: generateRandomString(),
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              default: "default",
            },
          },
        },
        keyField: "title",
      });

      await expect(datamodel2).rejects.toBeInstanceOf(ValidationError);

      const datamodel3 = DataModel.create({
        slug: generateRandomString(),
        fields: {
          title: {
            type: FieldTypes.NUMBER,
          },
        },
        keyField: "title",
      });

      await expect(datamodel3).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe("length validator", () => {
    const _mockModelWithRegexValidator = async (
      options: Partial<ValidatorOptions<ValidatorTypes.LENGTH>> = {}
    ) => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        validators: [
          {
            type: ValidatorTypes.LENGTH,
            options: {
              field: "title",
              ...options,
            },
          },
        ],
      }).withAdapter(adapter);

      await model.initialize();

      return model;
    };

    it("create without validator config should not throw error", async () => {
      const model = await _mockModelWithRegexValidator();

      await expect(model.create({})).resolves.toBeInstanceOf(model);

      await expect(model.create({ title: "test" })).resolves.toBeInstanceOf(
        model
      );

      await expect(model.create({ title: "" })).resolves.toBeInstanceOf(model);

      await expect(
        model.create({ title: faker.lorem.paragraph() })
      ).resolves.toBeInstanceOf(model);
    });

    describe("min", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({ min: 2 });
      });

      it("invalid length should throw error", async () => {
        await expect(model.create({ title: "" })).rejects.toThrow(
          ValidationError
        );

        await expect(model.create({ title: 1 })).rejects.toThrow(
          ValidationError
        );
      });

      it("valid length should not throw error", async () => {
        await expect(model.create({ title: "ab" })).resolves.toBeInstanceOf(
          model
        );

        await expect(
          model.create({ title: faker.lorem.paragraph() })
        ).resolves.toBeInstanceOf(model);
      });
    });

    describe("max", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({ max: 5 });
      });

      it("invalid length should throw error", async () => {
        await expect(model.create({ title: "123456" })).rejects.toThrow(
          ValidationError
        );

        await expect(model.create({ title: 123456 })).rejects.toThrow(
          ValidationError
        );
      });

      it("valid length should not throw error", async () => {
        await expect(model.create({ title: "test" })).resolves.toBeInstanceOf(
          model
        );

        await expect(model.create({ title: "12345" })).resolves.toBeInstanceOf(
          model
        );

        await expect(model.create({ title: 12345 })).resolves.toBeInstanceOf(
          model
        );
      });
    });

    describe("min and max", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({ min: 2, max: 5 });
      });

      it("invalid length should throw error", async () => {
        await expect(model.create({ title: "" })).rejects.toThrow(
          ValidationError
        );

        await expect(model.create({ title: 1 })).rejects.toThrow(
          ValidationError
        );

        await expect(model.create({ title: "123456" })).rejects.toThrow(
          ValidationError
        );

        await expect(model.create({ title: 123456 })).rejects.toThrow(
          ValidationError
        );

        await expect(
          model.create({ title: faker.lorem.paragraph() })
        ).rejects.toThrow(ValidationError);
      });

      it("valid length should not throw error", async () => {
        await expect(model.create({ title: "ab" })).resolves.toBeInstanceOf(
          model
        );

        await expect(model.create({ title: "test" })).resolves.toBeInstanceOf(
          model
        );

        await expect(model.create({ title: "12345" })).resolves.toBeInstanceOf(
          model
        );

        await expect(model.create({ title: 12345 })).resolves.toBeInstanceOf(
          model
        );
      });
    });
  });

  describe("boundaries validator", () => {
    const _mockModelWithRegexValidator = async (
      options: Partial<ValidatorOptions<ValidatorTypes.BOUNDARIES>> = {}
    ) => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
        validators: [
          {
            type: ValidatorTypes.BOUNDARIES,
            options: {
              field: "title",
              ...options,
            },
          },
        ],
      }).withAdapter(adapter);

      await model.initialize();

      return model;
    };

    it("create without validator config should not throw error", async () => {
      const model = await _mockModelWithRegexValidator();

      await expect(model.create({})).resolves.toBeInstanceOf(model);
      await expect(model.create({ title: -10 })).resolves.toBeInstanceOf(model);
      await expect(model.create({ title: 100 })).resolves.toBeInstanceOf(model);
      await expect(model.create({ title: 0 })).resolves.toBeInstanceOf(model);
      await expect(model.create({ title: 0.1 })).resolves.toBeInstanceOf(model);
    });

    describe("min", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({ min: 2 });
      });

      it("invalid length should throw error", async () => {
        await expect(model.create({ title: 1 })).rejects.toThrow(
          ValidationError
        );
      });

      it("valid length should not throw error", async () => {
        await expect(model.create({ title: 2 })).resolves.toBeInstanceOf(model);
        await expect(model.create({ title: 3 })).resolves.toBeInstanceOf(model);
      });
    });

    describe("max", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({ max: 5 });
      });

      it("invalid length should throw error", async () => {
        await expect(model.create({ title: 6 })).rejects.toThrow(
          ValidationError
        );
      });

      it("valid length should not throw error", async () => {
        await expect(model.create({ title: 2 })).resolves.toBeInstanceOf(model);
        await expect(model.create({ title: 3 })).resolves.toBeInstanceOf(model);
      });
    });

    describe("min and max", () => {
      let model;

      beforeAll(async () => {
        model = await _mockModelWithRegexValidator({ min: 2, max: 5 });
      });

      it("invalid length should throw error", async () => {
        await expect(model.create({ title: -Infinity })).rejects.toThrow(
          ValidationError
        );
        await expect(model.create({ title: -1 })).rejects.toThrow(
          ValidationError
        );
        await expect(model.create({ title: 1 })).rejects.toThrow(
          ValidationError
        );
        await expect(model.create({ title: 1.99999999999 })).rejects.toThrow(
          ValidationError
        );
        await expect(model.create({ title: 5.000000001 })).rejects.toThrow(
          ValidationError
        );
        await expect(model.create({ title: 6 })).rejects.toThrow(
          ValidationError
        );
        await expect(model.create({ title: Infinity })).rejects.toThrow(
          ValidationError
        );
      });

      it("valid length should not throw error", async () => {
        await expect(model.create({ title: 2 })).resolves.toBeInstanceOf(model);
        await expect(model.create({ title: 3 })).resolves.toBeInstanceOf(model);
      });
    });
  });

  describe("unique validator", () => {
    const model = mockModel({
      fields: {
        title: {
          type: FieldTypes.TEXT,
        },
        arr: {
          type: FieldTypes.ARRAY,
          options: {
            items: {
              type: FieldTypes.TEXT,
            },
            validators: [
              {
                type: ValidatorTypes.UNIQUE,
              },
            ],
          },
        },
        arrObj: {
          type: FieldTypes.ARRAY,
          options: {
            items: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  label: {
                    type: FieldTypes.TEXT,
                  },
                },
                validators: [
                  {
                    type: ValidatorTypes.UNIQUE,
                    options: {
                      field: "label",
                    },
                  },
                ],
              },
            },
            validators: [
              {
                type: ValidatorTypes.UNIQUE,
              },
            ],
          },
        },
      },
      validators: [
        {
          type: ValidatorTypes.UNIQUE,
          options: {
            field: "title",
          },
        },
      ],
    }).withAdapter(adapter);

    beforeAll(async () => {
      await model.initialize();
    });

    it("no value should not throw error", async () => {
      const list = await model.createMultiple([{}, {}]);
      expect(list).toBeInstanceOf(Array);
    });

    it("same value should throw error", async () => {
      await expect(
        model.createMultiple([
          {
            title: "title",
          },
          {
            title: "title",
          },
        ])
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("same value in array should throw error", async () => {
      await expect(
        model.create({
          arr: ["value", "value"],
        })
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("same value in nested array field should throw error", async () => {
      await expect(
        model.create({
          arrObj: [
            {
              label: "value",
            },
            {
              label: "value",
            },
          ],
        })
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("same value in array in different instances should throw error", async () => {
      await expect(
        model.createMultiple([
          {
            arr: ["value1", "value2"],
          },
          {
            arr: ["value3", "value1"],
          },
        ])
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("same value in nested array field in different instances should throw error", async () => {
      await expect(
        model.createMultiple([
          {
            arrObj: [
              {
                label: "value1",
              },
              {
                label: "value2",
              },
            ],
          },
          {
            arrObj: [
              {
                label: "value3",
              },
              {
                label: "value1",
              },
            ],
          },
        ])
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });
});
