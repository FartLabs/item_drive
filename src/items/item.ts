import type { Fact } from "#/facts/fact.ts";

/**
 * Item represents a single item in the drive.
 */
export interface Item {
  /**
   * itemID is a unique identifier for the item.
   */
  itemID: string;

  /**
   * facts are the facts associated with the item ID.
   */
  facts: Fact[];
}
