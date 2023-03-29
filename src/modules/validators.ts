import Model from "../lib/Model";

Model.hook(
  "after",
  "createOne",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate([res], payload.ctx);
      }
    }
  },
  -1
);

Model.hook(
  "after",
  "createMultiple",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate(res, payload.ctx);
      }
    }
  },
  -1
);

Model.hook(
  "after",
  "updateOne",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate([res], payload.ctx);
      }
    }
  },
  -1
);

Model.hook(
  "after",
  "updateMultiple",
  async function (payload) {
    if (this.__adapter.runValidators && !payload.ctx.disableValidation) {
      const res = await payload.res;

      if (res) {
        await this.validate(res, payload.ctx);
      }
    }
  },
  -1
);
