"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기용 URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 서버 업로드
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/menu/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("업로드 실패");
      }

      const data = await res.json();
      console.log("업로드 완료:", data);
      // TODO: 서버가 리턴해준 url, id 등을 상태에 저장해서 다음 화면으로 넘기기
    } catch (err) {
      console.error(err);
      alert("업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col gap-4">
      <h1 className="text-lg font-semibold">메뉴판 업로드</h1>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50">
        <span className="text-sm text-gray-600 mb-2">
          메뉴판을 촬영하거나, 앨범에서 선택해주세요
        </span>

        {/* 핵심: accept + capture */}
        <input
          type="file"
          accept="image/*"
          capture="environment" // 후면 카메라 우선
          className="hidden"
          onChange={handleFileChange}
        />

        <span className="text-xs text-gray-400 mt-1">
          카메라/앨범 선택 팝업이 뜹니다
        </span>
      </label>

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">미리보기</p>
          <Image
            src={previewUrl}
            alt="미리보기"
            height={100}
            width={100}
            className="w-full rounded-xl border object-contain max-h-[400px]"
          />
        </div>
      )}

      {uploading && (
        <p className="text-sm text-blue-500 mt-2">업로드 중입니다...</p>
      )}
    </div>
  );
}
