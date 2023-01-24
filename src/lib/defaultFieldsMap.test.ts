import { mockAdapter, mockModel } from "../test-utils";
import FieldTypes from "../enums/field-types";
import { faker } from "@faker-js/faker";

describe("test fieldsMap", () => {
  const adapter = mockAdapter({
    modelDefinition: { fields: {}, validators: [] },
  });

  describe("test FieldText", () => {
    it("Should returns default value if undefined", async () => {
      const defaultText = faker.lorem.word();

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              default: defaultText,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const i = new model({});
      expect(i.title).toEqual(defaultText);
    });

    it("Should returns string value", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = faker.lorem.word();

      const i = new model({ title });
      expect(i.title).toEqual(title);
    });

    it("Should returns string from array", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const titleArray = [faker.lorem.word(), faker.lorem.word()];

      const i = new model({ title: titleArray });
      expect(typeof i.title).toBe("string");
    });

    it("options.multiple - Should returns array of string", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              multiple: true,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = [faker.lorem.word(), faker.lorem.word()];

      const i = new model({ title });
      expect(i.title).toBeInstanceOf(Array);
      expect(i.title.length).toEqual(2);
      expect(i.title.every((t) => typeof t === "string")).toBeTruthy();
    });

    it("options.multiple - Should returns array from string", async () => {
      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              multiple: true,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = faker.lorem.word();

      const i = new model({ title });
      expect(i.title).toBeInstanceOf(Array);
      expect(i.title.length).toEqual(1);
      expect(i.title.every((t) => typeof t === "string")).toBeTruthy();
    });

    it("options.options with creatable false - Should returns values within options", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              multiple: true,
              options,
              creatable: false,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = [faker.lorem.word(), faker.lorem.word()];

      const i = new model({ title });
      expect(i.title).toBeInstanceOf(Array);
      expect(i.title.length).toEqual(0);
    });

    it("options.options with creatable true - Should returns all values", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              multiple: true,
              options,
              creatable: true,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = [faker.lorem.word(), faker.lorem.word()];

      const i = new model({ title });
      expect(i.title).toBeInstanceOf(Array);
      expect(i.title.length).toEqual(2);
    });

    it("options.options no multiple with creatable false - Should returns values within options", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              options,
              creatable: false,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = faker.lorem.word();

      const i = new model({ title });
      expect(i.title).toBe(undefined);
    });

    it("options.options no multiple with creatable true - Should returns all values", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              options,
              creatable: true,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = faker.lorem.word();

      const i = new model({ title });
      expect(i.title).toBe(title);
    });

    it("Should throw error if value is not in options and no creatable", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              options,
              creatable: false,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = faker.lorem.word();

      const i = new model({ title });

      expect.assertions(1);

      try {
        await model.validate([i]);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it("Should throw error if one of array value is not in options and no creatable", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              multiple: true,
              options,
              creatable: false,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = [options[0], faker.lorem.word()];

      const i = new model({ title });

      expect.assertions(1);

      try {
        await model.validate([i]);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it("Should not throw error if every array value is in options and no creatable", async () => {
      const options = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      const model = mockModel({
        fields: {
          title: {
            type: FieldTypes.TEXT,
            options: {
              multiple: true,
              options,
              creatable: false,
            },
          },
        },
      }).withAdapter(adapter);
      await model.initialize();

      const title = [options[0], options[1]];

      const i = new model({ title });
      const validated = await model.validate([i]);

      expect(validated).toBeTruthy();
    });
  });
});
