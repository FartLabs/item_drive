import jsonld from "jsonld";
import type { Item, PartialItem } from "./item.ts";
import type { Fact, FactValue, PartialFact } from "./fact.ts";
import type { ItemDrive } from "./item_drive.ts";

export { jsonld };

export type JSONLdDocument = jsonld.JsonLdDocument;
export type JSONLdNodeObject = jsonld.NodeObject;
export type JSONLdValue = JSONLdNodeObject[string];

export const PROPERTY_TYPE = "@type";
export const PROPERTY_DOMAIN_INCLUDES = "https://schema.org/domainIncludes";
export const PROPERTY_RANGE_INCLUDES = "https://schema.org/rangeIncludes";
export const PROPERTY_ADDITIONAL_TYPE = "https://schema.org/additionalType";
export const PROPERTY_SUB_CLASS_OF =
  "http://www.w3.org/2000/01/rdf-schema#subClassOf";
export const PROPERTY_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

export const CLASS_PROPERTY = "https://schema.org/Property";
export const EXTERNAL_CLASS_PROPERTY =
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property";

export const CLASS_CLASS = "https://schema.org/Class";
export const EXTERNAL_CLASS_CLASS =
  "http://www.w3.org/2000/01/rdf-schema#Class";

export async function convertJSONLdDocumentToItems(
  input: JSONLdDocument,
): Promise<PartialItem[]> {
  const flattened = await jsonld.flatten(input);
  if (!Array.isArray(flattened)) {
    throw new Error("Expected flattened JSON-LD to be an array");
  }

  return flattened.map((thing) => convertJSONLdNodeObjectToItem(thing));
}

export function convertJSONLdNodeObjectToItem(
  node: JSONLdNodeObject,
): PartialItem {
  return {
    itemID: itemIDStringOf(node as FactValue),
    facts: Object.entries(node)
      .filter(([property]) => property !== "@id")
      .flatMap(([property, value]) =>
        convertJSONLdNodeObjectPropertyToFact(
          property,
          value,
        )
      ),
  };
}

export function convertJSONLdNodeObjectPropertyToFact(
  property: string,
  value: JSONLdValue,
): PartialFact[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      convertJSONLdNodeObjectPropertyToFact(property, item)
    );
  }

  if (value === undefined || value === null) {
    throw new Error(`Unexpected value for property ${property}`);
  }

  // @type is a special case where the value is not an object,
  // but a string.
  if (property === PROPERTY_TYPE && typeof value === "string") {
    return [{ property, value: { "@id": value } }];
  }

  return [{
    property,
    value: convertJSONLdNodeObjectPropertyValueToFactValue(value),
  }];
}

export function convertJSONLdNodeObjectPropertyValueToFactValue(
  value: JSONLdValue,
): FactValue {
  if (value === undefined || value === null) {
    throw new Error("Unexpected value");
  }

  if (typeof value === "object") {
    if ("@id" in value && typeof value["@id"] === "string") {
      return { "@id": value["@id"] };
    }

    if ("@value" in value) {
      return { "@value": value["@value"] };
    }

    // if ("@list" in value && Array.isArray(value["@list"])) {
    //   return { "@list": value["@list"] as FactValue[] };
    // }

    // if ("@set" in value && Array.isArray(value["@set"])) {
    //   return { "@set": value["@set"] as FactValue[] };
    // }

    throw new Error("Unexpected object value");
  }

  // Wrap the value in an @value envelope.
  return { "@value": value };
}

// TODO: Include options for behavior on when to return a list of warnings/errors and when to throw an error.
export interface CheckItemOptions {
  allowExternalReferences?: boolean;
}

