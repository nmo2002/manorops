import { getVendors } from "@/app/actions/vendors";
import { getProperties } from "@/app/actions/properties";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage() {
  const [vendors, properties] = await Promise.all([getVendors(), getProperties()]);
  return <VendorsClient vendors={vendors} properties={properties} />;
}
