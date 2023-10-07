import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { fieldDecorator } from "../lib/fieldDecorator";
import { modelDecorator } from "../lib/modelDecorator";
import FieldTypes from "../enums/field-types";
import { ValidatorsDefinition } from "../types";
import ValidatorTypes from "../enums/validator-types";
import Patterns from "../enums/patterns";
import SearchConfigStatus from "../enums/search-config-status";

@modelDecorator()
class SearchConfig extends Model {
  static __name = "SearchConfig";

  static slug = "searchConfigs";
  static scope = ModelEnvScopes.ENV;
  static allowMultipleOperations = false;
  static keyField = "slug";
  static validators: ValidatorsDefinition = [
    {
      type: ValidatorTypes.REGEX,
      options: { field: "slug", pattern: Patterns.SLUG },
    },
    { type: ValidatorTypes.REQUIRED, options: { field: "source" } },
    { type: ValidatorTypes.REQUIRED, options: { field: "mappingConfig" } },
  ];

  @fieldDecorator(FieldTypes.TEXT)
  slug: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  description: FieldDefinitionText;

  @fieldDecorator(FieldTypes.TEXT)
  source: FieldDefinitionText;

  @fieldDecorator(FieldTypes.NESTED)
  filter: FieldDefinitionNested<any>;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      properties: {
        type: FieldTypes.NESTED,
      },
      settings: {
        type: FieldTypes.NESTED,
      },
    },
    validators: [
      { type: ValidatorTypes.REQUIRED, options: { field: "properties" } },
    ],
  })
  mappingConfig: FieldDefinitionNested<any>;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      defaultQuery: {
        type: FieldTypes.TEXT,
      },
      defaultFilters: {
        type: FieldTypes.NESTED,
      },
    },
  })
  queryDefaults: FieldDefinitionNested<any>;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      tokenizer: {
        type: FieldTypes.TEXT,
      },
      filter: {
        type: FieldTypes.TEXT,
      },
      charFilter: {
        type: FieldTypes.TEXT,
      },
    },
  })
  customAnalyzers: FieldDefinitionNested<any>;

  @fieldDecorator(FieldTypes.NESTED, {
    fields: {
      field: {
        type: FieldTypes.TEXT,
      },
      weight: {
        type: FieldTypes.NUMBER,
      },
    },
  })
  boostingFields: FieldDefinitionNested<any>;

  @fieldDecorator(FieldTypes.TEXT, {
    options: Object.values(SearchConfigStatus),
    strict: true,
    default: SearchConfigStatus.PENDING,
  })
  _status: FieldDefinitionText<{
    options: Array<SearchConfigStatus>;
    strict: true;
  }>;
}

export default SearchConfig;
