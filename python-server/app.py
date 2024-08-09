from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import config
import os

app = Flask(__name__)
CORS(app)

# API-Schlüssel für OpenAI festlegen
api_key = config.config['myopenkey']

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        app.logger.error('Keine Audiodatei gefunden')
        return jsonify({'error': 'Keine Audiodatei gefunden'}), 400

    audio_file = request.files['audio']
    audio_file_path = 'audio.mp3'
    audio_file.save(audio_file_path)

    try:
        # Sende eine Anfrage an die OpenAI API für die Whisper Transkription
        with open(audio_file_path, 'rb') as f:
            files = {'file': (audio_file.filename, f, 'audio/mpeg')}
            headers = {
                'Authorization': f'Bearer {api_key}'
            }
            response = requests.post(
                'https://api.openai.com/v1/audio/transcriptions',
                headers=headers,
                files=files,
                data={'model': 'whisper-1', 'language': 'de'}
            )
        
        if response.status_code == 200:
            result = response.json()
            transcript = result['text']
            language = result.get('language', 'de')  # Standard auf 'de' setzen

            return jsonify({'transcript': transcript, 'language': language}), 200
        else:
            app.logger.error(f'Fehler während der Transkription: {response.text}')
            return jsonify({'error': f'Fehler während der Transkription: {response.text}'}), 500

    except Exception as e:
        app.logger.error(f'Fehler während der Transkription: {e}')
        return jsonify({'error': f'Fehler während der Transkription: {str(e)}'}), 500

    finally:
        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    user_text = request.form.get('text')
    if not user_text:
        app.logger.error('Kein Text gefunden')
        return jsonify({'error': 'Kein Text gefunden'}), 400

    try:
        prompt = config.config['jsonbuild'] + user_text

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
                return jsonify(json_result), 200
            except json.JSONDecodeError as e:
                app.logger.error(f'Fehler beim Dekodieren der JSON-Antwort: {e}')
                app.logger.error(f'Aktuelle API-Antwort: {completion_response.text}')
                return jsonify({'error': 'Fehler bei der Verarbeitung der OpenAI-Antwort'}), 500
            except Exception as e:
                app.logger.error(f'Allgemeiner Fehler bei der Verarbeitung der OpenAI-Antwort: {e}')
                return jsonify({'error': 'Fehler bei der Verarbeitung der OpenAI-Antwort'}), 500
        else:
            app.logger.error(f'Fehler bei der API-Anfrage (Completion): {completion_response.status_code}, Antwort: {completion_response.text}')
            return jsonify({'error': 'Fehler bei der API-Anfrage (Completion)'}), 500

    except Exception as e:
        app.logger.error(f'Fehler während der Verarbeitung: {e}')
        return jsonify({'error': 'Fehler während der Verarbeitung'}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
