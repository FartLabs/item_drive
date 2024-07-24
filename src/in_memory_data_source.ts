import type { DataSourceInterface } from "./interfaces.ts";
import type { Fact, FactQuery, PartialFact } from "./fact.ts";
import { checkFact, makeFact } from "./fact.ts";

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
  public async fetchFacts(query?: FactQuery): Promise<Fact[]> {
    const result: Fact[] = [];
    if (query !== undefined) {
      // Add all facts that match the query by factID.
      result.push(...(await Promise.all(
        query.factID?.map((factID) => this.fetchFact(factID)) ?? [],
      )).filter((fact) => checkFact(fact, query)));

      // Add all facts that match the query by itemID.
      result.push(
        ...query.itemID?.flatMap((itemID) =>
          Array.from(this.factsByItemID.get(itemID)?.values() ?? [])
            .filter((fact) => checkFact(fact, query))
        ) ?? [],
      );
    }

    // Add all facts that match the query by properties if no itemID or factID is specified.
    if (
      query?.itemID === undefined && query?.factID === undefined
    ) {
      for (const facts of this.factsByItemID.values()) {
        result.push(
          ...Array.from(facts.values()).filter((fact) =>
            query === undefined || query.facts === undefined ||
            checkFact(fact, query)
          ),
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
