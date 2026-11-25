"use client";

import Link from "next/link";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import type { ConfirmPayload } from "@/components/site/ConfirmSheet";

const linkClass =
  "inline-flex h-8 items-center rounded-full border border-line px-3 text-xs font-bold text-ink hover:bg-plaster";

export function RowActions({
  previewHref,
  previewLabel = "Preview",
  previewExternal,
  editHref,
  editLabel = "Edit",
  deleteAction,
  deleteFields,
  deleteLabel = "Delete",
  deleteConfirm,
}: {
  previewHref?: string;
  previewLabel?: string;
  previewExternal?: boolean;
  editHref?: string;
  editLabel?: string;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteFields?: Record<string, string>;
  deleteLabel?: string;
  deleteConfirm?: ConfirmPayload;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {previewHref ? (
        <Link
          href={previewHref}
          className={linkClass}
          {...(previewExternal ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {previewLabel}
        </Link>
      ) : null}
      {editHref ? (
        <Link href={editHref} className={linkClass}>
          {editLabel}
        </Link>
      ) : null}
      {deleteAction && deleteConfirm ? (
        <ConfirmAction
          action={deleteAction}
          fields={deleteFields}
          label={deleteLabel}
          confirm={deleteConfirm}
        />
      ) : null}
    </div>
  );
}
