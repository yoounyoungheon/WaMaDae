"use client";

import { useState } from "react";

export const SendButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="submit"
    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-mysom-lightpurple bg-mysom-lightpurple text-white transition focus:outline-none"
    onClick={onClick}
  >
    <span className="text-sm font-medium">↑</span>
  </button>
);

export const ActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative ml-2">
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
          <button type="button" className="w-full px-3 py-2 text-left text-sm">
            사진 업로드
          </button>
        </div>
      ) : null}
    </div>
  );
};
