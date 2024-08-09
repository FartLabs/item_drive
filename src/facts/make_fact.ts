import { ulid } from "@std/ulid";
import type { Fact } from "./fact.ts";
import type { PartialFact } from "./partial_fact.ts";

/**
 * makeFact makes a fully-qualified fact from a partial fact.
 */
export function makeFact(fact: PartialFact, date: Date = new Date()): Fact {
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
