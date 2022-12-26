import SerializerFormat from "../enums/serializer-format";
import Model from "./Model";
import Field from "./Field";
import FieldTypes from "../enums/field-types";

describe("test defaultSerializer", () => {
  let TestModel;

  beforeAll(async () => {
    TestModel = class extends Model {
      static __fields = new Map([
        ["fieldTextSimple", new Field(FieldTypes.TEXT)],
        [
          "fieldTextDefault",
          new Field(FieldTypes.TEXT, { default: "default" }),
        ],
        ["fieldTextMultiple", new Field(FieldTypes.TEXT, { multiple: true })],
      ]);
    };

    await TestModel.initialize();
  });

  it("Should serialize Field Text", async () => {
    const instance = new TestModel({ fieldTextSimple: "test" });

    expect(typeof instance.get("fieldTextSimple", SerializerFormat.JSON)).toBe(
      "string"
    );
    expect(
      typeof instance.get("fieldTextSimple", SerializerFormat.OBJECT)
    ).toBe("string");
    expect(
      typeof instance.get("fieldTextSimple", SerializerFormat.DOCUMENT)
    ).toBe("string");
  });

  it("Should serialize Field Text with default", async () => {
    const instance = new TestModel({});

    expect(typeof instance.get("fieldTextDefault", SerializerFormat.JSON)).toBe(
      "string"
    );
    expect(
      typeof instance.get("fieldTextDefault", SerializerFormat.OBJECT)
    ).toBe("string");
    expect(
      typeof instance.get("fieldTextDefault", SerializerFormat.DOCUMENT)
    ).toBe("string");
  });

  it("Should serialize Field Text multiple", async () => {
    const instanceWithArray = new TestModel({
      fieldTextMultiple: ["test1", "test2"],
    });
    const instanceWithString = new TestModel({
      fieldTextMultiple: "test",
    });

    expect(
      instanceWithArray.get("fieldTextMultiple", SerializerFormat.JSON)
    ).toBeInstanceOf(Array);
    expect(
      instanceWithArray.get("fieldTextMultiple", SerializerFormat.OBJECT)
    ).toBeInstanceOf(Array);
    expect(
      instanceWithArray.get("fieldTextMultiple", SerializerFormat.DOCUMENT)
    ).toBeInstanceOf(Array);

    expect(
      instanceWithString.get("fieldTextMultiple", SerializerFormat.JSON)
    ).toBeInstanceOf(Array);
    expect(
      instanceWithString.get("fieldTextMultiple", SerializerFormat.OBJECT)
    ).toBeInstanceOf(Array);
    expect(
      instanceWithString.get("fieldTextMultiple", SerializerFormat.DOCUMENT)
    ).toBeInstanceOf(Array);
  });
});
