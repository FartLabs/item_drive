import type { PartialFact } from "#/facts/partial_fact.ts";
import type { Item } from "./item.ts";

/**
 * PartialItem represents a partial item, used for multiple operations.
 */
export interface PartialItem extends Omit<Partial<Item>, "facts"> {
  /**
   * facts are the facts associated with the item ID.
   */
  facts?: PartialFact[];
}
