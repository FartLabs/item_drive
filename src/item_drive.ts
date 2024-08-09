import type { ItemDriveInterface } from "./item_drive_interface.ts";
import type { DataSourceInterface } from "./data_sources/data_source_interface.ts";
import type { FactQuery } from "./facts/fact_query.ts";
import type { Item, PartialItem } from "./items/mod.ts";
import { makeItem } from "./items/mod.ts";
import { groupByOptionalProperty } from "./facts/group_by_property.ts";

/**
 * ItemDrive manages the items in the drive.
 */
export class ItemDrive implements ItemDriveInterface {
  public constructor(private dataSource: DataSourceInterface) {}

  public async insertItem(partialItem: PartialItem): Promise<Item> {
    const item = makeItem(partialItem);
    await this.dataSource.insertFacts(item.facts);
    return item;
  }

  public async insertItems(partialItems: PartialItem[]): Promise<Item[]> {
    const items = partialItems.map((partialItem) => makeItem(partialItem));
    return await Promise.all(items.map((item) => this.insertItem(item)));
  }

  public async fetchItems(query?: FactQuery[]): Promise<Item[]> {
    // 1st pass gathers all of the itemIDs that match the query.
    const itemIDs = await this.fetchItemIDs(query);

    // 2nd pass fetches the items by their itemIDs.
    return await Promise.all(
      Array.from(itemIDs).map(async (itemID) => {
        const item = await this.fetchItem(itemID);
        if (item === null) {
          throw new Error(`Item ${itemID} not found`);
        }

        return item;
      }),
    );
  }

  public fetchItem(itemID: string): Promise<Item | null> {
    return this.dataSource.fetchFacts([{ itemID: [itemID] }])
      .then((facts) => {
        if (facts.length === 0) {
          return null;
        }

        return makeItem({ itemID, facts });
      });
  }

  private async fetchItemIDs(query?: FactQuery[]): Promise<string[]> {
    if (query === undefined) {
      return Array.from(
        new Set(
          (await this.dataSource.fetchFacts()).map((fact) => fact.itemID),
        ),
      );
    }

    const itemIDs = await Promise.all(
      Object.values(groupByOptionalProperty(query))
        .map(
          async (propertyQuery) =>
            new Set(
              (await this.dataSource.fetchFacts(propertyQuery))
                .map((fact) => fact.itemID),
            ),
        ),
    );

    return Array.from(toIntersection(itemIDs));
  }
}

/**
 * toIntersection returns the intersection of the given sets.
 */
export function toIntersection<T>(sets: Set<T>[]): Set<T> {
  if (sets.length === 0) {
    return new Set();
  }

  return sets.reduce((intersection, set) => intersection.intersection(set));
}
