import type { FactValue } from "./fact_value.ts";

/**
 * Fact represents a fact in the system.
 */
export interface Fact {
  factID: string;
  itemID: string;
  property: string;
  timestamp: number;
  value: FactValue;

  // TODO: Add discardedAt field to signify when the fact was deleted and
  // signal that it should be ignored.
}
