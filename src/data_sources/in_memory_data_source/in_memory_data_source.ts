import type { DataSourceInterface } from "#/data_sources/data_source_interface.ts";
import type { Fact } from "#/facts/fact.ts";
import type { FactQuery } from "#/facts/fact_query.ts";
import type { PartialFact } from "#/facts/partial_fact.ts";
import { makeFact } from "#/facts/make_fact.ts";
import { filterFact } from "#/facts/filter_fact.ts";

export class InMemoryDataSource implements DataSourceInterface {
  public constructor(
    public factsByItemID: Map<string, Map<string, Fact>> = new Map(),
    public itemIDByFactID: Map<string, string> = new Map(),
  ) {}

  public insertFact(partialFact: PartialFact): Promise<Fact> {
    const fact = makeFact(partialFact);
    const allFacts = this.factsByItemID.get(fact.itemID) ?? new Map();
    this.factsByItemID.set(fact.itemID, allFacts.set(fact.factID, fact));
    this.itemIDByFactID.set(fact.factID, fact.itemID);
    return Promise.resolve(fact);
  }

  public async insertFacts(facts: PartialFact[]): Promise<Fact[]> {
    const timestamp = (new Date()).getTime();
    return await Promise.all(facts.map((fact) =>
      this.insertFact({
        ...fact,
        timestamp: fact.timestamp ?? timestamp,
      })
    ));
  }

  // TODO: Update the query system to include additive property queries.
  public async fetchFacts(query?: FactQuery[]): Promise<Fact[]> {
    const result: Fact[] = [];

    // Add all facts that match the query by factID.
    const factID = Array.from(
      new Set(query?.flatMap((q) => q.factID ?? [])),
    );
    result.push(
      ...(await Promise.all(
        factID.map((factID) => this.fetchFact(factID)),
      )).filter((fact) => query?.some((q) => filterFact(fact, q))) ?? [],
    );

    // Add all facts that match the query by itemID.
    const itemID = Array.from(
      new Set(query?.flatMap((q) => q.itemID ?? [])),
    );
    result.push(
      ...itemID.flatMap((itemID) =>
        Array.from(this.factsByItemID.get(itemID)?.values() ?? [])
          .filter((fact) => query?.some((q) => filterFact(fact, q)) ?? false)
      ),
    );

    if (factID.length === 0 && itemID.length === 0) {
      // Add all facts that match the query by labels if no itemID or factID is specified.
      for (const facts of this.factsByItemID.values()) {
        result.push(
          ...Array.from(facts.values())
            .filter((fact) => query?.some((q) => filterFact(fact, q)) ?? true),
        );
      }
    }

    return result;
  }

  public fetchFact(factID: string): Promise<Fact> {
    const itemID = this.itemIDByFactID.get(factID);
    if (itemID === undefined) {
      throw new Error(`Fact not found: ${factID}`);
    }

    const facts = this.factsByItemID.get(itemID);
    if (facts === undefined) {
      throw new Error(`Item not found: ${itemID}`);
    }

    const fact = facts.get(factID);
    if (fact === undefined) {
      throw new Error(`Fact not found: ${factID}`);
    }

    return Promise.resolve(fact);
  }
}
