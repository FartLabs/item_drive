import { assertEquals, assertThrows } from "@std/assert";
import { makeFact } from "./make_fact.ts";

Deno.test("makeFact throws error if property is missing", () => {
  assertThrows(() => makeFact({ value: { "@value": "Ethan" } }));
});

Deno.test("makeFact makes a fact from an property and value", () => {
  const date = new Date(0);
  const fact = makeFact(
    { property: "name", value: { "@value": "Ethan" } },
    date,
  );
  assertEquals(fact.property, "name");
  assertEquals(fact.value, { "@value": "Ethan" });
  assertEquals(fact.timestamp, date.getTime());
});
