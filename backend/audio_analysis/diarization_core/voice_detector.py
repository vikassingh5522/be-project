import numpy as np
import librosa
import webrtcvad
import struct
import logging
from collections import deque

logger = logging.getLogger(__name__)

class VoiceDetector:
    """
    Class for detecting human voice segments in audio using WebRTC VAD.
    """
    def __init__(self, sample_rate=16000, frame_duration_ms=30, aggressiveness=3):
        """
        Initialize the voice detector.
        
        Args:
            sample_rate (int): Audio sample rate in Hz
            frame_duration_ms (int): Duration of each frame in milliseconds
            aggressiveness (int): VAD aggressiveness mode (0-3)
        """
        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms
        
        # Initialize WebRTC VAD
        self.vad = webrtcvad.Vad(aggressiveness)
        
        # Calculate frame size
        self.frame_size = int(sample_rate * frame_duration_ms / 1000)
        
        # Buffer for smoothing VAD decisions
        self.buffer_size = 5  # Number of frames to buffer
        self.decision_buffer = deque(maxlen=self.buffer_size)
        
        logger.debug(f"Initialized VAD with sample rate {sample_rate}Hz, "
                     f"frame duration {frame_duration_ms}ms, "
                     f"aggressiveness {aggressiveness}")
    
    def _prepare_frame(self, frame):
        """
        Prepare a frame for WebRTC VAD.
        
        Args:
            frame (numpy.ndarray): Audio frame data
            
        Returns:
            bytes: Frame data as bytes in the format required by WebRTC VAD
        """
        # Ensure the frame is the right length
        if len(frame) != self.frame_size:
            logger.warning(f"Frame size mismatch. Expected {self.frame_size}, got {len(frame)}")
            
            # Pad or truncate the frame
            if len(frame) < self.frame_size:
                frame = np.pad(frame, (0, self.frame_size - len(frame)), 'constant')
            else:
                frame = frame[:self.frame_size]
        
        # Ensure the values are within the valid range for int16
        frame = np.clip(frame, -32768, 32767)
        
        # Convert to int16 bytes
        return struct.pack("%dh" % len(frame), *frame.astype(np.int16))
    
    def is_speech(self, frame):
        """
        Determine if a frame contains speech.
        
        Args:
            frame: Audio frame data (numpy array or bytes)
            
        Returns:
            bool: True if the frame contains speech, False otherwise
        """
        try:
            # Convert to bytes if necessary
            if isinstance(frame, np.ndarray):
                frame_bytes = self._prepare_frame(frame)
            else:
                frame_bytes = frame
            
            # Process with VAD
            is_speech = self.vad.is_speech(frame_bytes, self.sample_rate)
            
            # Add to buffer for smoothing
            self.decision_buffer.append(is_speech)
            
            # Return smoothed decision (majority vote)
            return sum(self.decision_buffer) > len(self.decision_buffer) / 2
            
        except Exception as e:
            logger.error(f"Error in speech detection: {str(e)}")
            return False
    
    def detect_voice_segments(self, audio_data, sample_rate=None):
        """
        Detect voice segments in an audio file.
        
        Args:
            audio_data: Audio data as numpy array
            sample_rate: Sample rate of the audio data, uses default if None
            
        Returns:
            list: List of (start_time, end_time) tuples for each voice segment
        """
        if sample_rate is None:
            sample_rate = self.sample_rate
            
        # Resample if necessary
        if sample_rate != self.sample_rate:
            logger.info(f"Resampling from {sample_rate}Hz to {self.sample_rate}Hz")
            audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=self.sample_rate)
            sample_rate = self.sample_rate
        
        # Split into frames
        num_frames = len(audio_data) // self.frame_size
        voice_segments = []
        in_speech = False
        speech_start = 0
        
        for i in range(num_frames):
            frame = audio_data[i * self.frame_size:(i + 1) * self.frame_size]
            frame_bytes = self._prepare_frame(frame)
            
            is_speech = self.is_speech(frame_bytes)
            
            # State transition: non-speech to speech
            if is_speech and not in_speech:
                speech_start = i * self.frame_duration_ms / 1000.0  # Convert to seconds
                in_speech = True
                
            # State transition: speech to non-speech
            elif not is_speech and in_speech:
                speech_end = i * self.frame_duration_ms / 1000.0
                voice_segments.append((speech_start, speech_end))
                in_speech = False
        
        # Handle case where we end while still in speech
        if in_speech:
            speech_end = num_frames * self.frame_duration_ms / 1000.0
            voice_segments.append((speech_start, speech_end))
            
        logger.info(f"Detected {len(voice_segments)} voice segments")
        return voice_segments 