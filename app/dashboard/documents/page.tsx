import { getDocuments } from "@/app/actions/documents";
import { getProperties } from "@/app/actions/properties";
import { DocumentsClient } from "./documents-client";

export default async function DocumentsPage() {
  const [documents, properties] = await Promise.all([getDocuments(), getProperties()]);
  return <DocumentsClient documents={documents} properties={properties} />;
}
