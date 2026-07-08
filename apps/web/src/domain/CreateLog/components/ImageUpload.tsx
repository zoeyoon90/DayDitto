'use client';

import { useRef } from 'react';

type ImageUploadProps = {
  image: File | null;
  onImageChange: (file: File | null) => void;
  compact?: boolean;
};

export default function ImageUpload({ image, onImageChange, compact }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onImageChange(file);
  };

  const handleRemove = () => {
    onImageChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (compact) {
    return (
      <div className="shrink-0">
        {image ? (
          <div className="relative w-8 h-8 border border-border rounded-base overflow-hidden">
            <img
              src={URL.createObjectURL(image)}
              alt="업로드된 이미지"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => inputRef.current?.click()}
            />
            <button
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-4 h-4 bg-bw border border-border text-foreground text-xs flex items-center justify-center rounded-full leading-none"
              aria-label="이미지 삭제"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 h-7 border-2 border-border bg-card rounded-base text-xs font-base text-foreground/80 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all whitespace-nowrap"
            >
              이미지 업로드
            </button>
            <button
              onClick={() => gifInputRef.current?.click()}
              className="px-3 h-7 border-2 border-border bg-card rounded-base text-xs font-base text-foreground/80 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all whitespace-nowrap"
            >
              GIF
            </button>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
        <input ref={gifInputRef} type="file" accept="image/gif" onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {image ? (
        <div className="relative w-full aspect-square border-2 border-border shadow-shadow overflow-hidden rounded-base">
          <img
            src={URL.createObjectURL(image)}
            alt="업로드된 이미지"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-bw border-2 border-border text-foreground text-sm flex items-center justify-center rounded-base shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
            aria-label="이미지 삭제"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square border-2 border-dashed border-border bg-card/50 rounded-base flex flex-col items-center justify-center gap-2 hover:bg-card/80 transition-colors"
        >
          <span className="text-3xl text-foreground">+</span>
          <span className="text-sm text-foreground">사진 / GIF 추가 (선택)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
