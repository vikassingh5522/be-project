import os
import numpy as np
import librosa
from .diarization_core.voice_detector import VoiceDetector
from .diarization_core.feature_extractor import FeatureExtractor
from .diarization_core.speaker_diarization import SpeakerDiarization
import logging

logger = logging.getLogger(__name__)

class ExamAudioDiarizer:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.voice_detector = VoiceDetector(sample_rate=sample_rate)
        self.feature_extractor = FeatureExtractor(sample_rate=sample_rate)
        self.speaker_diarizer = SpeakerDiarization(num_speakers=2)  # Assuming 2 speakers (student and proctor)
        
    def process_exam_audio(self, audio_file_path):
        """
        Process exam audio file to detect and separate speakers
        
        Args:
            audio_file_path: Path to the exam audio file
            
        Returns:
            dict: Dictionary containing diarization results with speaker segments
        """
        try:
            # Load audio file
            audio_data, sr = librosa.load(audio_file_path, sr=self.sample_rate)
            
            # Detect voice segments
            voice_segments = self.voice_detector.detect_voice_segments(audio_data)
            
            # Extract features from segments
            features_list = self.feature_extractor.extract_features_from_segments(
                audio_data, voice_segments, self.sample_rate
            )
            
            # Perform speaker diarization
            diarized_segments = self.speaker_diarizer.diarize(features_list)
            
            # Merge consecutive segments from same speaker
            merged_segments = self.speaker_diarizer.merge_consecutive_segments(diarized_segments)
            
            # Format results for visualization
            results = {
                "success": True,
                "segments": [
                    {
                        "speaker": f"Speaker {segment['speaker']}",
                        "start": segment['start_time'],
                        "end": segment['end_time'],
                        "duration": segment['end_time'] - segment['start_time']
                    }
                    for segment in merged_segments
                ],
                "total_duration": sum(segment['end_time'] - segment['start_time'] 
                                    for segment in merged_segments)
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error in exam audio diarization: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            } 