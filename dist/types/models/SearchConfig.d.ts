import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
import Job from "./Job";
declare class SearchConfig extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    static allowMultipleOperations: boolean;
    slug: FieldDefinitionText;
    description: FieldDefinitionText;
    source: FieldDefinitionText;
    filter: FieldDefinitionNested<any>;
    properties: FieldDefinitionNested<any>;
    analysis: FieldDefinitionNested<any>;
    _job: FieldDefinitionRelation<Job>;
}
export default SearchConfig;
