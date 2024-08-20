/**
 * getFactValueValue returns the value of a fact value.
 */
export function getFactValueValue(value: FactValue): unknown | null {
  if (!isFactValueValue(value)) {
    return null;
  }

  return value["@value"];
}

/**
 * getFactValueID returns the ID of a fact value.
 */
export function getFactValueID(value: FactValue): string | null {
  if (!isFactValueID(value)) {
    return null;
  }

  return value["@id"];
}

/**
 * getFactValueList returns the list of fact values.
 */
export function getFactValueList(value: FactValue): FactValue[] | null {
  if (!isFactValueList(value)) {
    return null;
  }

  return value["@list"];
}

/**
 * getFactValueSet returns the set of fact values.
 */
export function getFactValueSet(value: FactValue): FactValue[] | null {
  if (!isFactValueSet(value)) {
    return null;
  }

  return value["@set"];
}

/**
 * isFactValueValue returns true if the fact value is a value.
 */
export function isFactValueValue(value: FactValue): value is FactValueValue {
  return "@value" in value;
}

/**
 * isFactValueID returns true if the fact value is an ID.
 */
export function isFactValueID(value: FactValue): value is FactValueID {
  return "@id" in value;
}

/**
 * isFactValueList returns true if the fact value is a list.
 */
export function isFactValueList(value: FactValue): value is FactValueList {
  return "@list" in value;
}

/**
 * isFactValueSet returns true if the fact value is a set.
 */
export function isFactValueSet(value: FactValue): value is FactValueSet {
  return "@set" in value;
}

/**
 * FactValue is a type that represents the value of a fact.
 */
export type FactValue =
  | FactValueValue
  | FactValueID
  | FactValueList
  | FactValueSet;

/**
 * FactValueValue is a type that represents a literal value of a fact.
 */
export interface FactValueValue {
  "@value": unknown;
}

/**
 * FactValueID is a type that represents a reference to a fact value.
 */
export interface FactValueID {
  "@id": string;
}

/**
 * FactValueList is a type that represents a list of fact values.
 */
export interface FactValueList {
  "@list": FactValue[];
}

/**
 * FactValueSet is a type that represents a set of fact values.
 */
export interface FactValueSet {
  "@set": FactValue[];
}
