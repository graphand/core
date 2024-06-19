import Role from "@/models/Role";
import RuleActions from "@/enums/rule-actions";
import { generateRandomString, mockAdapter } from "@/lib/test-utils";

describe("Role Model", () => {
  const adapter = mockAdapter();
  const RoleModel = Role.extend({ adapterClass: adapter });

  describe("getRulesInherited", () => {
    it("should return own rules if no inherited roles", async () => {
      const instance = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "test", actions: [RuleActions.CREATE] }],
      });

      const rules = await instance.getRulesInherited();
      expect(rules).toEqual([{ ref: "test", actions: [RuleActions.CREATE] }]);
    });

    it("should return combined rules from inherited roles", async () => {
      const inheritedRole1 = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "inherited1", actions: [RuleActions.CREATE] }],
      });

      const inheritedRole2 = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "inherited2", actions: [RuleActions.UPDATE] }],
      });

      const instance = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "test", actions: [RuleActions.DELETE] }],
        inherits: [inheritedRole1._id, inheritedRole2._id],
      });

      const rules = await instance.getRulesInherited();
      expect(rules).toEqual([
        { ref: "test", actions: [RuleActions.DELETE] },
        { ref: "inherited1", actions: [RuleActions.CREATE] },
        { ref: "inherited2", actions: [RuleActions.UPDATE] },
      ]);
    });

    it("should return combined rules from inherited roles recursively", async () => {
      const inheritedRole1 = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "inherited1", actions: [RuleActions.CREATE] }],
      });

      const inheritedRole2 = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "inherited2", actions: [RuleActions.UPDATE] }],
        inherits: [inheritedRole1._id],
      });

      const instance = await RoleModel.create({
        slug: generateRandomString(),
        rules: [{ ref: "test", actions: [RuleActions.DELETE] }],
        inherits: [inheritedRole2._id],
      });

      const rules = await instance.getRulesInherited();
      expect(rules).toEqual([
        { ref: "test", actions: [RuleActions.DELETE] },
        { ref: "inherited2", actions: [RuleActions.UPDATE] },
        { ref: "inherited1", actions: [RuleActions.CREATE] },
      ]);
    });
  });

  describe("getFieldsRestrictionsInherited", () => {
    it("should return own fieldsRestrictions if no inherited roles", async () => {
      const instance = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "test", actions: [RuleActions.CREATE] }],
      });

      const fieldsRestrictions = await instance.getFieldsRestrictionsInherited();
      expect(fieldsRestrictions).toEqual([{ ref: "test", actions: [RuleActions.CREATE] }]);
    });

    it("should return combined fieldsRestrictions from inherited roles", async () => {
      const inheritedRole1 = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "inherited1", actions: [RuleActions.CREATE] }],
      });

      const inheritedRole2 = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "inherited2", actions: [RuleActions.UPDATE] }],
      });

      const instance = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "test", actions: [RuleActions.DELETE] }],
        inherits: [inheritedRole1._id, inheritedRole2._id],
      });

      const fieldsRestrictions = await instance.getFieldsRestrictionsInherited();
      expect(fieldsRestrictions).toEqual([
        { ref: "test", actions: [RuleActions.DELETE] },
        { ref: "inherited1", actions: [RuleActions.CREATE] },
        { ref: "inherited2", actions: [RuleActions.UPDATE] },
      ]);
    });

    it("should return combined fieldsRestrictions from inherited roles recursively", async () => {
      const inheritedRole1 = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "inherited1", actions: [RuleActions.CREATE] }],
      });

      const inheritedRole2 = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "inherited2", actions: [RuleActions.UPDATE] }],
        inherits: [inheritedRole1._id],
      });

      const instance = await RoleModel.create({
        slug: generateRandomString(),
        fieldsRestrictions: [{ ref: "test", actions: [RuleActions.DELETE] }],
        inherits: [inheritedRole2._id],
      });

      const fieldsRestrictions = await instance.getFieldsRestrictionsInherited();
      expect(fieldsRestrictions).toEqual([
        { ref: "test", actions: [RuleActions.DELETE] },
        { ref: "inherited2", actions: [RuleActions.UPDATE] },
        { ref: "inherited1", actions: [RuleActions.CREATE] },
      ]);
    });
  });
});
