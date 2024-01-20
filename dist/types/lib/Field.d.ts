import FieldTypes from "../enums/field-types";
import Model from "./Model";
import { CoreSerializerCtx, FieldDefinition, FieldOptions } from "../types";
declare class Field<T extends FieldTypes = FieldTypes> {
    #private;
    nextFieldEqObject: boolean;
    constructor(definition: FieldDefinition<T>, path: string);
    get type(): FieldTypes;
    get path(): string;
    get definition(): FieldDefinition<T>;
    get options(): FieldOptions<T>;
    validate(list: Array<Model>, model: typeof Model, ctx?: TransactionCtx): Promise<boolean>;
    serialize(value: any, format: string, from: Model, ctx?: SerializerCtx & CoreSerializerCtx): any;
    toJSON(): {
        type: FieldTypes;
        options: FieldOptions<T>;
        path: string;
    };
}
export default Field;
