"use client";

import Button from "../atom/button";
import { Dialog, DialogContent } from "./dialog";

interface ActionErrorDialogProps {
  open: boolean;
  message?: string;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export default function ActionErrorDialog({
  open,
  message,
  onOpenChange,
  title = "요청을 처리할 수 없습니다.",
}: ActionErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        description={message ?? "잠시 후 다시 시도해주세요."}
        descriptionClassName="text-center text-sm text-slate-600"
        className="flex flex-col gap-4"
      >
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          확인
        </Button>
      </DialogContent>
    </Dialog>
  );
}
