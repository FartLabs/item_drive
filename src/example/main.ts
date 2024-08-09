import { createRouter } from "@fartlabs/rt";
import type { FactQuery } from "#/facts/fact_query.ts";
import type { PartialItem } from "#/items/partial_item.ts";
import { ItemDrive } from "#/item_drive.ts";
import { InMemoryDataSource } from "#/data_sources/in_memory_data_source/mod.ts";
import { ingestSchema } from "./ingest_schema.ts";

if (import.meta.main) {
  const dataSource = new InMemoryDataSource(); // TODO: Replace with DenoKvDataSource.
  const itemDrive = new ItemDrive(dataSource);
  await ingestSchema(itemDrive);

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

function parseItems(url: URL): PartialItem[] {
  const items = url.searchParams.get("items");
  return items ? JSON.parse(items) : [];
}
