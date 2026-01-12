"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/app/shared/ui/molecule/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

export const SendButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="submit"
    className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mysom-lightpurple bg-mysom-lightpurple text-white transition focus:outline-none"
    onClick={onClick}
  >
    <span className="font-medium">↑</span>
  </button>
);

export const ActionButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative ml-2">
          <button
            type="button"
            className="flex text-2xl shrink-0 items-center justify-center rounded-full text-mysom-darkgray bg-transparent transition focus:outline-none"
            aria-haspopup="menu"
          >
            +
          </button>
        </div>
      </DialogTrigger>
      <DialogContent className="bottom-0 left-0 right-0 top-auto h-[90%] w-full max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none data-[state=open]:animate-bottom-sheet-in data-[state=closed]:animate-bottom-sheet-out">
        <div className="flex flex-col h-full gap-3">
          <DialogClose>
            <div className="flex justify-end text-xs text-mysom-darkgray">
              닫기
            </div>
          </DialogClose>
          <div className="flex h-[100%] bg-mysom-darkgray text-white justify-center p-3">
            커스텀 화면
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
