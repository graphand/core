import Model from "../lib/Model";
import ModelEnvScopes from "../enums/model-env-scopes";
declare class Terms extends Model {
    static __name: string;
    static slug: string;
    static scope: ModelEnvScopes;
    introduction: FieldDefinitionText;
    service: FieldDefinitionText;
    privacy: FieldDefinitionText;
    security: FieldDefinitionText;
    payment: FieldDefinitionText;
    legal: FieldDefinitionText;
}
export default Terms;
