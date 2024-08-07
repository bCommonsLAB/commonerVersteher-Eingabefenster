from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from pathlib import Path
import requests
from gtts import gTTS
import threading
import time
from langdetect import detect
import config  # Import der neuen config.py

app = Flask(__name__)
CORS(app)

# API-Schlüssel für OpenAI festlegen
api_key = config.config['myopenkey']

@app.route('/commoner/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        app.logger.error('Keine Audiodatei gefunden')
        return jsonify({'error': 'Keine Audiodatei gefunden'}), 400

    audio_file = request.files['audio']
    audio_file_path = 'audio.mp3'
    audio_file.save(audio_file_path)

    try:
        # Audio mit der Whisper API von OpenAI transkribieren
        with open(audio_file_path, 'rb') as f:
            response = requests.post(
                'https://api.openai.com/v1/audio/transcriptions',
                headers={
                    'Authorization': f'Bearer {api_key}',
                },
                files={
                    'file': f,
                },
                data={
                    'model': 'whisper-1',
                    'language': 'de'
                }
            )

        # Überprüfen, ob die Anfrage erfolgreich war
        if response.status_code == 200:
            response_data = response.json()
            app.logger.info(f"API-Antwort: {response_data}")
            transcript = response_data.get('text', '')
            language = response_data.get('language', 'de')
            prompt = config.config['jsonbuild'] + transcript
        else:
            app.logger.error(f'Fehler bei der API-Anfrage: {response.status_code}, Antwort: {response.text}')
            return jsonify({'error': 'Fehler bei der API-Anfrage'}), 500

        # Anfrage an OpenAI's GPT-3.5-turbo senden
        completion_response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': config.config['modelname'],
                'messages': [
                    {"role": "system", "content": "Du bist ein Wissenschaftler, der sich im Bereich Commoning auskennt."},
                    {"role": "user", "content": prompt}
                ]
            }
        )

        # Überprüfen, ob die Anfrage erfolgreich war
        if completion_response.status_code == 200:
            completion_data = completion_response.json()
            try:
                # Extrahiere die Nachricht und verarbeite das JSON
                message_content = completion_data['choices'][0]['message']['content'].strip()
                json_result = json.loads(message_content)
                app.logger.info(json_result)
                return jsonify(json_result), 200
            except json.JSONDecodeError as e:
                app.logger.error(f'Fehler beim Dekodieren der JSON-Antwort: {e}')
                app.logger.error(f'Aktuelle API-Antwort: {completion_response.text}')
                return jsonify({'error': 'Fehler bei der Verarbeitung der OpenAI-Antwort'}), 500
            except Exception as e:
                app.logger.error(f'Allgemeiner Fehler bei der Verarbeitung der OpenAI-Antwort: {e}')
                return jsonify({'error': 'Fehler bei der Verarbeitung der OpenAI-Antwort'}), 500

            try:
                result = completion_response['choices'][0]['message']['content'].replace("```json","").replace("```", "")
                json_result = json.loads(result)
            except Exception as e:
                app.logger.error(f'Error processing OpenAI response: {e}')
                return jsonify({'error': 'Error processing OpenAI response'}), 500

            return jsonify(json_result), 200
        else:
            app.logger.error(f'Fehler bei der API-Anfrage (Completion): {completion_response.status_code}, Antwort: {completion_response.text}')
            return jsonify({'error': 'Fehler bei der API-Anfrage (Completion)'}), 500

    except Exception as e:
        app.logger.error(f'Fehler während der Transkription oder Verarbeitung: {e}')
        return jsonify({'error': 'Fehler während der Transkription oder Verarbeitung'}), 500

    finally:
        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)

def delayed_delete(file_path, delay=5):
    """Löscht die angegebene Datei nach einer Verzögerung."""
    def delete_file():
        time.sleep(delay)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            app.logger.error(f"Fehler beim Löschen der Datei {file_path}: {e}")

    thread = threading.Thread(target=delete_file)
    thread.start()

@app.route('/commoner/tts', methods=['POST', 'OPTIONS'])
def tts():
    if request.method == 'OPTIONS':
        return '', 200  # Antwort auf CORS Preflight Anfrage

    data = request.get_json()
    text = data.get('text')
    section = data.get('section')
    if not text:
        return jsonify({'error': 'Kein Text angegeben'}), 400

    try:
        # Sprache basierend auf der Sektion bestimmen
        if section in ['german-transcription', 'german-summary']:
            language = 'de'
        else:
            language = detect(text)  # Allgemeine Spracherkennung

        speech_file_path = Path(__file__).parent / "speech.mp3"
        tts = gTTS(text, lang=language)
        tts.save(speech_file_path)

        response = send_file(speech_file_path, as_attachment=True)
        delayed_delete(speech_file_path)

        return response

    except Exception as e:
        app.logger.error(f'Fehler während der TTS-Verarbeitung: {e}')
        return jsonify({'error': 'Fehler während der TTS-Verarbeitung'}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
