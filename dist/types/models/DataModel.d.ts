import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
declare class DataModel extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    name: FieldDefinitionText;
    slug: FieldDefinitionText;
    definition: FieldDefinitionNested<ModelDefinition>;
    _doc: FieldDefinitionNested<Record<string, any>>;
}
export default DataModel;
