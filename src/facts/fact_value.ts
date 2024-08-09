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
