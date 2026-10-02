"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Cropper, { type Area } from "react-easy-crop";
import { GripVertical, Scan, Trash2, X } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { GalleryImage } from "@/lib/invitation";
import { getCroppedBlob, uploadBlob, uploadFile } from "@/lib/crop-image";

function SortableItem({
  image,
  onRemove,
  onMeta,
  onCrop,
}: {
  image: GalleryImage;
  onRemove: () => void;
  onMeta: (patch: Partial<GalleryImage>) => void;
  onCrop: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="relative h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt || ""}
          className="h-full w-full object-cover"
          style={{ objectPosition: `${image.positionX}% ${image.positionY}%` }}
          loading="lazy"
        />
        <button
          type="button"
          aria-label="Geser urutan foto"
          className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-md bg-white/90"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus foto"
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-md bg-white/90 text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2 p-3">
        <button
          type="button"
          onClick={onCrop}
          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:border-primary/60 hover:text-primary"
        >
          <Scan className="h-3.5 w-3.5" /> Crop 1:1
        </button>
        <input
          value={image.alt || ""}
          onChange={(e) => onMeta({ alt: e.target.value })}
          placeholder="Keterangan"
          aria-label="Keterangan foto"
          className="w-full rounded-lg border border-border px-2 py-2 text-base md:py-1.5 md:text-sm"
        />
        <label className="block text-xs text-muted-foreground">
          Focal X {image.positionX}
          <input
            type="range"
            min={0}
            max={100}
            value={image.positionX}
            aria-label="Posisi fokus horizontal"
            onChange={(e) => onMeta({ positionX: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Focal Y {image.positionY}
          <input
            type="range"
            min={0}
            max={100}
            value={image.positionY}
            aria-label="Posisi fokus vertikal"
            onChange={(e) => onMeta({ positionY: Number(e.target.value) })}
            className="w-full"
          />
        </label>
      </div>
    </div>
  );
}

export default function GalleryField({
  images,
  onChange,
  folder,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  /** Folder ImageKit untuk upload (lihat src/lib/upload-folders.ts). */
  folder?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = useMemo(() => images.map((i) => i.id), [images]);

  const [cropImage, setCropImage] = useState<GalleryImage | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotate, setCropRotate] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    onChange(arrayMove(images, oldIndex, newIndex));
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const uploaded: GalleryImage[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, folder);
      uploaded.push({
        id: uuid(),
        url,
        alt: "",
        positionX: 50,
        positionY: 50,
        zoom: 100,
        rotate: 0,
      });
    }
    onChange([...images, ...uploaded]);
  }

  function openCrop(image: GalleryImage) {
    setCropImage(image);
    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setCropRotate(0);
    setCroppedArea(null);
    setError("");
  }

  async function applyCrop() {
    if (!cropImage || !croppedArea) return;
    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedBlob(cropImage.url, croppedArea, cropRotate);
      const url = await uploadBlob(blob, `gallery-${cropImage.id}.jpg`, folder);
      onChange(images.map((i) => (i.id === cropImage.id ? { ...i, url } : i)));
      setCropImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground"
      >
        Rasio 1:1 sesuai template — drag foto ke sini atau{" "}
        <label className="cursor-pointer font-medium text-primary">
          pilih file
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
        </label>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <SortableItem
                key={image.id}
                image={image}
                onRemove={() => onChange(images.filter((i) => i.id !== image.id))}
                onMeta={(patch) => onChange(images.map((i) => (i.id === image.id ? { ...i, ...patch } : i)))}
                onCrop={() => openCrop(image)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {cropImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Crop foto galeri"
          onClick={(e) => { if (e.target === e.currentTarget) setCropImage(null); }}
          onKeyDown={(e) => { if (e.key === "Escape") setCropImage(null); }}
        >
          <div className="max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3">
              <p className="text-sm font-medium">
                Crop foto <span className="text-muted-foreground">· Rasio 1:1</span>
              </p>
              <button
                type="button"
                onClick={() => setCropImage(null)}
                aria-label="Tutup crop"
                className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative h-[clamp(12rem,40dvh,20rem)] bg-black">
              <Cropper
                image={cropImage.url}
                crop={crop}
                zoom={cropZoom}
                rotation={cropRotate}
                aspect={1}
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
              {error && <p className="text-xs text-red-600">{error}</p>}
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
