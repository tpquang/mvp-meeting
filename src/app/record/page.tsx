"use client";

import React, { useEffect, useRef, useState } from "react";
import useRequireAuth from "@/hooks/useRequireAuth";
import createSpeechRecognition from "@/services/speech";

export default function RecordPage() {
  useRequireAuth();

  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalSegments, setFinalSegments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const ensureMicrophonePermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      return true;
    } catch (e) {
      return false;
    }
  };

  const startRecording = async () => {
    setError(null);
    const allowed = await ensureMicrophonePermission();
    if (!allowed) {
      setError("Quyền truy cập micro bị từ chối. Vui lòng cho phép micro trên trình duyệt.");
      return;
    }

    const ctrl = createSpeechRecognition({
      lang: "vi-VN",
      interim: true,
      continuous: true,
      autoRestart: true,
      restartDelayMs: 600,
      onResult: ({ interim, finals }) => {
        setInterim(interim);
        setFinalSegments(finals);
      },
      onError: (e) => setError(e),
    });

    if (!ctrl) {
      setError("Trình duyệt không hỗ trợ Web Speech API.");
      return;
    }

    controllerRef.current = ctrl;
    try {
      ctrl.start();
      setRecording(true);
    } catch (e) {
      setError("Không thể bắt đầu ghi âm: " + String(e));
    }
  };

  const stopRecording = () => {
    controllerRef.current?.stop();
    setRecording(false);
  };

  const clear = () => {
    setFinalSegments([]);
    setInterim("");
    setError(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Ghi âm → Văn bản (Tiếng Việt)</h1>

      <div className="mb-4 flex items-center gap-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Bắt đầu ghi
          </button>
        ) : (
          <button onClick={stopRecording} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
            Dừng
          </button>
        )}

        <button onClick={clear} className="px-3 py-2 rounded border">
          Xóa
        </button>
        <div className="text-sm text-gray-600">Trạng thái: {recording ? "Đang ghi" : "Đã dừng"}</div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div>
        <h2 className="text-lg font-medium mb-2">Văn bản</h2>
        <textarea
          className="w-full min-h-[200px] border p-3 rounded mb-2 text-black"
          value={finalSegments.join(" ") + (interim ? ` ${interim}` : "")}
          readOnly
        />
        <div className="text-sm text-gray-500">Gợi ý: dùng Chrome (phiên bản hỗ trợ Web Speech API). Ngôn ngữ đã đặt: Tiếng Việt (vi-VN).</div>
      </div>
    </div>
  );
}
