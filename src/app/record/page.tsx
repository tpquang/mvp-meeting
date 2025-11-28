"use client";

import React, { useEffect, useRef, useState } from "react";
import useRequireAuth from "@/hooks/useRequireAuth";
import createSpeechRecognition from "@/services/speech";
import { generateMeetingMinutes } from "@/services/aiService";

interface MeetingData {
  fullTranscript: string;
  meetingContent: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  hasValidMeeting: boolean;
}

export default function RecordPage() {
  useRequireAuth();

  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalSegments, setFinalSegments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
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

  const processMeetingTranscript = (transcript: string): MeetingData => {
    const normalizedText = transcript.toLowerCase();
    
    // Tìm vị trí "bắt đầu cuộc họp"
    const startPatterns = [
      "bắt đầu cuộc họp",
      "bat dau cuoc hop",
      "bắt đầu họp",
      "bat dau hop"
    ];
    
    // Tìm vị trí "kết thúc cuộc họp"
    const endPatterns = [
      "kết thúc cuộc họp",
      "ket thuc cuoc hop",
      "kết thúc họp",
      "ket thuc hop"
    ];
    
    let startIndex = -1;
    let endIndex = -1;
    
    // Tìm startIndex
    for (const pattern of startPatterns) {
      const idx = normalizedText.indexOf(pattern);
      if (idx !== -1) {
        startIndex = idx;
        break;
      }
    }
    
    // Tìm endIndex
    for (const pattern of endPatterns) {
      const idx = normalizedText.indexOf(pattern);
      if (idx !== -1) {
        endIndex = idx;
        break;
      }
    }
    
    let meetingContent = transcript;
    let hasValidMeeting = false;
    let startTime: string | null = null;
    let endTime: string | null = null;
    let duration: string | null = null;
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      // Cắt nội dung từ sau "bắt đầu" đến trước "kết thúc"
      const startCutIndex = normalizedText.indexOf(" ", startIndex) + 1;
      meetingContent = transcript.substring(startCutIndex, endIndex).trim();
      hasValidMeeting = true;
      
      // Tính thời gian nếu có
      if (recordingStartTime) {
        const now = new Date();
        startTime = recordingStartTime.toLocaleString("vi-VN");
        endTime = now.toLocaleString("vi-VN");
        const durationMs = now.getTime() - recordingStartTime.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        duration = `${minutes} phút ${seconds} giây`;
      }
    } else if (startIndex !== -1) {
      // Chỉ có "bắt đầu", lấy từ sau đó đến hết
      const startCutIndex = normalizedText.indexOf(" ", startIndex) + 1;
      meetingContent = transcript.substring(startCutIndex).trim();
      hasValidMeeting = true;
    } else if (endIndex !== -1) {
      // Chỉ có "kết thúc", lấy từ đầu đến trước đó
      meetingContent = transcript.substring(0, endIndex).trim();
      hasValidMeeting = true;
    }
    
    return {
      fullTranscript: transcript,
      meetingContent,
      startTime,
      endTime,
      duration,
      hasValidMeeting
    };
  };

  const startRecording = async () => {
    setError(null);
    setMeetingData(null);
    setMinutes(null);
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
      setRecordingStartTime(new Date());
    } catch (e) {
      setError("Không thể bắt đầu ghi âm: " + String(e));
    }
  };

  const stopRecording = () => {
    controllerRef.current?.stop();
    setRecording(false);
    
    // Xử lý và cắt transcript ngay sau khi dừng
    const fullText = finalSegments.join(" ");
    if (fullText.trim()) {
      const processed = processMeetingTranscript(fullText);
      setMeetingData(processed);
      
      if (!processed.hasValidMeeting) {
        setError("Không tìm thấy cụm 'bắt đầu cuộc họp' hoặc 'kết thúc cuộc họp'. Đang hiển thị toàn bộ nội dung.");
      }
    }
  };

  const clear = () => {
    setFinalSegments([]);
    setInterim("");
    setError(null);
    setMinutes(null);
    setMeetingData(null);
    setRecordingStartTime(null);
  };

  const exportToTXT = () => {
    if (!meetingData) return;
    
    let content = "=== BIÊN BẢN CUỘC HỌP ===\n\n";
    
    if (meetingData.startTime) {
      content += `Thời gian bắt đầu: ${meetingData.startTime}\n`;
    }
    if (meetingData.endTime) {
      content += `Thời gian kết thúc: ${meetingData.endTime}\n`;
    }
    if (meetingData.duration) {
      content += `Thời lượng: ${meetingData.duration}\n`;
    }
    
    content += "\n=== NỘI DUNG CUỘC HỌP ===\n\n";
    content += meetingData.meetingContent;
    
    if (minutes) {
      content += "\n\n=== BIÊN BẢN TỰ ĐỘNG (AI) ===\n\n";
      content += minutes;
    }
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bien-ban-hop-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!meetingData) return;
    
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        duration: meetingData.duration,
        hasValidMeetingMarkers: meetingData.hasValidMeeting
      },
      transcript: {
        full: meetingData.fullTranscript,
        meetingContent: meetingData.meetingContent
      },
      aiGeneratedMinutes: minutes || null
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bien-ban-hop-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateMinutes = async () => {
    setError(null);
    setMinutes(null);
    
    // Sử dụng meetingContent đã được cắt nếu có, nếu không dùng full transcript
    const transcript = meetingData?.meetingContent || finalSegments.join(" ");
    
    if (!transcript.trim()) {
      setError("Không có văn bản để chuyển thành biên bản.");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateMeetingMinutes(transcript);
      if (!res.ok) {
        setError(res.message || "Lỗi khi gọi AI");
      } else {
        setMinutes(res.minutes || null);
      }
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-red-600">Ghi âm → Văn bản (Tiếng Việt)</h1>

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
        <div className="text-sm text-gray-800">Trạng thái: {recording ? "Đang ghi" : "Đã dừng"}</div>
      </div>

      {/* Export buttons */}
      {meetingData && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={exportToTXT}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải xuống TXT
          </button>
          <button
            onClick={exportToJSON}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải xuống JSON
          </button>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleGenerateMinutes}
          disabled={generating || !finalSegments.length}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Đang tạo biên bản..." : "Chuyển thành biên bản họp"}
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Meeting metadata */}
      {meetingData && (
        <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Thông tin cuộc họp</h3>
          {meetingData.startTime && (
            <p className="text-sm text-blue-800">
              <span className="font-medium">Bắt đầu:</span> {meetingData.startTime}
            </p>
          )}
          {meetingData.endTime && (
            <p className="text-sm text-blue-800">
              <span className="font-medium">Kết thúc:</span> {meetingData.endTime}
            </p>
          )}
          {meetingData.duration && (
            <p className="text-sm text-blue-800">
              <span className="font-medium">Thời lượng:</span> {meetingData.duration}
            </p>
          )}
          <p className="text-sm text-blue-800 mt-1">
            <span className="font-medium">Trạng thái:</span>{" "}
            {meetingData.hasValidMeeting 
              ? "✓ Đã phát hiện điểm bắt đầu/kết thúc" 
              : "⚠ Chưa phát hiện điểm bắt đầu/kết thúc"}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-2 text-red-600">
          {meetingData?.hasValidMeeting ? "Nội dung cuộc họp (đã cắt)" : "Văn bản ghi âm"}
        </h2>
        <textarea
          className="w-full min-h-[200px] border p-3 rounded mb-2 text-black"
          value={
            meetingData 
              ? meetingData.meetingContent 
              : finalSegments.join(" ") + (interim ? ` ${interim}` : "")
          }
          readOnly
        />
        <div className="text-sm text-gray-800">
          <strong>Hướng dẫn:</strong> Nói rõ <span className="font-semibold text-blue-600">"bắt đầu cuộc họp"</span> và{" "}
          <span className="font-semibold text-blue-600">"kết thúc cuộc họp"</span> để hệ thống tự động cắt nội dung.
          <br />
          Gợi ý: dùng Chrome (phiên bản hỗ trợ Web Speech API). Ngôn ngữ đã đặt: Tiếng Việt (vi-VN).
        </div>
      </div>

      {minutes && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2 text-red-600">Biên bản tạo tự động</h2>
          <textarea
            className="w-full min-h-[200px] border p-3 rounded mb-2 text-black"
            value={minutes}
            readOnly
          />
        </div>
      )}
    </div>
  );
}
