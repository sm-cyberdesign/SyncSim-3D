/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Video,
  X,
  Download,
  AlertCircle,
  CheckCircle2,
  Square,
  Play,
  Volume2,
  FileDown,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface RecordingWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAuditLog: () => void;
}

export const RecordingWorkflowModal: React.FC<RecordingWorkflowModalProps> = ({
  isOpen,
  onClose,
  onExportAuditLog,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  if (!isOpen) return null;

  const startScreenRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen recording is not supported in this browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30 },
        },
        audio: true, // Will capture tab audio if checked by user
      });

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
      });

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(fullBlob);
        setRecordedBlobUrl(url);
        setIsRecording(false);
        soundEngine.playResolution();
      };

      // Handle stream stopped via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      soundEngine.playStart();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-100"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 id="record-title" className="text-sm font-bold text-white uppercase tracking-wider">
                Screen Recording & Exercise Export
              </h2>
              <p className="text-[11px] text-slate-400">Capturing tabletop presentations & debrief videos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Browser Capture Controls */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide block">
            Browser-Native Screen Capture (WebM)
          </span>

          <p className="text-xs text-slate-300 leading-relaxed">
            Record a synchronized video of the 3D tabletop exercise and camera pans directly from your browser.
          </p>

          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startScreenRecording}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start Video Recording</span>
              </button>
            ) : (
              <button
                onClick={stopScreenRecording}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording</span>
              </button>
            )}

            {recordedBlobUrl && (
              <a
                href={recordedBlobUrl}
                download="operation-silent-ledger-recording.webm"
                className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download .WebM</span>
              </a>
            )}
          </div>
        </div>

        {/* Audio Synchronization Disclosure */}
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] uppercase">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & Speech Synthesis Notice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            When capturing tab video in Chrome or Edge, remember to check <strong>"Also share tab audio"</strong> in the browser prompt if you wish to record Web Audio chimes. Web Speech API narration runs locally on system speech synthesizers and may require system audio capture.
          </p>
        </div>

        {/* Audit Log Download */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Prefer structured text?</span>
            <span className="text-[11px] text-slate-400">Export complete decision and inject timeline as JSON</span>
          </div>
          <button
            onClick={() => {
              onExportAuditLog();
              soundEngine.playSelect();
            }}
            className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export JSON Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
