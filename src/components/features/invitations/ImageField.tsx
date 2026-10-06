"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImageIcon, RotateCw, Scan, X } from "lucide-react";
import { getCroppedBlob, uploadBlob, uploadFile } from "@/lib/crop-image";
import { previewImageSrc } from "@/lib/utils";

interface ImageFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Folder ImageKit untuk upload (lihat src/lib/upload-folders.ts). */
  folder?: string;
  /** Rasio crop sesuai tampilan template (default 3/4). */
  aspect?: number;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  rotate?: number;
  onPositionChange?: (x: number, y: number) => void;
  onZoomChange?: (zoom: number) => void;
  onRotateChange?: (rotate: number) => void;
}

function ratioText(aspect: number): string {
  if (aspect === 1) return "1:1";
  if (aspect === 16 / 9) return "16:9";
  if (aspect === 4 / 5) return "4:5";
  if (aspect === 4 / 3) return "4:3";
  if (aspect === 3 / 4) return "3:4";
  return aspect.toFixed(2).replace(".", ":");
}

export default function ImageField({
  label,
  value,
  onChange,
  folder,
  aspect = 3 / 4,
  positionX = 50,
  positionY = 50,
  zoom = 100,
  rotate = 0,
  onPositionChange,
  onZoomChange,
  onRotateChange,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotate, setCropRotate] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setError("");
      setBusy(true);
      try {
        const url = await uploadFile(file, folder);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload gagal");
      } finally {
        setBusy(false);
      }
    },
    [onChange, folder],
  );

  async function applyCrop() {
    if (!cropSrc || !croppedArea) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedArea, cropRotate);
      const url = await uploadBlob(blob, "cropped.jpg", folder);
      onChange(url);
      onZoomChange?.(100);
      onRotateChange?.(cropRotate);
      setCropOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Rasio {ratioText(aspect)}
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`relative overflow-hidden rounded-2xl border border-dashed ${dragOver ? "border-primary bg-primary/5" : "border-border"} bg-white`}
      >
        {value ? (
          <button
            type="button"
            className="relative block h-48 w-full"
            onClick={(e) => {
              if (!onPositionChange) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              onPositionChange(Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y)));
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageSrc(value)}
              alt={label}
              className="h-full w-full object-cover"
              style={{
                objectPosition: `${positionX}% ${positionY}%`,
                transform: `scale(${zoom / 100}) rotate(${rotate}deg)`,
              }}
              loading="lazy"
            />
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow" style={{ left: `${positionX}%`, top: `${positionY}%` }} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <ImageIcon className="h-6 w-6" />
            {busy ? "Mengunggah..." : "Lepaskan gambar atau klik untuk unggah"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="min-h-10 rounded-lg border border-border px-3 py-2 text-xs text-foreground"
        >
          Ganti
        </button>
        {value && (
          <>
            <button
              type="button"
              onClick={() => {
                setCropSrc(previewImageSrc(value, 3840));
                setCropZoom(1);
                setCropRotate(rotate);
                setCropOpen(true);
              }}
              className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground"
            >
              <Scan className="h-3.5 w-3.5" /> Crop / Zoom
            </button>
            {onRotateChange && (
              <button
                type="button"
                onClick={() => onRotateChange((rotate + 90) % 360)}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground"
              >
                <RotateCw className="h-3.5 w-3.5" /> Rotate
              </button>
            )}
            <button type="button" onClick={() => onChange(null)} className="min-h-10 rounded-lg px-3 py-2 text-xs text-red-500">
              Hapus
            </button>
          </>
        )}
      </div>
      {(onPositionChange || onZoomChange) && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-3">
          {onPositionChange && (
            <>
              <label className="text-xs text-muted-foreground">
                Position X {positionX}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={positionX}
                  onChange={(e) => onPositionChange(Number(e.target.value), positionY)}
                  className="mt-1 w-full"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Position Y {positionY}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={positionY}
                  onChange={(e) => onPositionChange(positionX, Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
            </>
          )}
          {onZoomChange && (
          <label className="text-xs text-muted-foreground">
            Zoom {zoom}%
            <input
              type="range"
              min={80}
              max={180}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
        )}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {cropOpen && cropSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Crop gambar"
          onClick={(e) => { if (e.target === e.currentTarget) setCropOpen(false); }}
          onKeyDown={(e) => { if (e.key === "Escape") setCropOpen(false); }}
        >
          <div className="max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3">
              <p className="text-sm font-medium">
                Crop gambar <span className="text-muted-foreground">· Rasio {ratioText(aspect)}</span>
              </p>
              <button
                type="button"
                onClick={() => setCropOpen(false)}
                aria-label="Tutup crop"
                className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative h-[clamp(12rem,40dvh,20rem)] bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={cropZoom}
                rotation={cropRotate}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setCropZoom}
                onRotationChange={setCropRotate}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>
            <div className="space-y-3 p-4">
              <label className="block text-xs text-muted-foreground">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Rotate
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={cropRotate}
                  onChange={(e) => setCropRotate(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void applyCrop()}
                className="min-h-11 w-full rounded-lg bg-primary py-3 text-sm text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Menyimpan..." : "Terapkan crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
