from flask import request, jsonify
from werkzeug.utils import secure_filename
import datetime
import os
import jwt
from pydub import AudioSegment
from pyannote.audio import Pipeline
from dotenv import load_dotenv
from database import init_db
load_dotenv()


# db_data = init_db()
# db_collection = db_data['db_collection']
# pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1")

# def analyze_speakers_in_5min_windows(audio_path):
#     diarization = pipeline(audio_path)

#     audio = AudioSegment.from_file(audio_path)
#     total_duration_sec = len(audio) / 1000
#     window_size = 5 * 60

#     windows = []
#     for start_time in range(0, int(total_duration_sec), window_size):
#         end_time = min(start_time + window_size, total_duration_sec)
#         speakers_in_window = set()

#         for turn in diarization.itertracks(yield_label=True):
#             segment, _, speaker = turn
#             seg_start = segment.start
#             seg_end = segment.end

#             if seg_end < start_time or seg_start > end_time:
#                 continue

#             speakers_in_window.add(speaker)

#         windows.append({
#             "start": str(datetime.timedelta(seconds=start_time)),
#             "end": str(datetime.timedelta(seconds=end_time)),
#             "speaker_count": len(speakers_in_window),
#             "speakers": list(speakers_in_window)
#         })

#     return windows

def run_speaker_analysis_and_store(audio_path, exam_id, username, filename):
    print(f"recieved audio for {username}, with examId {exam_id}, the audio is stored at: {audio_path}, with file name: {filename}")
    # try:
    #     analysis_result = analyze_speakers_in_5min_windows(audio_path)
    #     print(analysis_result)
    #     print(f"for examId:{exam_id}, username: {username},")
    #     db_collection.update_one(
    #         {"examId": exam_id, "username": username, "recordings.file": filename},
    #         {"$set": {"recordings.$.analysis": analysis_result}}
    #     )
    #     print(f"Speaker analysis stored for {filename}")
    # except Exception as e:
    #     print(f"Failed to analyze audio {filename}: {str(e)}")
