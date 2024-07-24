import { ulid } from "@std/ulid";
import type { Fact, PartialFact } from "./fact.ts";
import { makeFact } from "./fact.ts";

export type PartialItem =
  & Omit<Partial<Item>, "facts">
  & { facts?: PartialFact[] };

export interface Item {
  itemID: string;
  facts: Fact[];
}

export const DEFAULT_ITEM_TYPE = "empty" as const satisfies string;

export function makeItem(
  partialItem: PartialItem,
  date = new Date(),
): Item {
  const itemID = partialItem.itemID ?? ulid(date.getTime());
  const facts = (partialItem.facts ?? []).map((partialFact) =>
    makeFact(
      { ...partialFact, itemID },
      date,
    )
  );
  return { itemID, facts };
}

export function factsFrom(
  partialItem: PartialItem,
  date = new Date(),
): Fact[] {
  const itemID = partialItem.itemID ?? ulid(date.getTime());
  return partialItem.facts?.map((partialFact) =>
    makeFact({ ...partialFact, itemID }, date)
  ) ?? [];
}
