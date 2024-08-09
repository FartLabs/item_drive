import { ulid } from "@std/ulid";
import { makeFact } from "#/facts/make_fact.ts";
import type { Item } from "./item.ts";
import type { PartialItem } from "./partial_item.ts";

/**
 * makeItem creates an item with the given partial item and date.
 */
export function makeItem(
  partialItem: PartialItem,
  date = new Date(),
): Item {
  const itemID = partialItem.itemID ?? ulid(date.getTime());
  return {
    itemID,
    facts: partialItem.facts?.map((partialFact) =>
      makeFact(
        { ...partialFact, itemID },
        date,
      )
    ) ?? [],
  };
}
