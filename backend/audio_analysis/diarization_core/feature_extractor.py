import numpy as np
import librosa
import logging

logger = logging.getLogger(__name__)

class FeatureExtractor:
    """
    Class for extracting MFCC features from audio for diarization.
    """
    def __init__(self, sample_rate=16000, n_mfcc=13, n_mels=40, n_fft=512, hop_length=160):
        """
        Initialize the feature extractor.
        
        Args:
            sample_rate (int): Audio sample rate in Hz
            n_mfcc (int): Number of MFCC coefficients to extract
            n_mels (int): Number of Mel bands to generate
            n_fft (int): Length of the FFT window
            hop_length (int): Number of samples between successive frames
        """
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.hop_length = hop_length
        
        logger.debug(f"Initialized feature extractor with {n_mfcc} MFCCs, "
                     f"{n_mels} Mel bands, FFT window {n_fft}, hop length {hop_length}")
    
    def extract_mfcc(self, audio_data, sample_rate=None):
        """
        Extract MFCC features from audio data.
        
        Args:
            audio_data (numpy.ndarray): Audio time series
            sample_rate (int): Sample rate of the audio data
            
        Returns:
            numpy.ndarray: MFCC features
        """
        if sample_rate is None:
            sample_rate = self.sample_rate
            
        # Resample if necessary
        if sample_rate != self.sample_rate:
            logger.info(f"Resampling from {sample_rate}Hz to {self.sample_rate}Hz")
            audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=self.sample_rate)
            sample_rate = self.sample_rate
            
        # Extract MFCCs
        mfccs = librosa.feature.mfcc(
            y=audio_data,
            sr=sample_rate,
            n_mfcc=self.n_mfcc,
            n_mels=self.n_mels,
            n_fft=self.n_fft,
            hop_length=self.hop_length
        )
        
        # Add delta features
        delta_mfccs = librosa.feature.delta(mfccs)
        delta2_mfccs = librosa.feature.delta(mfccs, order=2)
        
        # Combine features
        features = np.vstack([mfccs, delta_mfccs, delta2_mfccs])
        
        return features
    
    def extract_features_from_segments(self, audio_data, segments, sample_rate=None):
        """
        Extract features from voice segments in audio data.
        
        Args:
            audio_data (numpy.ndarray): Audio time series
            segments (list): List of (start_time, end_time) tuples
            sample_rate (int): Sample rate of the audio data
            
        Returns:
            list: List of feature arrays for each segment
        """
        if sample_rate is None:
            sample_rate = self.sample_rate
            
        features_list = []
        
        for start_time, end_time in segments:
            # Convert time to samples
            start_sample = int(start_time * sample_rate)
            end_sample = int(end_time * sample_rate)
            
            # Extract segment
            segment = audio_data[start_sample:end_sample]
            
            # Skip very short segments
            if len(segment) < self.n_fft:
                logger.warning(f"Skipping segment ({start_time:.2f}s-{end_time:.2f}s) - too short")
                continue
                
            # Extract features from segment
            try:
                segment_features = self.extract_mfcc(segment, sample_rate)
                features_list.append({
                    'start_time': start_time,
                    'end_time': end_time,
                    'features': segment_features
                })
            except Exception as e:
                logger.error(f"Error extracting features for segment {start_time}-{end_time}: {str(e)}")
                
        logger.info(f"Extracted features from {len(features_list)} segments")
        return features_list 