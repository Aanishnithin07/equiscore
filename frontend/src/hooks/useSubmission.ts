import { useState, useCallback, useRef } from 'react';
import { api, apiClient } from '../api/client';
import { EvaluationStatusResponse, TrackEnum } from '../types/evaluation';

export function useSubmission() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Polling State
  const [evalStatus, setEvalStatus] = useState<EvaluationStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearState = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setJobId(null);
    setError(null);
    setEvalStatus(null);
    stopPolling();
  };

  const uploadPitch = async (
    teamName: string, 
    track: TrackEnum, 
    pitchFile: File, 
    behaviorFile?: File
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('team_name', teamName);
    formData.append('track', track);
    formData.append('pitch_file', pitchFile);
    
    // Add audio/video behavioral tracking file if provided
    if (behaviorFile) {
        formData.append('behavior_file', behaviorFile);
    }

    try {
      const response = await apiClient.post('/evaluate-pitch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        },
      });
      
      const newJobId = response.data.job_id;
      setJobId(newJobId);
      setIsUploading(false);
      startPolling(newJobId);
      return newJobId;
    } catch (err: any) {
      setIsUploading(false);
      setError(err.response?.data?.detail || 'Failed to upload submission');
      throw err;
    }
  };

  const startPolling = useCallback((targetJobId: string) => {
    setIsPolling(true);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const data = await api.getEvaluation(targetJobId);
        setEvalStatus(data);
        
        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling();
        }
      } catch (err) {
        // We log silently so we don't break the UI if one polling request drops
        console.warn('Polling error:', err);
      }
    }, 3000); // 3 second polling
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return {
    isUploading,
    uploadProgress,
    jobId,
    error,
    evalStatus,
    isPolling,
    uploadPitch,
    clearState
  };
}
