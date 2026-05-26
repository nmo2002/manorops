import { getProperties } from "@/app/actions/properties";
import { PropertiesClient } from "./properties-client";

export default async function PropertiesPage() {
  const properties = await getProperties();
  return <PropertiesClient properties={properties} />;
}
