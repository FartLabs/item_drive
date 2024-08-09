import { default as jsonld } from "jsonld";
import { ItemDrive } from "#/item_drive.ts";
import { fromJSONLd } from "#/from_jsonld.ts";

/**
 * ingestSchema ingests the schema.org JSON-LD file into the item drive.
 */
export async function ingestSchema(itemDrive: ItemDrive) {
  const schemaOrgItems = fromJSONLd(
    await jsonld.flatten(
      JSON.parse(
        await Deno.readTextFile(
          new URL(
            import.meta.resolve("./schemaorg-current-https.jsonld"),
          ),
        ),
      ),
    ),
  );

  await itemDrive.insertItems(schemaOrgItems);
}
