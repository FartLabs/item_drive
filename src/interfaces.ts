import type { Item, PartialItem } from "./item.ts";
import type { Fact, FactQuery, PartialFact } from "./fact.ts";

export interface ItemDriveInterface {
  insertItem(item: PartialItem): Promise<Item>;
  insertItems(items: PartialItem[]): Promise<Item[]>;
  fetchItems(query?: FactQuery): Promise<Item[]>;
  fetchItem(itemID: string): Promise<Item | null>;
}

export interface DataSourceInterface {
  insertFact(fact: PartialFact): Promise<Fact>;
  insertFacts(facts: PartialFact[]): Promise<Fact[]>;
  fetchFacts(query?: FactQuery): Promise<Fact[]>;
  fetchFact(factID: string): Promise<Fact>;
}
