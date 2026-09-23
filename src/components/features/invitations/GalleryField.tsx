"use client";

import { useMemo } from "react";
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
import { GripVertical, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { GalleryImage } from "@/lib/invitation";
import { uploadFile } from "@/lib/crop-image";

function SortableItem({
  image,
  onRemove,
  onMeta,
}: {
  image: GalleryImage;
  onRemove: () => void;
  onMeta: (patch: Partial<GalleryImage>) => void;
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
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = useMemo(() => images.map((i) => i.id), [images]);

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
      const url = await uploadFile(file);
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
        Drag foto ke sini atau{" "}
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
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
