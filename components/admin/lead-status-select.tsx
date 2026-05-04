"use client";

import { useRef } from "react";
import { updateLeadStatusAction } from "@/app/(admin)/admin/advertising-leads/actions";

const STATUS_OPTIONS = [
  { value: "new",       label: "New",       className: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", className: "bg-yellow-100 text-yellow-800" },
  { value: "converted", label: "Converted", className: "bg-green-100 text-green-800" },
  { value: "closed",    label: "Closed",    className: "bg-gray-100 text-gray-600" },
];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

  return (
    <form ref={formRef} action={updateLeadStatusAction}>
      <input type="hidden" name="id" value={leadId} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer border-0 outline-none focus:ring-2 focus:ring-ring ${current.className}`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </form>
  );
}
