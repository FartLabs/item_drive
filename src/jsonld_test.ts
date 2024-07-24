import { assertEquals } from "@std/assert";
import {
  convertJSONLdDocumentToItems,
  convertJSONLdNodeObjectPropertyToFact,
  convertJSONLdNodeObjectToItem,
  jsonld,
} from "./jsonld.ts";

Deno.test("convertJSONLdNodeObjectPropertyToFact makes a fact from JSON-LD property data", () => {
  assertEquals(
    convertJSONLdNodeObjectPropertyToFact("name", { "@value": "Ethan" }),
    [{
      property: "name",
      value: { "@value": "Ethan" },
    }],
  );
  assertEquals(
    convertJSONLdNodeObjectPropertyToFact("age", { "@value": 23 }),
    [{
      property: "age",
      value: { "@value": 23 },
    }],
  );
});

Deno.test("convertJSONLdNodeObjectPropertyToFact converts a JSON-LD object to a fact", async () => {
  const flattened = Object.entries(
    (await jsonld.flatten({
      "@context": {
        age: "http://schema.org/age",
        name: "http://schema.org/name",
      },
      "@graph": [
        {
          "@id": "https://example.com/ethan",
          age: 23,
          name: "Ethan",
        },
      ],
    }))![0]!,
  );

  const [value10, value11] = flattened[1];
  assertEquals(
    convertJSONLdNodeObjectPropertyToFact(value10, value11),
    [{
      property: "http://schema.org/age",
      value: { "@value": 23 },
    }],
  );

  const [value20, value21] = flattened[2];
  assertEquals(
    convertJSONLdNodeObjectPropertyToFact(value20, value21),
    [{
      property: "http://schema.org/name",
      value: { "@value": "Ethan" },
    }],
  );
});

Deno.test("convertJSONLdNodeObjectToItem makes an item from JSON-LD data", () => {
  assertEquals(
    convertJSONLdNodeObjectToItem({
      "@id": "https://example.com/ethan",
      age: { "@value": 23 },
      name: { "@value": "Ethan" },
    }),
    {
      itemID: "https://example.com/ethan",
      facts: [
        {
          property: "age",
          value: { "@value": 23 },
        },
        {
          property: "name",
          value: { "@value": "Ethan" },
        },
      ],
    },
  );
});

Deno.test("convertJSONLdNodeObjectToItem converts a JSON-LD object to an item", async () => {
  const value = Object.entries(
    await jsonld.flatten({
      "@context": {
        age: "http://schema.org/age",
        name: "http://schema.org/name",
      },
      "@graph": [
        {
          "@id": "https://example.com/ethan",
          age: 23,
          name: "Ethan",
        },
      ],
    }),
  )[0][1] as jsonld.NodeObject;
  assertEquals(
    convertJSONLdNodeObjectToItem(value),
    {
      itemID: "https://example.com/ethan",
      facts: [
        {
          property: "http://schema.org/age",
          value: { "@value": 23 },
        },
        {
          property: "http://schema.org/name",
          value: { "@value": "Ethan" },
        },
      ],
    },
  );
});

Deno.test("convertJSONLdDocumentToItems converts a JSON-LD graph to items", async () => {
  assertEquals(
    await convertJSONLdDocumentToItems(
      {
        "@context": {
          age: "http://schema.org/age",
          name: "http://schema.org/name",
        },
        "@graph": [
          {
            "@id": "https://example.com/ethan",
            age: 23,
            name: "Ethan",
          },
          {
            "@id": "https://example.com/gregory",
            age: 49,
            name: "Gregory",
          },
        ],
      },
    ),
    [
      {
        itemID: "https://example.com/ethan",
        facts: [
          {
            property: "http://schema.org/age",
            value: { "@value": 23 },
          },
          {
            property: "http://schema.org/name",
            value: { "@value": "Ethan" },
          },
        ],
      },
      {
        itemID: "https://example.com/gregory",
        facts: [
          {
            property: "http://schema.org/age",
            value: { "@value": 49 },
          },

          {
            property: "http://schema.org/name",
            value: { "@value": "Gregory" },
          },
        ],
      },
    ],
  );
});

Deno.test("convertJSONLdDocumentToItems converts a JSON-LD graph with @nest to items", async () => {
  assertEquals(
    await convertJSONLdDocumentToItems(
      {
        "@context": {
          labels: "@nest",
          main_label: { "@id": "skos:prefLabel" },
          other_label: { "@id": "skos:altLabel" },
        },
        "@graph": [
          {
            "@id": "https://example.com/resource",
            labels: {
              main_label: "This is the main label for my resource",
              other_label: "This is the other label",
            },
          },
        ],
      },
    ),
    [
      {
        itemID: "https://example.com/resource",
        facts: [
          {
            property: "skos:altLabel",
            value: { "@value": "This is the other label" },
          },
          {
            property: "skos:prefLabel",
            value: { "@value": "This is the main label for my resource" },
          },
        ],
      },
    ],
  );
});

Deno.test("checkSupportability returns true if all facts are supported", async () => {
  // const dataSource = new InMemoryDataSource();
  // const itemDrive = new ItemDrive(dataSource);
  // const jsonld = await fetch(
  //   "https://schema.org/version/latest/schemaorg-current-https.jsonld",
  // ).then((res) => res.json());
  // const items = await convertJSONLdDocumentToItems(jsonld);
  // await itemDrive.insertItems(items);
  // const supports = await checkSupportability(
  //   itemDrive,
  //   [
  //     makeFact({
  //       itemID: "https://example.com/ethan",
  //       property: "@type",
  //       value: { "@id": "https://schema.org/Person" },
  //     }),
  //     makeFact({
  //       itemID: "https://example.com/ethan",
  //       property: "https://schema.org/name",
  //       value: { "@value": "Ethan" },
  //     }),
  //   ],
  // );
});
