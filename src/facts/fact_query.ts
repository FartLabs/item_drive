/**
 * FactQuery is a query object that can be used to filter a fact.
 */
export interface FactQuery {
  property?: string;
  factID?: string[];
  itemID?: string[];
  value?: unknown;
  valueIncludes?: unknown;
  valueAtOrAbove?: number;
  valueAtOrBelow?: number;
  createdAtOrAfter?: number;
  createdAtOrBefore?: number;
}
