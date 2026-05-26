import { getMaintenanceTasks } from "@/app/actions/maintenance";
import { getProperties } from "@/app/actions/properties";
import { getVendors } from "@/app/actions/vendors";
import { MaintenanceClient } from "./maintenance-client";

export default async function MaintenancePage() {
  const [tasks, properties, vendors] = await Promise.all([
    getMaintenanceTasks(),
    getProperties(),
    getVendors(),
  ]);
  return <MaintenanceClient tasks={tasks} properties={properties} vendors={vendors} />;
}
