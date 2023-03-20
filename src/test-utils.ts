import Adapter from "./lib/Adapter";
import {
  AdapterFetcher,
  AdapterFetcherModelDefinition,
  FieldsDefinition,
  ValidatorsDefinition,
} from "./types";
import ModelList from "./lib/ModelList";
import FieldTypes from "./enums/field-types";
import ModelEnvScopes from "./enums/model-env-scopes";
import Model from "./lib/Model";
import ValidatorTypes from "./enums/validator-types";
import defaultFieldsMap from "./lib/defaultFieldsMap";
import defaultValidatorsMap from "./lib/defaultValidatorsMap";

const cache: Map<typeof Model, Set<any>> = new Map();

export const mockAdapter = ({
  fieldsMap = defaultFieldsMap,
  validatorsMap = {
    ...defaultValidatorsMap,
    [ValidatorTypes.UNIQUE]: null,
  },
  modelDefinition = {
    fields: {
      title: {
        type: FieldTypes.TEXT,
        options: { default: "test" },
      },
    },
    validators: [
      {
        type: ValidatorTypes.SAMPLE,
        options: {
          field: "title",
        },
      },
    ],
  },
}: {
  fieldsMap?: Adapter["fieldsMap"];
  validatorsMap?: Adapter["validatorsMap"];
  modelDefinition?: AdapterFetcherModelDefinition;
} = {}) => {
  class MockAdapter extends Adapter {
    runValidators = true;

    get thisCache(): Set<any> {
      const cacheKey = this.model.getBaseClass();

      let cacheModel = cache.get(cacheKey);
      if (!cacheModel) {
        cacheModel = new Set(
          Array(5)
            .fill(null)
            .map(() => new this.model())
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
          return cache.find((r) => r._id === query);
        }

        let found = cache[0];

        if (query.filter) {
          const filterEntries = Object.entries(query.filter);
          found = cache.find((r) =>
            filterEntries.every(([key, value]) => r.__doc[key] === value)
          );
        }

        return Promise.resolve(found);
      }),
      getList: jest.fn(([query]) => {
        return Promise.resolve(
          new ModelList(this.model, Array.from(this.thisCache), 1)
        );
      }),
      createOne: jest.fn(async ([payload]) => {
        const i = new this.model(payload);
        this.thisCache.add(i);
        return Promise.resolve(i);
      }),
      createMultiple: jest.fn(([payload]) => {
        const created = payload.map((p) => new this.model(p));
        created.forEach((i) => this.thisCache.add(i));
        return Promise.resolve(created);
      }),
      updateOne: jest.fn(([query, update]) => {
        if (!query || !update) {
          return Promise.resolve(null);
        }

        const [first] = Array.from(this.thisCache);

        if (update.$set) {
          Object.assign(first.__doc, update.$set);
        }

        if (update.$unset) {
          Object.keys(update.$unset).forEach((key) => {
            delete first.__doc[key];
          });
        }

        return Promise.resolve(first);
      }),
      updateMultiple: jest.fn(([query, update]) => {
        if (!query || !update) {
          return Promise.resolve(null);
        }

        const list = Array.from(this.thisCache);

        if (update.$set) {
          list.forEach((i) => Object.assign(i.__doc, update.$set));
        }

        if (update.$unset) {
          list.forEach((i) => {
            Object.keys(update.$unset).forEach((key) => {
              delete i.__doc[key];
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

        const ids = Array.from(this.thisCache).map((i) => i._id);
        this.thisCache.clear();
        return Promise.resolve(ids);
      }),
      getModelDefinition: jest.fn(() => {
        return Promise.resolve(modelDefinition);
      }),
    };

    fieldsMap = fieldsMap;

    validatorsMap = validatorsMap;
  }

  return MockAdapter;
};

export const mockModel = ({
  scope = ModelEnvScopes.ENV,
  fields = {},
  validators = [],
}: {
  scope?: ModelEnvScopes;
  fields?: FieldsDefinition;
  validators?: ValidatorsDefinition;
} = {}) => {
  const uidSlug = Math.random().toString(36).substring(7);

  class Test extends Model {
    static extendable = true;
    static slug = uidSlug;
    static scope = scope;
    static fields = fields;
    static validators = validators;

    constructor(doc) {
      super(doc);

      this.defineFieldsProperties();
    }

    [slug: string]: any;
  }

  return Test;
};
