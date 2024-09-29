from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = "Hello"

# Initialize SocketIO
socketio = SocketIO(app)
@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/working')
def working():
    return jsonify({'message': "HEllo"})

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000)
