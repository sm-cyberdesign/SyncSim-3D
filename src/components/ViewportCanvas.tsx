/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { SimulationScene } from '../three/SimulationScene';
import {
  OrgLevelInfo,
  SimulationParameters,
  Collaborator,
  SpatialAnnotation,
  DepartmentNode,
  CameraPreset,
} from '../types/simulation';

interface ViewportCanvasProps {
  levels: OrgLevelInfo[];
  parameters: SimulationParameters;
  isPlaying: boolean;
  playbackSpeed: number;
  simulationProgress: number;
  collaborators: Collaborator[];
  annotations: SpatialAnnotation[];
  selectedDepartment: DepartmentNode | null;
  selectedLevelId: number | null;
  cameraPreset: CameraPreset;
  onSelectDepartment: (dept: DepartmentNode | null) => void;
  onSelectLevel: (levelId: number | null) => void;
  onSceneReady?: (scene: SimulationScene) => void;
}

export const ViewportCanvas: React.FC<ViewportCanvasProps> = ({
  levels,
  parameters,
  isPlaying,
  playbackSpeed,
  simulationProgress,
  collaborators,
  annotations,
  selectedDepartment,
  selectedLevelId,
  cameraPreset,
  onSelectDepartment,
  onSelectLevel,
  onSceneReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SimulationScene | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new SimulationScene(
      mountRef.current,
      levels,
      parameters,
      {
        onSelectDepartment,
        onSelectLevel,
      }
    );

    sceneRef.current = scene;
    if (onSceneReady) {
      onSceneReady(scene);
    }

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []); // Mount once! Stable WebGL Lifecycle

  // Sync parameters
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateParameters(parameters);
    }
  }, [parameters]);

  // Sync playback
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setPlayback(isPlaying, playbackSpeed);
    }
  }, [isPlaying, playbackSpeed]);

  // Sync timeline progress when scrubbed
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setSimulationProgress(simulationProgress);
    }
  }, [simulationProgress]);

  // Sync collaborators and annotations
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateCollaborators(collaborators, annotations);
    }
  }, [collaborators, annotations]);

  // Sync camera preset
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Sync selection
  useEffect(() => {
    if (sceneRef.current) {
      if (selectedDepartment) {
        sceneRef.current.selectDepartment(selectedDepartment);
      } else if (selectedLevelId) {
        sceneRef.current.selectLevel(selectedLevelId);
      } else {
        sceneRef.current.clearSelection();
      }
    }
  }, [selectedDepartment, selectedLevelId]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      tabIndex={0}
      aria-label="3D Organizational Simulation Viewport"
    />
  );
};
