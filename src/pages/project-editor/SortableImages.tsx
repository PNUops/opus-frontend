import React, { useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ThumbnailResult } from '@apis/projectEditor';
import { PreviewResult } from '@dto/projectViewerDto';
import { useImageObjectUrl } from '@hooks/useImageBlob';

import { FiX } from 'react-icons/fi';
import { AiFillPicture } from 'react-icons/ai';
import { MdBrokenImage } from 'react-icons/md';
import { CgSandClock } from 'react-icons/cg';

const PREVIEW_BOX_TAGS = ['썸네일', '상세 이미지'];
export const MAX_IMAGES = 6;
const EMPTY_SLOT_PREFIX = 'empty-image-slot-';

export type UploadImage = ThumbnailResult | PreviewResult | File;
export type ImageSlot = UploadImage | undefined;

type ReorderableImage = File | Extract<ThumbnailResult | PreviewResult, { status: 'success' }>;

interface SortableImagesProps {
  images: ImageSlot[];
  onRemove: (index: number) => void;
  onReorder: (thumbnail: ThumbnailResult | File | undefined, previews: (PreviewResult | File)[]) => void;
  onMoveBlocked: (message: string) => void;
  sortable?: boolean;
}

interface SortableImageItem {
  id: UniqueIdentifier;
  index: number;
}

const isReorderableImage = (image: ImageSlot): image is ReorderableImage =>
  !!image && (image instanceof File || image.status === 'success');

const isDefinedImage = (image: ImageSlot): image is UploadImage => image !== undefined;

const isThumbnailImage = (image: UploadImage): image is ThumbnailResult | File => {
  if (image instanceof File) return true;
  if (image.status === 'success') return true;
  if (image.status === 'processing') return image.code === 'THUMBNAIL_PROCESSING';
  return image.code === 'THUMBNAIL_NOTFOUND' || image.code === 'THUMBNAIL_ERR_ETC';
};

const isPreviewImage = (image: UploadImage): image is PreviewResult | File => {
  if (image instanceof File) return true;
  if (image.status === 'success') return true;
  if (image.status === 'processing') return image.code === 'PREVIEW_PROCESSING';
  return image.code === 'PREVIEW_NOTFOUND' || image.code === 'PREVIEW_ERR_ETC';
};

const getEmptySlotId = (index: number) => `${EMPTY_SLOT_PREFIX}${index}`;

const getEmptySlotIndex = (id: UniqueIdentifier) => {
  if (typeof id !== 'string' || !id.startsWith(EMPTY_SLOT_PREFIX)) return null;

  const index = Number(id.replace(EMPTY_SLOT_PREFIX, ''));
  return Number.isInteger(index) ? index : null;
};

interface SortableImageCardProps {
  id: UniqueIdentifier;
  index: number;
  children: React.ReactNode;
  onRemove: (index: number) => void;
}

const SortableImageCard = ({ id, index, children, onRemove }: SortableImageCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`border-lightGray text-lightGray relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded border text-xs ${
        isDragging ? 'z-10 cursor-grabbing opacity-80 shadow-md' : 'cursor-grab'
      }`}
    >
      {children}

      {index === 0 && (
        <span className="absolute bottom-1 left-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">썸네일</span>
      )}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="border-lightGray bg-whiteGray absolute top-1 right-1 rounded-full border p-1"
      >
        <FiX size={13} className="text-midGray hover:cursor-pointer" />
      </button>
    </div>
  );
};

interface StaticImageCardProps {
  index: number;
  children: React.ReactNode;
  onRemove: (index: number) => void;
}

const StaticImageCard = ({ index, children, onRemove }: StaticImageCardProps) => (
  <div className="border-lightGray text-lightGray relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded border text-xs">
    {children}

    {index === 0 && (
      <span className="absolute bottom-1 left-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">썸네일</span>
    )}
    <button
      onClick={() => onRemove(index)}
      className="border-lightGray bg-whiteGray absolute top-1 right-1 rounded-full border p-1"
    >
      <FiX size={13} className="text-midGray hover:cursor-pointer" />
    </button>
  </div>
);

interface EmptyImageSlotProps {
  index: number;
}

const EmptyImageSlot = ({ index }: EmptyImageSlotProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: getEmptySlotId(index) });

  return (
    <div
      ref={setNodeRef}
      className={`border-lightGray text-title text-lightGray relative flex aspect-[3/2] w-full items-center justify-center rounded border border-dashed transition-colors ${
        isOver ? 'border-mainGreen bg-subGreen/40' : ''
      }`}
    >
      <AiFillPicture />
      {index === 0 || index === 1 ? (
        <span className="absolute bottom-1 left-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">
          {PREVIEW_BOX_TAGS[index]}
        </span>
      ) : null}
    </div>
  );
};

