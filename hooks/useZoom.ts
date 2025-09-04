import { useState, useCallback } from 'react';

export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export function useZoom(initialScale = 1) {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: initialScale,
    translateX: 0,
    translateY: 0,
  });

  const zoomIn = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 3), // Max zoom 3x
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.2), // Min zoom 0.2x
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  const setZoom = useCallback((scale: number) => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(scale, 3)),
    }));
  }, []);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setZoomState(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }));
  }, []);

  const getTransform = useCallback(() => {
    return `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`;
  }, [zoomState]);

  return {
    zoomState,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    pan,
    getTransform,
  };
}