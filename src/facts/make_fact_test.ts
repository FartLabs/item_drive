import { assertEquals, assertThrows } from "@std/assert";
import { makeFact } from "./make_fact.ts";

Deno.test("makeFact throws error if label is missing", () => {
  assertThrows(() => makeFact({ value: { "@value": "Ethan" } }));
});

Deno.test("makeFact makes a fact from an label and value", () => {
  const date = new Date(0);
  const fact = makeFact(
    { label: "name", value: { "@value": "Ethan" } },
    date,
  );
  assertEquals(fact.label, "name");
  assertEquals(fact.value, { "@value": "Ethan" });
  assertEquals(fact.timestamp, date.getTime());
});
