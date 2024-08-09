import { assertEquals } from "@std/assert";
import { InMemoryDataSource } from "./in_memory_data_source.ts";

Deno.test("InMemoryDataSource stores facts", async (t) => {
  const dataSource = new InMemoryDataSource();
  await t.step("insert a fact", async () => {
    await dataSource.insertFact({
      factID: "1",
      label: "name",
      value: { "@value": "Ethan" },
    });
  });

  await t.step("insert more facts", async () => {
    await dataSource.insertFacts([
      {
        factID: "2",
        label: "name",
        value: { "@value": "Ash" },
      },
      {
        factID: "3",
        label: "name",
        value: { "@value": "Dawn" },
      },
    ]);
  });

  await t.step("fetch the fact", async () => {
    const fact = await dataSource.fetchFact("1");
    assertEquals(fact.label, "name");
    assertEquals(fact.value, { "@value": "Ethan" });
  });

  await t.step("fetch all facts", async () => {
    const facts = await dataSource.fetchFacts();
    assertEquals(facts.length, 3);
    assertEquals(facts[0].factID, "1");
    assertEquals(facts[1].factID, "2");
    assertEquals(facts[2].factID, "3");
  });

  await t.step("fetch facts by label", async () => {
    const facts = await dataSource.fetchFacts([{
      label: "name",
      value: "Ethan",
    }]);
    assertEquals(facts.length, 1);
    assertEquals(facts[0].factID, "1");
  });

  await t.step("fetch facts by missing label", async () => {
    const facts = await dataSource.fetchFacts([{
      label: "name",
      value: "Missing",
    }]);
    assertEquals(facts.length, 0);
  });

  await t.step("fetch facts by multiple labels correctly", async () => {
    const facts = await dataSource.fetchFacts([
      { label: "name", value: "Ash" },
      // The birthday fact does not exist, so it should not be fetched.
      { label: "birthday", value: new Date("1996-02-27").toISOString() },
    ]);
    assertEquals(facts.length, 1);
  });
});
