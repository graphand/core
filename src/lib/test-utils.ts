import Adapter from "@/lib/Adapter";
import { AdapterFetcher, FieldsDefinition, ValidatorsDefinition } from "@/types";
import ModelList from "@/lib/ModelList";
import FieldTypes from "@/enums/field-types";
import ModelEnvScopes from "@/enums/model-env-scopes";
import Model from "@/lib/Model";
import ValidatorTypes from "@/enums/validator-types";
import defaultFieldsMap from "@/lib/defaultFieldsMap";
import defaultValidatorsMap from "@/lib/defaultValidatorsMap";
import { defineFieldsProperties } from "@/lib/utils";
import Validator from "@/lib/Validator";

const cache: Map<typeof Model, Set<Model>> = new Map();

export const mockAdapter = ({
  fieldsMap = defaultFieldsMap,
  validatorsMap = {
    ...defaultValidatorsMap,
    [ValidatorTypes.SAMPLE]: class ValidatorSample extends Validator<ValidatorTypes.SAMPLE> {
      async validate() {
        return true;
      }
    },
  },
}: {
  fieldsMap?: Adapter["fieldsMap"];
  validatorsMap?: Adapter["validatorsMap"];
} = {}) => {
  class MockAdapter extends Adapter {
    runValidators = true;

    get thisCache(): Set<Model> {
      const cacheKey = this.model.getBaseClass();

      let cacheModel = cache.get(cacheKey);
      if (!cacheModel) {
        cacheModel = new Set(
          Array(5)
            .fill(null)
            .map(() => new this.model()),
        );

        cache.set(cacheKey, cacheModel);
      }

      return cacheModel;
    }

    fetcher: AdapterFetcher = {
      count: jest.fn(() => Promise.resolve(this.thisCache.size)),
      get: jest.fn(([query]) => {
        if (!query) {
          return Promise.resolve(null);
        }

        const cache = Array.from(this.thisCache);

        if (typeof query === "string") {
          return Promise.resolve(cache.find(r => r._id === query));
        }

        let found = cache[0];

        if (query.filter) {
          const filterEntries = Object.entries(query.filter);
          found = cache.find(r => filterEntries.every(([key, value]) => r.get(key) === value));
        }

        return Promise.resolve(found);
      }),
      getList: jest.fn(() => {
        return Promise.resolve(new ModelList(this.model, Array.from(this.thisCache)));
      }),
      createOne: jest.fn(async ([payload]) => {
        const i = new this.model(payload);
        this.thisCache.add(i);
        return Promise.resolve(i);
      }),
      createMultiple: jest.fn(([payload]) => {
        const created = payload.map(p => new this.model(p));
        created.forEach(i => this.thisCache.add(i));
        return Promise.resolve(created);
      }),
      updateOne: jest.fn(([query, update]) => {
        if (!query || !update) {
          return Promise.resolve(null);
        }

        let found;

        const cache = Array.from(this.thisCache);

        if (typeof query === "string") {
          found = cache.find(r => r._id === query);
        } else {
          found = cache[0];

          if (query.filter) {
            const filterEntries = Object.entries(query.filter);
            found = cache.find(r =>
              filterEntries.every(([key, value]) => r.getDoc()[key] === value),
            );
          }
        }

        if (!found) {
          return Promise.resolve(null);
        }

        if (update.$set) {
          Object.assign(found.getDoc(), update.$set);
        }

        if (update.$unset) {
          Object.keys(update.$unset).forEach(key => {
            delete found.getDoc()[key];
          });
        }

        return Promise.resolve(found);
      }),
      updateMultiple: jest.fn(([query, update]) => {
        if (!query || !update) {
          return Promise.resolve(null);
        }

        const list = Array.from(this.thisCache);

        if (update.$set) {
          list.forEach(i => Object.assign(i.getDoc(), update.$set));
        }

        if (update.$unset) {
          list.forEach(i => {
            Object.keys(update.$unset).forEach(key => {
              delete i.getDoc()[key];
            });
          });
        }

        return Promise.resolve(list);
      }),
      deleteOne: jest.fn(([query]) => {
        if (!query) {
          return Promise.resolve(null);
        }

        const [first] = Array.from(this.thisCache);
        this.thisCache.delete(first);
        return Promise.resolve(true);
      }),
      deleteMultiple: jest.fn(([query]) => {
        if (!query) {
          return Promise.resolve(null);
        }

        const ids = Array.from(this.thisCache).map(i => i._id);
        this.thisCache.clear();
        return Promise.resolve(ids);
      }),
    };

    fieldsMap = fieldsMap;
    validatorsMap = validatorsMap;
  }

  return MockAdapter;
};

export const mockModel = ({
  slug,
  extendsModel = Model,
  scope = ModelEnvScopes.ENV,
  allowMultipleOperations = true,
  extensible = false,
  single = false,
  fields = {
    title: {
      type: FieldTypes.TEXT,
      options: { default: "test" },
    },
  },
  validators = [
    {
      type: ValidatorTypes.SAMPLE,
      options: {
        field: "title",
      },
    },
  ],
}: {
  slug?: string;
  extendsModel?: typeof Model;
  scope?: ModelEnvScopes;
  allowMultipleOperations?: boolean;
  extensible?: boolean;
  fields?: FieldsDefinition;
  validators?: ValidatorsDefinition;
  single?: boolean;
} = {}) => {
  slug ??= "a" + Math.random().toString(36).substring(7);

  class Test extends extendsModel {
    static extensible = extensible;
    static slug = slug;
    static scope = scope;
    static allowMultipleOperations = allowMultipleOperations;
    static definition = {
      single,
      keyField: undefined,
      fields,
      validators,
    };

    constructor(doc) {
      super(doc);

      defineFieldsProperties(this);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [slug: string]: any;
  }

  return Test;
};

export const generateRandomString = () => {
  return "a" + Math.random().toString(36).substring(7);
};
