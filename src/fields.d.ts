import FieldTypes from "./enums/field-types";
import { FieldDefinitionOptions, DefaultFieldDefinitionOptions } from "./types";

export type FieldIdDefinition<
  D extends FieldDefinitionOptions<FieldTypes.ID> = DefaultFieldDefinitionOptions<FieldTypes.ID>
> = any;

export type FieldTextDefinition<
  D extends FieldDefinitionOptions<FieldTypes.TEXT> = DefaultFieldDefinitionOptions<FieldTypes.TEXT>
> = any;

export type FieldBooleanDefinition<
  D extends FieldDefinitionOptions<FieldTypes.BOOLEAN> = DefaultFieldDefinitionOptions<FieldTypes.BOOLEAN>
> = any;

export type FieldNumberDefinition<
  D extends FieldDefinitionOptions<FieldTypes.NUMBER> = DefaultFieldDefinitionOptions<FieldTypes.NUMBER>
> = any;

export type FieldDateDefinition<
  D extends FieldDefinitionOptions<FieldTypes.DATE> = DefaultFieldDefinitionOptions<FieldTypes.DATE>
> = any;

export type FieldJSONDefinition<
  D extends FieldDefinitionOptions<FieldTypes.JSON> = DefaultFieldDefinitionOptions<FieldTypes.JSON>
> = any;

export type FieldRelationDefinition<
  D extends FieldDefinitionOptions<FieldTypes.RELATION> = DefaultFieldDefinitionOptions<FieldTypes.RELATION>
> = any;
