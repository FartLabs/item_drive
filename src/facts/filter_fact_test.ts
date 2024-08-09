import { assertEquals } from "@std/assert";
import { filterFact } from "./filter_fact.ts";
import { makeFact } from "./make_fact.ts";

Deno.test("filterFact returns true if fact matches query by itemID and factID", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(filterFact(fact, { itemID: [fact.itemID] }), true);
  assertEquals(filterFact(fact, { factID: [fact.factID] }), true);
});

Deno.test("filterFact returns false if fact does not match query by itemID and factID", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(filterFact(fact, { itemID: ["Not Ethan"] }), false);
  assertEquals(filterFact(fact, { factID: ["Not Ethan"] }), false);
});

Deno.test("filterFact returns false if fact does not match query by factID", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(filterFact(fact, { factID: ["Not Ethan"] }), false);
});

Deno.test("filterFact returns true if fact matches query by label", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(filterFact(fact, { label: "name" }), true);
});

Deno.test("filterFact returns false if fact does not match query by label", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(
    filterFact(fact, { label: "age" }),
    false,
  );
});

Deno.test("filterFact returns true if fact matches query by value", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(
    filterFact(
      fact,
      { label: "name", value: "Ethan" },
    ),
    true,
  );
});

Deno.test("filterFact returns false if fact does not match query by value", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(
    filterFact(
      fact,
      { label: "name", value: { "@value": "Not Ethan" } },
    ),
    false,
  );
});

Deno.test("filterFact returns true if fact matches query by valueIncludesAtOrAbove", () => {
  const fact = makeFact({
    label: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    filterFact(
      fact,
      { label: "age", valueAtOrAbove: 10 },
    ),
    true,
  );
});

Deno.test("filterFact returns false if fact does not match query by valueIncludesAtOrAbove", () => {
  const fact = makeFact({
    label: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    filterFact(
      fact,
      { label: "age", valueAtOrAbove: 11 },
    ),
    false,
  );
});

Deno.test("filterFact returns true if fact matches query by valueIncludesAtOrBelow", () => {
  const fact = makeFact({
    label: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    filterFact(
      fact,
      { label: "age", valueAtOrBelow: 10 },
    ),
    true,
  );
});

Deno.test("filterFact returns false if fact does not match query by valueIncludesAtOrBelow", () => {
  const fact = makeFact({
    label: "age",
    value: { "@value": 10 },
  });
  assertEquals(
    filterFact(
      fact,
      { label: "age", valueAtOrBelow: 9 },
    ),
    false,
  );
});

Deno.test("filterFact returns true if fact matches query by createdAtOrAfter", () => {
  const date = new Date(0);
  const fact = makeFact(
    { label: "name", value: { "@value": "Ethan" } },
    date,
  );
  assertEquals(
    filterFact(
      fact,
      {
        label: "name",
        createdAtOrAfter: date.getTime(),
      },
    ),
    true,
  );
});

Deno.test("filterFact returns false if fact does not match query by createdAtOrAfter", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(
    filterFact(
      fact,
      {
        label: "name",
        createdAtOrAfter: fact.timestamp + 1,
      },
    ),
    false,
  );
});

Deno.test("filterFact returns true if fact matches query by createdAtOrBefore", () => {
  const date = new Date(0);
  const fact = makeFact(
    { label: "name", value: { "@value": "Ethan" } },
    date,
  );
  assertEquals(
    filterFact(
      fact,
      {
        label: "name",
        createdAtOrBefore: date.getTime(),
      },
    ),
    true,
  );
});

Deno.test("filterFact returns false if fact does not match query by createdAtOrBefore", () => {
  const fact = makeFact({ label: "name", value: { "@value": "Ethan" } });
  assertEquals(
    filterFact(
      fact,
      {
        label: "name",
        createdAtOrBefore: fact.timestamp - 1,
      },
    ),
    false,
  );
});
