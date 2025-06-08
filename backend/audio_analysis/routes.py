from flask import Blueprint, request, jsonify
from .diarization import ExamAudioDiarizer
import os
import logging
from pydub import AudioSegment

logger = logging.getLogger(__name__)

audio_analysis = Blueprint('audio_analysis', __name__)
diarizer = ExamAudioDiarizer()

@audio_analysis.route('/analyze-exam-audio', methods=['POST'])
def analyze_exam_audio():
    """
    Analyze exam audio file for speaker diarization
    """
    try:
        if 'audio_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400
            
        audio_file = request.files['audio_file']
        if not audio_file.filename:
            return jsonify({
                'success': False,
                'error': 'No selected file'
            }), 400
            
        # Save the uploaded file temporarily
        temp_dir = 'temp'
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, audio_file.filename)
        audio_file.save(temp_path)
        
        # If the file is .webm, convert to .wav for processing
        if temp_path.endswith('.webm'):
            wav_path = temp_path.rsplit('.', 1)[0] + '.wav'
            audio = AudioSegment.from_file(temp_path, format='webm')
            audio.export(wav_path, format='wav')
            os.remove(temp_path)  # Remove the .webm temp file
            temp_path = wav_path
        
        # Process the audio file (now always .wav)
        results = diarizer.process_exam_audio(temp_path)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error processing exam audio: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 