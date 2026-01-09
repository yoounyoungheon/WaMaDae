"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

export const SendButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="submit"
    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mysom-lightpurple bg-mysom-lightpurple text-white bg-transparent transition focus:outline-none"
    onClick={onClick}
  >
    <span className="text-sm font-medium">↑</span>
  </button>
);

type ActionButtonProps = {
  onSelectImage: (dataUrl: string) => void;
};

export const ActionButton = ({ onSelectImage }: ActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSelectImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
    setIsOpen(false);
  };

  return (
    <div className="relative ml-2" ref={wrapperRef}>
      <button
        type="button"
        className="flex text-lg shrink-0 items-center justify-center rounded-full text-mysom-darkgray bg-transparent transition focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        +
      </button>

      {isOpen ? (
        <div className="absolute bottom-full left-0 mb-2 w-36 rounded-lg border bg-white shadow">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={handleUploadClick}
          >
            사진 업로드
          </button>
        </div>
      ) : null}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
