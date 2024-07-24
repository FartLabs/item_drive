import { assertEquals } from "@std/assert";
import { factsFrom, makeItem } from "./item.ts";

Deno.test("makeItem makes an item", () => {
  const date = new Date(0);
  const item = makeItem({}, date);
  assertEquals(item.facts.length, 0);
});

Deno.test("makeItem makes an item from an itemID and", () => {
  const date = new Date(0);
  const item = makeItem({ itemID: "1" }, date);
  assertEquals(item.itemID, "1");
});

Deno.test("makeItem makes an item with facts", () => {
  const date = new Date(0);
  const item = makeItem(
    { facts: [{ property: "name", value: { "@value": "Ethan" } }] },
    date,
  );
  assertEquals(item.facts.length, 1);
  assertEquals(item.facts[0].property, "name");
  assertEquals(item.facts[0].value, { "@value": "Ethan" });
  assertEquals(item.facts[0].timestamp, date.getTime());
});

Deno.test("factsFrom makes facts from an item", () => {
  const date = new Date(0);
  const item = makeItem(
    {
      itemID: "1",
      facts: [{ property: "name", value: { "@value": "Ethan" } }],
    },
    date,
  );
  const facts = factsFrom(item);
  assertEquals(facts.length, 1);
  assertEquals(facts[0].itemID, "1");
  assertEquals(facts[0].property, "name");
  assertEquals(facts[0].value, { "@value": "Ethan" });
  assertEquals(facts[0].timestamp, date.getTime());
});

Deno.test("factsFrom makes facts from an item with multiple facts", () => {
  const date = new Date(0);
  const item = makeItem(
    {
      itemID: "1",
      facts: [
        { property: "name", value: { "@value": "Ethan" } },
        {
          property: "birthday",
          value: { "@value": new Date("2001-03-24").toISOString() },
        },
      ],
    },
    date,
  );
  const facts = factsFrom(item);
  assertEquals(facts.length, 2);
  assertEquals(facts[0].itemID, "1");
  assertEquals(facts[0].property, "name");
  assertEquals(facts[0].value, { "@value": "Ethan" });
  assertEquals(facts[0].timestamp, date.getTime());
  assertEquals(facts[1].itemID, "1");
  assertEquals(facts[1].property, "birthday");
  assertEquals(facts[1].value, {
    "@value": new Date("2001-03-24").toISOString(),
  });
  assertEquals(facts[1].timestamp, date.getTime());
});

Deno.test("factsFrom gets property's itemID from item", () => {
  const date = new Date(0);
  const item = makeItem(
    {
      itemID: "item-1",
      facts: [
        {
          itemID: "item-2",
          property: "name",
          value: { "@value": "Note" },
        },
      ],
    },
    date,
  );
  const facts = factsFrom(item);
  assertEquals(facts.length, 1);
  assertEquals(facts[0].itemID, "item-1");
  assertEquals(facts[0].property, "name");
  assertEquals(facts[0].value, { "@value": "Note" });
});
