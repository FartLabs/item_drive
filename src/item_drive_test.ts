import { assertEquals } from "@std/assert";
import { InMemoryDataSource } from "./in_memory_data_source.ts";
import { ItemDrive } from "./item_drive.ts";

Deno.test("ItemDrive stores items", async (t) => {
  const dataSource = new InMemoryDataSource();
  const itemDrive = new ItemDrive(dataSource);
  await t.step("insert an item", async () => {
    await itemDrive.insertItem({
      itemID: "1",
      facts: [
        {
          property: "type",
          value: { "@value": "person" },
        },
        {
          property: "name",
          value: { "@value": "Ethan" },
        },
        {
          property: "birthday",
          value: { "@value": new Date("2001-03-24").toISOString() },
        },
      ],
    });
  });

  await t.step("insert more items", async () => {
    await itemDrive.insertItems([
      {
        itemID: "2",
        facts: [
          {
            property: "type",
            value: { "@value": "person" },
          },
          {
            property: "name",
            value: { "@value": "Ash" },
          },
          {
            property: "birthday",
            value: { "@value": new Date("1996-02-27").toISOString() },
          },
        ],
      },
      {
        itemID: "3",
        facts: [
          {
            property: "type",
            value: { "@value": "person" },
          },
          {
            property: "name",
            value: { "@value": "Dawn" },
          },
          {
            property: "birthday",
            value: { "@value": new Date("2001-09-28").toISOString() },
          },
        ],
      },
    ]);
  });

  await t.step("fetch the item", async () => {
    const item = await itemDrive.fetchItem("1");
    assertEquals(item?.facts[0].property, "type");
    assertEquals(item?.facts[0].value, { "@value": "person" });
  });

  await t.step("fetch all items", async () => {
    const items = await itemDrive.fetchItems();
    assertEquals(items.length, 3);
    assertEquals(items[0].itemID, "1");
    assertEquals(items[1].itemID, "2");
    assertEquals(items[2].itemID, "3");
  });

  await t.step("fetch items by property", async () => {
    const items = await itemDrive.fetchItems({
      facts: [
        { property: "name", value: "Ethan" },
      ],
    });
    assertEquals(items.length, 1);
    assertEquals(items[0].itemID, "1");
  });

  await t.step("fetch items by missing property", async () => {
    const items = await itemDrive.fetchItems({
      facts: [
        {
          property: "name",
          value: "Missing",
        },
      ],
    });
    assertEquals(items.length, 0);
  });

  // await t.step("fetch items by multiple properties", async () => {
  //   const items = await itemDrive.fetchItems({
  //     facts: [
  //       { property: "name", value: "Ash" },
  //       // { property: "birthday", value: new Date("1996-02-27").toISOString() },
  //     ],
  //   });

  //   assertEquals(items.length, 1);
  //   assertEquals(items[0].itemID, "2");
  // });
});