export async function checkItem(
  itemDrive: ItemDrive,
  item: Item,
  options?: CheckItemOptions,
): Promise<void> {
  const factsByProperty = groupByProperty(item.facts);
  if (factsByProperty[PROPERTY_TYPE] === undefined) {
    throw new Error("Item must have a type");
  }

  const domain = await fetchSubClasses(
    itemDrive,
    [item.itemID],
  );
  for (const fact of item.facts) {
    // If the property is a type, check if the type exists.
    if (fact.property === PROPERTY_TYPE) {
      const itemID = itemIDStringOf(fact.value, CLASS_ALIASES);
      const typeExists = await itemDrive.fetchItem(itemID) !== null;
      if (!typeExists) {
        throw new Error("Type does not exist");
      }

      continue;
    }

    // Check if the property item exists.
    const propertyItem = await itemDrive.fetchItem(fact.property);
    const propertyItemExists = propertyItem !== null;
    if (!propertyItemExists) {
      continue;
    }

    // Check if the property item defines a domainIncludes and rangeIncludes.
    const {
      [PROPERTY_DOMAIN_INCLUDES]: domainIncludes,
      [PROPERTY_RANGE_INCLUDES]: rangeIncludes,
    } = groupByProperty(propertyItem.facts);
    if (domainIncludes === undefined || rangeIncludes === undefined) {
      throw new Error(
        "Property must define domainIncludes and rangeIncludes",
      );
    }

    // Get the valid classes and types for the item's range.
    const validClasses = new Set(
      rangeIncludes.map((fact) => itemIDStringOf(fact.value)),
    );
    const validTypes = getValidTypes(validClasses, DATA_TYPES);

    // If the fact's value is an ID, check if the ID exists.
    if ("@id" in fact.value) {
      if (validClasses.size === 0) {
        throw new Error("Fact value does not support rangeIncludes");
      }

      const referencedItemID = itemIDStringOf(fact.value);
      const referencedItem = await itemDrive.fetchItem(referencedItemID);
      if (referencedItem === null) {
        if (options?.allowExternalReferences) {
          continue;
        }

        throw new Error(
          `Fact value references an undefined item of ID ${referencedItemID}`,
        );
      }

      const referencedItemClasses = await fetchSubClasses(
        itemDrive,
        byProperties(
          groupByProperty(referencedItem.facts),
          [PROPERTY_TYPE, PROPERTY_ADDITIONAL_TYPE],
        ).map((fact) => itemIDStringOf(fact.value, CLASS_ALIASES)),
      );
      if (referencedItemClasses.isDisjointFrom(validClasses)) {
        throw new Error("Fact value does not support rangeIncludes");
      }

      continue;
    }

    // Check if the value's type is valid.
    if ("@value" in fact.value) {
      if (!validTypes.has(typeof fact.value["@value"])) {
        throw new Error("Fact value does not support rangeIncludes");
      }

      continue;
    }

    // Continue if the domain includes the fact's property.
    if (
      !(domainIncludes.some((fact) =>
        domain.has(itemIDStringOf(fact.value, CLASS_ALIASES))
      ))
    ) {
      throw new Error("Property does not support domainIncludes");
    }

    // The fact's value must be either an ID or a primitive.
    throw new Error("Unexpected fact value");
  }

  return;
}

/**
 * fetchSubClasses fetches the sub-classes of the given item IDs.
 */
export async function fetchSubClasses(
  itemDrive: ItemDrive,
  itemIDs: string[],
  subClasses = new Set<string>(),
): Promise<Set<string>> {
  for (const itemID of itemIDs) {
    if (subClasses.has(itemID)) {
      continue;
    }

    subClasses.add(itemID);
    const item = await itemDrive.fetchItem(itemID);
    if (item === null) {
      continue;
    }

    const subClassIDs =
      (groupByProperty(item.facts)[PROPERTY_SUB_CLASS_OF] ?? [])
        .map((fact) => itemIDStringOf(fact.value, CLASS_ALIASES));
    await fetchSubClasses(itemDrive, subClassIDs, subClasses);
  }

  return subClasses;
}

/**
 * fetchPropertiesByTypeID fetches the properties and sub-properties of the given
 * type ID.
 */
export async function fetchPropertiesByTypeID(
  itemDrive: ItemDrive,
  typeID: string,
) {
  return await itemDrive.fetchItems({
    facts: [
      { property: PROPERTY_TYPE, value: EXTERNAL_CLASS_PROPERTY },
      { property: PROPERTY_DOMAIN_INCLUDES, value: typeID },
    ],
  });
}

/**
 * getValidTypes returns the valid type mappings for the given item IDs.
 */
export function getValidTypes(
  itemIDs: Set<string>,
  dataTypes: Map<string, string>,
): Set<string> {
  const validTypes = new Set<string>();
  for (const itemID of itemIDs) {
    if (dataTypes.has(itemID)) {
      validTypes.add(dataTypes.get(itemID)!);
    }
  }

  return validTypes;
}

export const DATA_TYPES = new Map<string, string>([
  ["https://schema.org/Text", "string"],
  ["https://schema.org/Boolean", "boolean"],
  ["https://schema.org/Number", "number"],
  ["https://schema.org/Time", "string"],
  ["https://schema.org/Date", "string"],
  ["https://schema.org/DateTime", "string"],
]);

export const CLASS_ALIASES = new Map<string, string>([
  [EXTERNAL_CLASS_CLASS, CLASS_CLASS],
  [EXTERNAL_CLASS_PROPERTY, CLASS_PROPERTY],
]);

export function itemIDStringOf(
  value: FactValue,
  aliases = new Map<string, string>(),
): string {
  if (!("@id" in value)) {
    throw new Error("Expected value to have an ID");
  }

  return aliases.get(value["@id"]) ?? value["@id"];
}

export function groupByProperty<T extends { property: string }>(
  facts: T[],
): Record<string, T[] | undefined> {
  return Object.groupBy(facts, (fact) => fact.property);
}

export function byProperties(
  data: Partial<Record<string, Fact[]>>,
  properties: string[],
): Fact[] {
  return properties.flatMap((property) => data[property] ?? []);
}
