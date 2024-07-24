import { assertEquals, assertThrows } from "@std/assert";
import { checkFact, makeFact } from "./fact.ts";

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

Deno.test("checkFact returns true if fact matches query by itemID and factID", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(checkFact(fact, { itemID: [fact.itemID] }), true);
  assertEquals(checkFact(fact, { factID: [fact.factID] }), true);
});

Deno.test("checkFact returns false if fact does not match query by itemID and factID", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(checkFact(fact, { itemID: ["Not Ethan"] }), false);
  assertEquals(checkFact(fact, { factID: ["Not Ethan"] }), false);
});

Deno.test("checkFact returns false if fact does not match query by factID", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(checkFact(fact, { factID: ["Not Ethan"] }), false);
});

Deno.test("checkFact returns true if fact matches query by property", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(checkFact(fact, { facts: [{ property: "name" }] }), true);
});

Deno.test("checkFact returns false if fact does not match query by property", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(
    checkFact(
      fact,
      { facts: [{ property: "age" }] },
    ),
    false,
  );
});

Deno.test("checkFact returns true if fact matches query by value", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(
    checkFact(
      fact,
      { facts: [{ property: "name", value: "Ethan" }] },
    ),
    true,
  );
});

Deno.test("checkFact returns false if fact does not match query by value", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(
    checkFact(
      fact,
      { facts: [{ property: "name", value: { "@value": "Not Ethan" } }] },
    ),
    false,
  );
});

Deno.test("checkFact returns true if fact matches query by valueIncludesAtOrAbove", () => {
  const fact = makeFact({
    property: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    checkFact(
      fact,
      {
        facts: [{ property: "age", valueAtOrAbove: 10 }],
      },
    ),
    true,
  );
});

Deno.test("checkFact returns false if fact does not match query by valueIncludesAtOrAbove", () => {
  const fact = makeFact({
    property: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    checkFact(
      fact,
      {
        facts: [
          { property: "age", valueAtOrAbove: 11 },
        ],
      },
    ),
    false,
  );
});

Deno.test("checkFact returns true if fact matches query by valueIncludesAtOrBelow", () => {
  const fact = makeFact({
    property: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    checkFact(
      fact,
      {
        facts: [
          { property: "age", valueAtOrBelow: 10 },
        ],
      },
    ),
    true,
  );
});

Deno.test("checkFact returns false if fact does not match query by valueIncludesAtOrBelow", () => {
  const fact = makeFact({
    property: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    checkFact(
      fact,
      {
        facts: [
          { property: "age", valueAtOrBelow: 9 },
        ],
      },
    ),
    false,
  );
});

Deno.test("checkFact returns true if fact matches query by createdAtOrAfter", () => {
  const date = new Date(0);
  const fact = makeFact(
    { property: "name", value: { "@value": "Ethan" } },
    date,
  );
  assertEquals(
    checkFact(
      fact,
      {
        facts: [{
          property: "name",
          createdAtOrAfter: date.getTime(),
        }],
      },
    ),
    true,
  );
});

Deno.test("checkFact returns false if fact does not match query by createdAtOrAfter", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(
    checkFact(
      fact,
      {
        facts: [{
          property: "name",
          createdAtOrAfter: fact.timestamp + 1,
        }],
      },
    ),
    false,
  );
});

Deno.test("checkFact returns true if fact matches query by createdAtOrBefore", () => {
  const date = new Date(0);
  const fact = makeFact(
    { property: "name", value: { "@value": "Ethan" } },
    date,
  );
  assertEquals(
    checkFact(
      fact,
      {
        facts: [{
          property: "name",
          createdAtOrBefore: date.getTime(),
        }],
      },
    ),
    true,
  );
});

Deno.test("checkFact returns false if fact does not match query by createdAtOrBefore", () => {
  const fact = makeFact({ property: "name", value: { "@value": "Ethan" } });
  assertEquals(
    checkFact(
      fact,
      {
        facts: [{
          property: "name",
          createdAtOrBefore: fact.timestamp - 1,
        }],
      },
    ),
    false,
  );
});
