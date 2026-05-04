import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { countReviewsByStatus } from "@/lib/spa-reviews";
import { countPendingClaims } from "@/lib/spa-claims";

export async function AdminSidebar() {
  const [reviewCounts, pendingClaims] = await Promise.all([
    countReviewsByStatus(),
    countPendingClaims(),
  ]);

  return (
    <aside className="surface h-fit p-4">
      <AdminSidebarNav
        pendingReviews={reviewCounts.pending}
        pendingClaims={pendingClaims}
      />
    </aside>
  );
}
