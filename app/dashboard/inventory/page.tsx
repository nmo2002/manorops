import { getAssets } from "@/app/actions/assets";
import { getProperties } from "@/app/actions/properties";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const [assets, properties] = await Promise.all([getAssets(), getProperties()]);
  return <InventoryClient assets={assets} properties={properties} />;
}
