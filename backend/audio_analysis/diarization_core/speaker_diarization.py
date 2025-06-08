import numpy as np
from sklearn.cluster import KMeans
import logging
from collections import Counter

logger = logging.getLogger(__name__)

class SpeakerDiarization:
    """
    Class for performing speaker diarization using MFCC features.
    """
    def __init__(self, num_speakers=2, method='kmeans'):
        """
        Initialize the speaker diarization system.
        
        Args:
            num_speakers (int): Number of speakers to identify
            method (str): Clustering method ('kmeans', 'agglomerative', etc.)
        """
        self.num_speakers = num_speakers
        self.method = method
        
        if method == 'kmeans':
            self.model = KMeans(n_clusters=num_speakers, random_state=42)
        else:
            raise ValueError(f"Unsupported diarization method: {method}")
            
        logger.debug(f"Initialized speaker diarization with {num_speakers} speakers using {method}")
    
    def _prepare_features_for_clustering(self, features_list):
        """
        Prepare features for clustering.
        
        Args:
            features_list (list): List of feature dictionaries
            
        Returns:
            tuple: (feature matrix, segment indices)
        """
        # Extract segment indices and flatten features
        segment_indices = []
        all_features = []
        
        for i, feature_dict in enumerate(features_list):
            # Transpose to get frames as rows, features as columns
            frames = feature_dict['features'].T
            
            # Add to the feature matrix
            all_features.append(frames)
            
            # Keep track of which segment each frame belongs to
            segment_indices.extend([i] * frames.shape[0])
            
        # Combine all features
        feature_matrix = np.vstack(all_features)
        segment_indices = np.array(segment_indices)
        
        return feature_matrix, segment_indices
    
    def _assign_speakers_to_segments(self, cluster_labels, segment_indices, features_list):
        """
        Assign speakers to segments based on clustering.
        
        Args:
            cluster_labels (numpy.ndarray): Cluster assignments for each frame
            segment_indices (numpy.ndarray): Segment index for each frame
            features_list (list): Original feature list
            
        Returns:
            list: Feature list with speaker labels added
        """
        # Count speaker occurrences for each segment
        for i in range(len(features_list)):
            # Find all frames belonging to this segment
            segment_frames = (segment_indices == i)
            
            # Count occurrences of each speaker in this segment
            speaker_counts = Counter(cluster_labels[segment_frames])
            
            # Assign the most common speaker
            most_common_speaker = speaker_counts.most_common(1)[0][0]
            
            # Add to the feature dictionary
            features_list[i]['speaker'] = most_common_speaker
            
        return features_list
    
    def diarize(self, features_list):
        """
        Perform speaker diarization on a list of feature segments.
        
        Args:
            features_list (list): List of dictionaries containing features for each segment
            
        Returns:
            list: Segments with speaker labels
        """
        if not features_list:
            logger.warning("No features provided for diarization")
            return []
            
        try:
            # Prepare features for clustering
            feature_matrix, segment_indices = self._prepare_features_for_clustering(features_list)
            
            # Fit the clustering model
            logger.info(f"Clustering {feature_matrix.shape[0]} frames with {self.num_speakers} speakers")
            self.model.fit(feature_matrix)
            
            # Get cluster labels for each frame
            cluster_labels = self.model.labels_
            
            # Assign speakers to segments
            labeled_segments = self._assign_speakers_to_segments(
                cluster_labels, segment_indices, features_list
            )
            
            logger.info(f"Successfully diarized {len(labeled_segments)} segments")
            return labeled_segments
            
        except Exception as e:
            logger.error(f"Error in speaker diarization: {str(e)}")
            raise
    
    def merge_consecutive_segments(self, segments, speaker_id=None, gap_threshold=0.5):
        """
        Merge consecutive segments from the same speaker.
        
        Args:
            segments (list): List of segment dictionaries with speaker labels
            speaker_id (int): Only merge segments from this speaker (if specified)
            gap_threshold (float): Maximum gap between segments to merge (seconds)
            
        Returns:
            list: Merged segments
        """
        if not segments:
            return []
            
        # Sort segments by start time
        segments = sorted(segments, key=lambda x: x['start_time'])
        
        merged_segments = []
        current_segment = segments[0].copy()
        
        for next_segment in segments[1:]:
            # Skip if we're filtering by speaker and this isn't the right one
            if speaker_id is not None and next_segment['speaker'] != speaker_id:
                continue
                
            # Check if segments are from the same speaker and close enough
            if (next_segment['speaker'] == current_segment['speaker'] and 
                next_segment['start_time'] - current_segment['end_time'] <= gap_threshold):
                # Merge by extending the end time
                current_segment['end_time'] = next_segment['end_time']
            else:
                # Add the current segment and start a new one
                merged_segments.append(current_segment)
                current_segment = next_segment.copy()
                
        # Add the last segment
        merged_segments.append(current_segment)
        
        logger.info(f"Merged {len(segments)} segments into {len(merged_segments)} segments")
        return merged_segments 