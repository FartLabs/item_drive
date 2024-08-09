/**
 * FactQuery is a query object that can be used to filter a fact.
 */
export interface FactQuery {
    label: string;
    id?:
        | { itemID: string[] }
        | { factID: string[] };
    value?: unknown;
    valueIncludes?: unknown;
    valueAtOrAbove?: number;
    valueAtOrBelow?: number;
    createdAtOrAfter?: number;
    createdAtOrBefore?: number;
}
