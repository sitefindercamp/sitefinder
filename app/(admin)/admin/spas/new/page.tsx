import { createSpaAction } from "@/app/(admin)/admin/spas/actions";
import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata = {
  title: "New Spa",
};

export default function NewSpaPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title="Create a new spa"
        description="Create a new directory listing using a server-side admin action."
      />
      <SpaEditorForm formAction={createSpaAction} submitLabel="Create spa" />
    </div>
  );
}
