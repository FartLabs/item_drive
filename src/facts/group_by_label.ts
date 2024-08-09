/**
 * groupByOptionalLabel groups facts by their label and omits undefined groups.
 */
export function groupByOptionalLabel<T extends { label?: string }>(
  facts: T[],
): FactGroups<T & { label: string }> {
  const factGroups = groupByLabel(facts as (T & { label: string })[]);
  delete factGroups["undefined"];
  return factGroups;
}

/**
 * groupByLabel groups facts by their label.
 */
export function groupByLabel<T extends { label: string }>(
  facts: T[],
): FactGroups<T> {
  return Object.groupBy(facts, (fact) => fact.label);
}

/**
 * FactGroups is the result of groupByLabel.
 */
export type FactGroups<T extends { label: string }> = Record<
  string,
  T[] | undefined
>;
