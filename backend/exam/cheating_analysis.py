from datetime import datetime, timezone
import numpy as np
from typing import Dict, List, Any
import re

class CheatingAnalyzer:
    def __init__(self):
        # Weights for different cheating indicators
        self.weights = {
            'keylog_suspicious': 0.3,    # Suspicious keyboard patterns
            'tab_switching': 0.15,       # Frequent tab switching
            'window_resize': 0.1,        # Window resizing during exam
            'mobile_activity': 0.15,     # Mobile device activity
            'audio_anomalies': 0.2,      # Audio anomalies
            'face_detection': 0.1        # Face detection issues
        }

    def analyze_keylogs(self, keylogs: Dict[str, Dict[str, int]]) -> float:
        """
        Analyze keyboard logs for suspicious patterns
        Returns a score between 0 and 1
        """
        if not keylogs:
            return 0.0

        suspicious_patterns = {
            'copy_paste': ['ctrl+c', 'ctrl+v', 'ctrl+x'],
            'shortcuts': ['alt+tab', 'win+d', 'win+e'],
            'browser': ['f5', 'ctrl+r', 'ctrl+l'],
            'suspicious': ['printscreen', 'screenshot']
        }

        total_events = sum(sum(counts.values()) for counts in keylogs.values())
        if total_events == 0:
            return 0.0

        suspicious_count = 0
        for pattern_type, patterns in suspicious_patterns.items():
            for pattern in patterns:
                for timestamp, events in keylogs.items():
                    if pattern in events:
                        suspicious_count += events[pattern]

        return min(suspicious_count / total_events, 1.0)

    def analyze_tab_switching(self, tab_events: List[Dict[str, Any]]) -> float:
        """
        Analyze tab switching frequency and patterns
        Returns a score between 0 and 1
        """
        if not tab_events:
            return 0.0

        # Calculate average time between tab switches
        timestamps = [datetime.fromisoformat(event['timestamp']) for event in tab_events]
        time_diffs = [(timestamps[i] - timestamps[i-1]).total_seconds() 
                     for i in range(1, len(timestamps))]

        if not time_diffs:
            return 0.0

        avg_time_diff = np.mean(time_diffs)
        # Consider suspicious if average time between switches is less than 5 seconds
        return min(1.0, max(0.0, 1 - (avg_time_diff / 5)))

    def analyze_window_resize(self, resize_events: List[Dict[str, Any]]) -> float:
        """
        Analyze window resize events for suspicious patterns
        Returns a score between 0 and 1
        """
        if not resize_events:
            return 0.0

        # Count significant resize events (more than 20% change)
        significant_resizes = 0
        for event in resize_events:
            width_change = abs(event['screenWidth'] - event.get('baselineWidth', 0))
            height_change = abs(event['screenHeight'] - event.get('baselineHeight', 0))
            
            if width_change > event.get('baselineWidth', 0) * 0.2 or \
               height_change > event.get('baselineHeight', 0) * 0.2:
                significant_resizes += 1

        return min(significant_resizes / len(resize_events), 1.0)

    def analyze_mobile_activity(self, mobile_events: List[Dict[str, Any]]) -> float:
        """
        Analyze mobile device activity for suspicious patterns
        Returns a score between 0 and 1
        """
        if not mobile_events:
            return 0.0

        suspicious_events = 0
        for event in mobile_events:
            if event['event'] in ['blur', 'visibilitychange']:
                suspicious_events += 1

        return min(suspicious_events / len(mobile_events), 1.0)

    def analyze_audio_anomalies(self, audio_events: List[Dict[str, Any]]) -> float:
        """
        Analyze audio events for suspicious patterns
        Returns a score between 0 and 1
        """
        if not audio_events:
            return 0.0

        # Count events marked as abnormal
        abnormal_count = sum(1 for event in audio_events if event.get('isAbnormal', False))
        return min(abnormal_count / len(audio_events), 1.0)

    def analyze_face_detection(self, frames: List[Dict[str, Any]]) -> float:
        """
        Analyze face detection results for suspicious patterns
        Returns a score between 0 and 1
        """
        if not frames:
            return 0.0

        suspicious_frames = 0
        for frame in frames:
            # Check for multiple faces or no face detected
            faces = [obj for obj in frame.get('objects', []) if obj.get('class') == 'person']
            if len(faces) > 1 or len(faces) == 0:
                suspicious_frames += 1

        return min(suspicious_frames / len(frames), 1.0)

    def calculate_cheating_probability(self, exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate overall cheating probability based on all available data
        Returns a dictionary with detailed analysis and final score
        """
        analysis = {
            'keylog_score': self.analyze_keylogs(exam_data.get('suspiciousKeylogs', {})),
            'tab_switching_score': self.analyze_tab_switching(exam_data.get('tabEvents', [])),
            'window_resize_score': self.analyze_window_resize(exam_data.get('resizeEvents', [])),
            'mobile_activity_score': self.analyze_mobile_activity(exam_data.get('mobileEvents', [])),
            'audio_anomalies_score': self.analyze_audio_anomalies(exam_data.get('audioEvents', [])),
            'face_detection_score': self.analyze_face_detection(exam_data.get('frames', []))
        }

        # Calculate weighted average
        total_score = sum(
            score * self.weights[category]
            for category, score in analysis.items()
        )

        # Determine risk level
        if total_score >= 0.7:
            risk_level = "High"
        elif total_score >= 0.4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            'detailed_scores': analysis,
            'total_score': round(total_score, 3),
            'risk_level': risk_level,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

def get_cheating_analysis(exam_id: str, username: str, db) -> Dict[str, Any]:
    """
    Main function to get cheating analysis for a specific exam attempt
    """
    try:
        # Get exam attempt data
        attempt = db['attempted_exams'].find_one({
            'examId': exam_id,
            'username': username
        })

        if not attempt:
            return {
                'success': False,
                'message': 'Exam attempt not found'
            }

        # Get additional monitoring data
        frames = list(db['frames'].find({
            'exam_id': exam_id,
            'username': username
        }))

        mobile_events = list(db['mobile_activity_logs'].find({
            'examId': exam_id,
            'username': username
        }))

        audio_events = list(db['audio_logs'].find({
            'examId': exam_id,
            'username': username
        }))

        # Prepare data for analysis
        exam_data = {
            'suspiciousKeylogs': attempt.get('suspiciousKeylogs', {}),
            'tabEvents': attempt.get('tabEvents', []),
            'resizeEvents': attempt.get('resizeEvents', []),
            'mobileEvents': mobile_events,
            'audioEvents': audio_events,
            'frames': frames
        }

        # Perform analysis
        analyzer = CheatingAnalyzer()
        analysis_result = analyzer.calculate_cheating_probability(exam_data)

        # Update the attempt with analysis results
        db['attempted_exams'].update_one(
            {'_id': attempt['_id']},
            {'$set': {'cheating_analysis': analysis_result}}
        )

        return {
            'success': True,
            'analysis': analysis_result
        }

    except Exception as e:
        return {
            'success': False,
            'message': f'Error analyzing exam data: {str(e)}'
        } 