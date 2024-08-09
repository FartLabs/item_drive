import { ulid } from "@std/ulid";
import type { Fact } from "./fact.ts";
import type { PartialFact } from "./partial_fact.ts";

/**
 * makeFact makes a fully-qualified fact from a partial fact.
 */
export function makeFact(fact: PartialFact, date = new Date()): Fact {
  if (fact.label === undefined) {
    throw new Error("Label is required");
  }

  if (fact.value === undefined) {
    throw new Error("Value is required");
  }

  const timestamp = fact.timestamp ?? date.getTime();
  return {
    timestamp,
    label: fact.label,
    value: fact.value,
    factID: fact.factID ?? ulid(timestamp),
    itemID: fact.itemID ?? ulid(timestamp),
  };
}
