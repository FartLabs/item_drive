import type { Fact } from "./facts/fact.ts";
import type { FactQuery } from "./facts/fact_query.ts";
import type { PartialFact } from "./facts/partial_fact.ts";

/**
 * DataSourceInterface describes the read/write operations that are supported
 * by a data source.
 */
export interface DataSourceInterface {
  insertFact(fact: PartialFact): Promise<Fact>;
  insertFacts(facts: PartialFact[]): Promise<Fact[]>;
  fetchFacts(query?: FactQuery[]): Promise<Fact[]>;
  fetchFact(factID: string): Promise<Fact>;
}
