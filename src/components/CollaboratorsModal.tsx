/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Collaborator, SpatialAnnotation } from '../types/simulation';
import { Users, MapPin, X, ThumbsUp, Plus, MessageSquare } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  annotations: SpatialAnnotation[];
  onAddAnnotation: (levelId: number, content: string) => void;
  onVoteAnnotation: (annotId: string) => void;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  annotations,
  onAddAnnotation,
  onVoteAnnotation,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(3);
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddAnnotation(selectedLevelId, newContent.trim());
    setNewContent('');
    setIsAdding(false);
    soundEngine.playSelect();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/90 p-5 text-slate-100 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Multi-User Collaboration</h2>
              <p className="text-xs text-slate-400">Active team presence & 3D spatial notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collaborators Active List */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Active Team Members in Session
          </div>
          <div className="grid grid-cols-2 gap-2">
            {collaborators.map(c => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5"
              >
                <div
                  style={{ backgroundColor: c.avatarColor }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase shrink-0 ring-2 ring-slate-800"
                >
                  {c.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{c.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{c.role}</div>
                  {c.currentFocusLevel && (
                    <div className="text-[9px] font-mono text-cyan-400">
                      Viewing Level {c.currentFocusLevel}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial Annotations Feed */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              3D Spatial Annotations ({annotations.length})
            </span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Drop Pin</span>
            </button>
          </div>

          {/* New pin form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="p-3 bg-slate-950 rounded-xl border border-cyan-500/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Tier:</span>
                <select
                  value={selectedLevelId}
                  onChange={e => setSelectedLevelId(parseInt(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                >
                  <option value={4}>Level 4: Strategy & Executive</option>
                  <option value={3}>Level 3: Product & Engineering</option>
                  <option value={2}>Level 2: Cloud & Data</option>
                  <option value={1}>Level 1: Market & Field Delivery</option>
                </select>
              </div>
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Write your observation or recommendation for this tier..."
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  Pin to 3D Scene
                </button>
              </div>
            </form>
          )}

          {annotations.map(annot => (
            <div
              key={annot.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-bold text-white">{annot.authorName}</span>
                  <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                    Tier {annot.levelId}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{annot.createdAt}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{annot.content}</p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    onVoteAnnotation(annot.id);
                    soundEngine.playSelect();
                  }}
                  className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-cyan-400 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 flex items-center gap-1 transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{annot.votes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
