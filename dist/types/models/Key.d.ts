import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
declare class Key extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static scope: ModelEnvScopes;
    name: FieldDefinitionText;
    value: FieldDefinitionDate;
}
export default Key;
