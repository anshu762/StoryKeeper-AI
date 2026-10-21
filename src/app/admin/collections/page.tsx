import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { CollectionManager } from "@/components/admin/collection-manager";
import { getAdminCollections } from "@/server/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Curatorial Exhibitions"
        title="Oral History Collections"
        description="Curate thematic and regional collections, customize unique gradient palettes and motif emblems, and order archive exhibitions."
      />

      <CollectionManager initialCollections={collections} />
    </div>
  );
}
