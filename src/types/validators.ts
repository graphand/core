import ValidatorTypes from "@/enums/validator-types";

export type ValidatorOptionsMap = {
  [ValidatorTypes.REQUIRED]: { field: string };
  [ValidatorTypes.UNIQUE]: { field: string };
  [ValidatorTypes.KEY_FIELD]: { field: string };
  [ValidatorTypes.SAMPLE]: { field: string };
  [ValidatorTypes.LENGTH]: { field: string; min?: number; max?: number };
  [ValidatorTypes.BOUNDARIES]: { field: string; min?: number; max?: number };
  [ValidatorTypes.REGEX]: {
    field: string;
    pattern: string;
    options?: Partial<Array<"i" | "m" | "s" | "u" | "y">>;
  };
};

export type ValidatorOptionsMapOmitField = {
  [ValidatorTypes.LENGTH]: { min?: number; max?: number };
  [ValidatorTypes.BOUNDARIES]: { min?: number; max?: number };
  [ValidatorTypes.REGEX]: {
    pattern: string;
    options?: Partial<Array<"i" | "m" | "s" | "u" | "y">>;
  };
};

export type ValidatorOptions<
  T extends ValidatorTypes = keyof ValidatorOptionsMap | ValidatorTypes,
> = T extends keyof ValidatorOptionsMap ? ValidatorOptionsMap[T] : Record<string, never>;

export type ValidatorDefinition<
  T extends ValidatorTypes = keyof ValidatorOptionsMap | ValidatorTypes,
> = {
  type: T;
  options?: T extends keyof ValidatorOptionsMap ? ValidatorOptionsMap[T] : never;
};

export type ValidatorDefinitionOmitField<
  T extends ValidatorTypes = keyof ValidatorOptionsMapOmitField | ValidatorTypes,
> = {
  type: T;
  options?: T extends keyof ValidatorOptionsMapOmitField ? ValidatorOptionsMapOmitField[T] : never;
};
