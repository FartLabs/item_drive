import type { Item } from "./items/item.ts";
import type { PartialItem } from "./items/partial_item.ts";
import type { FactQuery } from "./facts/fact_query.ts";

export interface ItemDriveInterface {
  insertItem(item: PartialItem): Promise<Item>;
  insertItems(items: PartialItem[]): Promise<Item[]>;
  fetchItems(query?: FactQuery[]): Promise<Item[]>;
  fetchItem(itemID: string): Promise<Item | null>;
}
