import { default as jsonld } from "jsonld";
import { createRouter } from "@fartlabs/rt";
import { fromJSONLd } from "#/from_jsonld.ts";
import type { FactQuery } from "#/facts/fact_query.ts";
import type { Item } from "#/items/item.ts";
import { ItemDrive } from "#/item_drive.ts";
import { InMemoryDataSource } from "#/data_sources/in_memory_data_source/mod.ts";

if (import.meta.main) {
  // TODO: Abstract schema.org ingestion into a separate function.
  const schemaOrgItems = fromJSONLd(
    await jsonld.flatten(
      JSON.parse(
        await Deno.readTextFile(
          new URL(import.meta.resolve("./schemaorg-current-https.jsonld")),
        ),
      ),
    ),
  );

  const dataSource = new InMemoryDataSource(); // TODO: Replace with DenoKvDataSource.
  const itemDrive = new ItemDrive(dataSource);
  await itemDrive.insertItems(schemaOrgItems);

  const router = createRouter()
    .get("/items", async (ctx) => {
      const query = parseQuery(ctx.url);
      const items = await itemDrive.fetchItems(query);
      return Response.json(items);
    })
    .get<"id">("/items/:id", async (ctx) => {
      const item = await itemDrive.fetchItem(ctx.params.id);
      return Response.json(item);
    })
    .post("/items", async (ctx) => {
      const authorizationToken = ctx.request.headers.get("Authorization");
      if (
        authorizationToken !== `Bearer ${Deno.env.get("AUTHORIZATION_TOKEN")}`
      ) {
        return new Response("Unauthorized", { status: 401 });
      }

      const items = await itemDrive.insertItems(parseItems(ctx.url));
      return Response.json(items);
    });

  Deno.serve((request) => router.fetch(request));
}

function parseQuery(url: URL): FactQuery[] | undefined {
  const query = url.searchParams.get("query");
  return query ? JSON.parse(query) : undefined;
}

function parseItems(url: URL): Item[] {
  const items = url.searchParams.get("items");
  return items ? JSON.parse(items) : [];
}
