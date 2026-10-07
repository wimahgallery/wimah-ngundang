"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/site-config";
import type { InvitationRow } from "@/features/invitations/services/invitationApi";

/** URL publik undangan — dipakai di QR dan tombol salin. */
export function invitationUrl(slug: string): string {
  return `${siteConfig.siteUrl.replace(/\/+$/, "")}/${slug}`;
}

type ShareInvitationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: InvitationRow | null;
};

export default function ShareInvitationDialog({
  open,
  onOpenChange,
  invitation,
}: ShareInvitationDialogProps) {
  const [copied, setCopied] = useState(false);
  const url = invitation ? invitationUrl(invitation.slug) : "";

  const handleOpenChange = (nextOpen: boolean) => {
    // Reset di event handler (bukan effect) supaya "Tersalin" tidak tersisa
    // dari sesi berbagi sebelumnya.
    if (!nextOpen) setCopied(false);
    onOpenChange(nextOpen);
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard bisa ditolak browser — tautan tetap terlihat untuk disalin manual.
      setCopied(false);
    }
  };

  if (!invitation) return null;

  const title = invitation.event_title || invitation.slug;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Bagikan Undangan</DialogTitle>
          <DialogDescription className="break-words">
            {title} — /{invitation.slug}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <QRCodeSVG value={url} size={208} level="M" marginSize={2} />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="break-all font-mono text-xs text-foreground">{url}</p>
        </div>

        {!invitation.is_published && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Undangan masih draft. Publikasikan dulu agar QR dan tautan ini bisa dibuka tamu.
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 flex-1 gap-1.5 px-4"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span aria-live="polite">{copied ? "Tersalin" : "Salin tautan"}</span>
          </Button>
          <Button
            size="sm"
            className="min-h-11 flex-1 gap-1.5 px-4"
            render={<a href={url} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="h-4 w-4" /> Buka
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
