import Model from "@/lib/Model";

/**
 * This module add hooks to model class to run validators on create/update actions if the adapter enables it.
 */

Model.hook(
  "after",
  "createOne",
  async function (payload) {
    if (this.getAdapter(false)?.base.runWriteValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate([res], payload.ctx);
      }
    }
  },
  { order: -1 },
);

Model.hook(
  "after",
  "createMultiple",
  async function (payload) {
    if (this.getAdapter(false)?.base.runWriteValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate(res, payload.ctx);
      }
    }
  },
  { order: -1 },
);

Model.hook(
  "after",
  "updateOne",
  async function (payload) {
    if (this.getAdapter(false)?.base.runWriteValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate([res], payload.ctx);
      }
    }
  },
  { order: -1 },
);

Model.hook(
  "after",
  "updateMultiple",
  async function (payload) {
    if (this.getAdapter(false)?.base.runWriteValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate(res, payload.ctx);
      }
    }
  },
  { order: -1 },
);
