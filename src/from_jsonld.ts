import type { PartialItem } from "#/items/partial_item.ts";
import type { FactValue } from "#/facts/fact_value.ts";
import type { PartialFact } from "#/facts/partial_fact.ts";

/**
 * PROPERTY_ID is the property name for the ID of a JSON-LD node.
 */
export const PROPERTY_ID = "@id";

/**
 * PROPERTY_TYPE is the property name for the type of a JSON-LD node.
 */
export const PROPERTY_TYPE = "@type";

/**
 * fromJSONLd converts JSON-LD nodes to items.
 */
// deno-lint-ignore no-explicit-any
export function fromJSONLd(nodeOrNodes: any) {
  if (Array.isArray(nodeOrNodes)) {
    return nodeOrNodes.map((node) => fromJSONLdNode(node));
  }

  return [fromJSONLdNode(nodeOrNodes)];
}

/**
 * fromJSONLdNode converts a JSON-LD node to an item.
 */
// deno-lint-ignore no-explicit-any
export function fromJSONLdNode(node: any): PartialItem {
  const itemID = node[PROPERTY_ID];
  if (typeof itemID !== "string") {
    throw new Error("Unexpected node");
  }

  return {
    itemID,
    facts: Object.entries(node)
      .filter(([property]) => property !== PROPERTY_ID)
      .flatMap(
        ([property, value]) => fromJSONLdProperty(property, value),
      ),
  };
}

/**
 * fromJSONLdProperty converts a JSON-LD property to a fact.
 */
export function fromJSONLdProperty(
  property: string,
  // deno-lint-ignore no-explicit-any
  value: any,
): PartialFact[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => fromJSONLdProperty(property, item));
  }

  if (value === undefined || value === null) {
    throw new Error(`Unexpected value for property ${property}`);
  }

  // @type is a special case where the value is not an object,
  // but a string.
  if (property === PROPERTY_TYPE && typeof value === "string") {
    return [{ property: property, value: { "@id": value } }];
  }

  return [{
    property: property,
    value: fromJSONLdPropertyValue(value),
  }];
}

/**
 * fromJSONLdPropertyValue converts a JSON-LD property value to a fact value.
 */
// deno-lint-ignore no-explicit-any
export function fromJSONLdPropertyValue(value: any): FactValue {
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
