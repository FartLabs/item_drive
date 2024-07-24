import { ulid } from "@std/ulid";

export type PartialFact = Partial<Fact>;

export interface Fact {
  factID: string;
  itemID: string;
  property: string;
  timestamp: number;
  value: FactValue;
}

export type FactValue =
  | FactValueValue
  | FactValueID
  | FactValueList
  | FactValueSet;

export interface FactValueValue {
  "@value": unknown;
}

export interface FactValueID {
  "@id": string;
}

export interface FactValueList {
  "@list": FactValue[];
}

export interface FactValueSet {
  "@set": FactValue[];
}

export function makeFact(fact: PartialFact, date = new Date()): Fact {
  if (fact.property === undefined) {
    throw new Error("Property is required");
  }

  if (fact.value === undefined) {
    throw new Error("Value is required");
  }

  const timestamp = fact.timestamp ?? date.getTime();
  return {
    timestamp,
    property: fact.property,
    value: fact.value,
    factID: fact.factID ?? ulid(timestamp),
    itemID: fact.itemID ?? ulid(timestamp),
  };
}

export interface FactQuery {
  itemID?: string[];
  factID?: string[];
  facts?: PropertyQuery[];
}

export interface PropertyQuery {
  property: string;
  value?: unknown;
  valueIncludes?: unknown;
  valueAtOrAbove?: number;
  valueAtOrBelow?: number;
  createdAtOrAfter?: number;
  createdAtOrBefore?: number;
}

export function checkFact<T = unknown>(
  fact: Fact,
  query: FactQuery,
): boolean {
  return (
    (query.itemID === undefined || query.itemID.includes(fact.itemID)) &&
    (query.factID === undefined || query.factID.includes(fact.factID)) &&
    (query.facts === undefined ||
      query.facts.every((q) => (fact.property === q.property &&
        (q.createdAtOrAfter === undefined ||
          fact.timestamp >= q.createdAtOrAfter) &&
        (q.createdAtOrBefore === undefined ||
          fact.timestamp <= q.createdAtOrBefore) &&
        checkFactValue(fact.value, q))
      ))
  );
}

export function checkFactValue<T = unknown>(
  value: FactValue,
  query: PropertyQuery,
): boolean {
  if (query.value !== undefined) {
    if ("@value" in value && !(value["@value"] === query.value)) {
      return false;
    }

    if ("@id" in value && !(value["@id"] === query.value)) {
      return false;
    }
  }

  if (query.valueIncludes !== undefined) {
    if (
      "@list" in value &&
      !value["@list"].some((v) =>
        "@value" in v &&
        v["@value"] === query.valueIncludes
      )
    ) {
      return false;
    }

    if (
      "@set" in value &&
      !value["@set"].some((v) =>
        "@value" in v &&
        v["@value"] === query.valueIncludes
      )
    ) {
      return false;
    }
  }

  if (
    query.valueAtOrAbove !== undefined && "@value" in value &&
    typeof value["@value"] === "number" &&
    value["@value"] < query.valueAtOrAbove
  ) {
    return false;
  }

  if (
    query.valueAtOrBelow !== undefined && "@value" in value &&
    typeof value["@value"] === "number" &&
    value["@value"] > query.valueAtOrBelow
  ) {
    return false;
  }

  return true;
}
