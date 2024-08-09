import { assertEquals } from "@std/assert";
import { makeItem } from "./make_item.ts";

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
    { facts: [{ label: "name", value: { "@value": "Ethan" } }] },
    date,
  );
  assertEquals(item.facts.length, 1);
  assertEquals(item.facts[0].label, "name");
  assertEquals(item.facts[0].value, { "@value": "Ethan" });
  assertEquals(item.facts[0].timestamp, date.getTime());
});

Deno.test("makeItem makes facts from an item", () => {
  const date = new Date(0);
  const item = makeItem(
    {
      itemID: "1",
      facts: [{ label: "name", value: { "@value": "Ethan" } }],
    },
    date,
  );
  assertEquals(item.facts.length, 1);
  assertEquals(item.facts[0].itemID, "1");
  assertEquals(item.facts[0].label, "name");
  assertEquals(item.facts[0].value, { "@value": "Ethan" });
  assertEquals(item.facts[0].timestamp, date.getTime());
});

Deno.test("makeItem makes facts from an item with multiple facts", () => {
  const date = new Date(0);
  const item = makeItem(
    {
      itemID: "1",
      facts: [
        { label: "name", value: { "@value": "Ethan" } },
        {
          label: "birthday",
          value: { "@value": new Date("2001-03-24").toISOString() },
        },
      ],
    },
    date,
  );
  assertEquals(item.facts.length, 2);
  assertEquals(item.facts[0].itemID, "1");
  assertEquals(item.facts[0].label, "name");
  assertEquals(item.facts[0].value, { "@value": "Ethan" });
  assertEquals(item.facts[0].timestamp, date.getTime());
  assertEquals(item.facts[1].itemID, "1");
  assertEquals(item.facts[1].label, "birthday");
  assertEquals(item.facts[1].value, {
    "@value": new Date("2001-03-24").toISOString(),
  });
  assertEquals(item.facts[1].timestamp, date.getTime());
});

Deno.test("makeItem gets itemID from item", () => {
  const date = new Date(0);
  const item = makeItem(
    {
      itemID: "item-1",
      facts: [
        {
          itemID: "item-2",
          label: "name",
          value: { "@value": "Note" },
        },
      ],
    },
    date,
  );
  assertEquals(item.facts.length, 1);
  assertEquals(item.facts[0].itemID, "item-1");
  assertEquals(item.facts[0].label, "name");
  assertEquals(item.facts[0].value, { "@value": "Note" });
});
