import Model from "./Model";
import Field from "./Field";
import FieldTypes from "../enums/field-types";
import ModelEnvScopes from "../enums/model-env-scopes";
import { FieldTextDefinition } from "../types";

describe("Model", () => {
  it("should be able to create a model", () => {
    class TestModel extends Model {
      static __name = "TestModel";
      static slug = "testmodels";
      static scope = ModelEnvScopes.ENV;

      name: FieldTextDefinition;
    }

    const model = new TestModel();

    expect(model).toBeInstanceOf(Model);
  });

  describe("getRecursiveFields", () => {
    it("should get all fields from the model and its parent classes", () => {
      const field1 = new Field(FieldTypes.TEXT, { default: "a" });
      const field2 = new Field(FieldTypes.TEXT, { default: "b" });
      const field3 = new Field(FieldTypes.TEXT, { default: "c" });
      const field4 = new Field(FieldTypes.TEXT, { default: "d" });

      // Arrange
      class ParentModel extends Model {}
      ParentModel.__fields = new Map([
        ["field1", field1],
        ["field2", field2],
      ]);

      class ChildModel extends ParentModel {}
      ChildModel.__fields = new Map([
        ["field3", field3],
        ["field3", field4],
      ]);

      // Act
      const fields = ChildModel.getRecursiveFields();

      // Assert
      expect(fields.size).toEqual(4);
      expect(fields.get("field1")).toEqual({ slug: "field1" });
      expect(fields.get("field2")).toEqual({ slug: "field2" });
      expect(fields.get("field3")).toEqual({ slug: "field3" });
      expect(fields.get("field4")).toEqual({ slug: "field4" });
    });
  });

  describe("getRecursiveHooks", () => {
    it("should get all hooks from the model and its parent classes for a given action", () => {
      // Arrange
      class ParentModel extends Model {}
      ParentModel.__hooks = new Set([
        { action: "createOne", phase: "before", fn: () => {} },
        { action: "updateOne", phase: "before", fn: () => {} },
      ]);

      class ChildModel extends ParentModel {}
      ChildModel.__hooks = new Set([
        { action: "createOne", phase: "after", fn: () => {} },
        { action: "updateOne", phase: "after", fn: () => {} },
      ]);

      // Act
      const hooks = ChildModel.getRecursiveHooks("createOne");

      // Assert
      expect(hooks.length).toEqual(2);
      expect(hooks[0].action).toEqual("createOne");
      expect(hooks[0].phase).toEqual("before");
      expect(hooks[1].action).toEqual("createOne");
      expect(hooks[1].phase).toEqual("after");
    });
  });
});