const StaticEmptyImageSlot = ({ index }: EmptyImageSlotProps) => (
  <div className="border-lightGray text-title text-lightGray relative flex aspect-[3/2] w-full items-center justify-center rounded border border-dashed">
    <AiFillPicture />
    {index === 0 || index === 1 ? (
      <span className="absolute bottom-1 left-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">
        {PREVIEW_BOX_TAGS[index]}
      </span>
    ) : null}
  </div>
);

interface ImageContentProps {
  image: UploadImage;
  index: number;
}

const ImageContent = ({ image, index }: ImageContentProps) => {
  const fileUrl = useImageObjectUrl(image instanceof File ? image : null);

  if (image instanceof File) {
    return (
      <img
        src={fileUrl ?? ''}
        alt={`image-${index}`}
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
      />
    );
  }

  if (image.status === 'processing') {
    return (
      <div className="text-lightGray flex h-full w-full animate-pulse flex-col items-center justify-center gap-5">
        <CgSandClock size={25} />
        <span className="text-center text-xs">
          서버에서 이미지를 압축 중이에요<br></br>조금만 기다려주세요!
        </span>
      </div>
    );
  }

  if (image.status === 'success' && typeof image.url === 'string') {
    return (
      <img
        src={image.url}
        alt={`image-${index}`}
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
      />
    );
  }

  return <MdBrokenImage size={30} className="text-red-300" />;
};

const SortableImages = ({ images, onRemove, onReorder, onMoveBlocked, sortable = true }: SortableImagesProps) => {
  const sortableIdByImageRef = useRef<WeakMap<object, string>>(new WeakMap());
  const sortableIdSeedRef = useRef(0);

  const getSortableId = useCallback((image: ReorderableImage) => {
    const current = sortableIdByImageRef.current.get(image);
    if (current) return current;

    const next = `project-image-${sortableIdSeedRef.current}`;
    sortableIdSeedRef.current += 1;
    sortableIdByImageRef.current.set(image, next);
    return next;
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortableItems = useMemo(
    () =>
      images.flatMap((image, index) => {
        if (!isReorderableImage(image)) return [];
        return [{ id: getSortableId(image), index }];
      }),
    [getSortableId, images],
  );

  const sortableItemByIndex = useMemo(() => new Map(sortableItems.map((item) => [item.index, item])), [sortableItems]);

  const paddedImages = useMemo(() => {
    const nextImages = images.slice(0, MAX_IMAGES);
    while (nextImages.length < MAX_IMAGES) nextImages.push(undefined);
    return nextImages;
  }, [images]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = sortableItems.find((item) => item.id === active.id);
    const overItem = sortableItems.find((item) => item.id === over.id);
    const emptySlotIndex = getEmptySlotIndex(over.id);
    const overIndex = overItem?.index ?? emptySlotIndex;
    if (!activeItem || overIndex === null || activeItem.index === overIndex) return;

    const currentImages = [...images];
    while (currentImages.length < MAX_IMAGES) currentImages.push(undefined);

    const nextImages = arrayMove(currentImages, activeItem.index, overIndex).slice(0, MAX_IMAGES);
    const [nextThumbnail, ...nextPreviewSlots] = nextImages;

    if (nextThumbnail && !isThumbnailImage(nextThumbnail)) {
      onMoveBlocked('압축 중이거나 오류가 있는 이미지는 썸네일로 이동할 수 없어요');
      return;
    }

    const nextPreviews: (PreviewResult | File)[] = [];
    for (const image of nextPreviewSlots.filter(isDefinedImage)) {
      if (!isPreviewImage(image)) {
        onMoveBlocked('압축 중이거나 오류가 있는 썸네일은 상세 이미지로 이동할 수 없어요');
        return;
      }
      nextPreviews.push(image);
    }

    onReorder(nextThumbnail, nextPreviews);
  };

  const renderImageGrid = () => (
    <div className="grid flex-1 grid-cols-2 gap-3 text-center">
      {paddedImages.map((img, index) => {
        if (!img) {
          return sortable ? (
            <EmptyImageSlot key={`empty-${index}`} index={index} />
          ) : (
            <StaticEmptyImageSlot key={`empty-${index}`} index={index} />
          );
        }

        const displayContent = <ImageContent image={img} index={index} />;
        const sortableItem = sortableItemByIndex.get(index);
        if (!sortable || !sortableItem) {
          return (
            <StaticImageCard key={`static-${index}`} index={index} onRemove={onRemove}>
              {displayContent}
            </StaticImageCard>
          );
        }

        return (
          <SortableImageCard key={sortableItem.id} id={sortableItem.id} index={index} onRemove={onRemove}>
            {displayContent}
          </SortableImageCard>
        );
      })}
    </div>
  );

  if (!sortable) return renderImageGrid();

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableItems.map((item: SortableImageItem) => item.id)} strategy={rectSortingStrategy}>
        {renderImageGrid()}
      </SortableContext>
    </DndContext>
  );
};

export default SortableImages;
