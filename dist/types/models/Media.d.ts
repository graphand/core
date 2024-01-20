import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
import { ModelDefinition } from "../types";
declare class Media extends Model {
    static __name: string;
    static slug: string;
    static definition: ModelDefinition;
    static searchable: boolean;
    static extensible: boolean;
    static scope: ModelEnvScopes;
    name: FieldDefinitionText;
    private: FieldDefinitionBoolean;
    _mimetype: FieldDefinitionText;
    _originalname: FieldDefinitionText;
    _size: FieldDefinitionNumber;
    file: any;
}
export default Media;
