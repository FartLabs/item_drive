import type { Fact } from "./fact.ts";
import type { FactQuery } from "./fact_query.ts";
import type { FactValue } from "./fact_value.ts";

/**
 * filterFact filters a fact based on the query.
 */
export function filterFact(fact: Fact, query: FactQuery): boolean {
  return (
    filterFactLabel(fact, query.label) &&
    filterFactID(fact, query) &&
    filterFactTimestamp(fact.timestamp, query) &&
    filterFactValue(fact.value, query)
  );
}

/**
 * filterFactLabel filters a fact based on the label.
 */
export function filterFactLabel(fact: Fact, label?: string): boolean {
  return label === undefined || fact.label === label;
}

/**
 * filterFactID filters a fact based on the fact ID.
 */
export function filterFactID(fact: Fact, query: FactQuery): boolean {
  if (query.itemID !== undefined) {
    if (!query.itemID.includes(fact.itemID)) {
      return false;
    }
  }

  if (query.factID !== undefined) {
    if (!query.factID.includes(fact.factID)) {
      return false;
    }
  }

  return true;
}

/**
 * filterFactTimestamp filters a fact based on the timestamp.
 */
export function filterFactTimestamp(
  timestamp: number,
  query: FactQuery,
): boolean {
  return (
    (query.createdAtOrAfter === undefined ||
      timestamp >= query.createdAtOrAfter) &&
    (query.createdAtOrBefore === undefined ||
      timestamp <= query.createdAtOrBefore)
  );
}

/**
 * filterFactValue filters a fact value based on the query.
 */
export function filterFactValue(
  factValue: FactValue,
  query: FactQuery,
): boolean {
  if (query.value !== undefined && "@value" in factValue) {
    if (!filterFactValueIncludes(factValue, query.value)) {
      return false;
    }
  }

  if (query.valueIncludes !== undefined) {
    if (!filterFactValueIncludes(factValue, query.valueIncludes)) {
      return false;
    }
  }

  if (query.valueAtOrAbove !== undefined) {
    if (!filterFactValueAtOrAbove(factValue, query.valueAtOrAbove)) {
      return false;
    }
  }

  if (query.valueAtOrBelow !== undefined) {
    if (!filterFactValueAtOrBelow(factValue, query.valueAtOrBelow)) {
      return false;
    }
  }

  return true;
}

/**
 * filterFactValueIncludes filters a fact value based on the query.
 */
export function filterFactValueIncludes(
  factValue: FactValue,
  valueIncludes: unknown,
): boolean {
  if (
    "@list" in factValue &&
    factValue["@list"] !== undefined
  ) {
    return factValue["@list"].some((value) => value === valueIncludes);
  }

  if (
    "@set" in factValue &&
    factValue["@set"] !== undefined
  ) {
    return factValue["@set"].some((value) => value === valueIncludes);
  }

  return "@value" in factValue && factValue["@value"] === valueIncludes;
}

/**
 * filterFactValueAtOrAbove filters a fact value based on the query.
 */
export function filterFactValueAtOrAbove(
  factValue: FactValue,
  valueAtOrAbove: number,
): boolean {
  if (
    "@list" in factValue &&
    factValue["@list"] !== undefined
  ) {
    return true;
  }

  if (
    "@set" in factValue &&
    factValue["@set"] !== undefined
  ) {
    return true;
  }

  return "@value" in factValue && typeof factValue["@value"] === "number" &&
    factValue["@value"] >= valueAtOrAbove;
}

/**
 * filterFactValueAtOrBelow filters a fact value based on the query.
 */
export function filterFactValueAtOrBelow(
  factValue: FactValue,
  valueAtOrBelow: number,
): boolean {
  if (
    "@list" in factValue &&
    factValue["@list"] !== undefined
  ) {
    return true;
  }

  if (
    "@set" in factValue &&
    factValue["@set"] !== undefined
  ) {
    return true;
  }

  return "@value" in factValue && typeof factValue["@value"] === "number" &&
    factValue["@value"] <= valueAtOrBelow;
}
