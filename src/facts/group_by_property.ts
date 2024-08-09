/**
 * groupByOptionalProperty groups facts by their property and omits undefined groups.
 */
export function groupByOptionalProperty<T extends { property?: string }>(
  facts: T[],
): FactGroups<T & { property: string }> {
  const factGroups = groupByProperty(facts as (T & { property: string })[]);
  delete factGroups["undefined"];
  return factGroups;
}

/**
 * groupByProperty groups facts by their property.
 */
export function groupByProperty<T extends { property: string }>(
  facts: T[],
): FactGroups<T> {
  return Object.groupBy(facts, (fact) => fact.property);
}

/**
 * FactGroups is the result of groupByProperty.
 */
export type FactGroups<T extends { property: string }> = Record<
  string,
  T[] | undefined
>;
