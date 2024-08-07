document.addEventListener("DOMContentLoaded", () => {
    const statusElement = document.getElementById('status');
    const toggleBtn = document.getElementById('micButton');
    const centerSprachanalyse = document.getElementById('center');
    const sprachanalyse = document.getElementById('sprachanalyse');
    const mustersprachanalyse = document.getElementById('mustersprachanalyse');
    const musteranalyse = document.getElementById('mustersprache');
    const loadingScreen = document.getElementById('loading-screen');
    let mediaRecorder;
    let isRecording = false;
    let audioChunks = [];

    centerSprachanalyse.style.display = 'none';
    sprachanalyse.style.display = 'none';
    musteranalyse.style.display = 'none';
    mustersprachanalyse.style.display = 'none';

    function showCenter() {
        centerSprachanalyse.style.display = 'flex';
        sprachanalyse.style.display = 'flex';
        mustersprachanalyse.style.display = 'flex';
        musteranalyse.style.display = 'flex';
    }

    function showLoading() {
        loadingScreen.style.display = 'flex';
    }

    function hideLoading() {
        loadingScreen.style.display = 'none';
    }

    function resetAll() {
        statusElement.innerText = 'Bereit zur Aufnahme';
        document.getElementById('transcription').innerText = '';
        document.getElementById('reflection').innerText = '';
        updateCircle('circle-gemeinschaft', 'gemeinschaft-prozent', 0);
        updateCircle('circle-vertrauen', 'vertrauen-prozent', 0);
        updateCircle('circle-gegenseitig', 'gegenseitig-prozent', 0);
        updateCircle('circle-nachhaltig', 'nachhaltig-prozent', 0);
        updateCircle('circle-inklusion', 'inklusion-prozent', 0);
        updateCircle('circle-sozialesmiteinander', 'sozialesmiteinander-prozent',0);
        updateCircle('circle-gleichrangigeselbstorganisation', 'gleichrangigeselbstorganisation-prozent', 0);
        updateCircle('circle-sorgendesselbstbestimmteswirtschaften', 'sorgendesselbstbestimmteswirtschaften-prozent', 0);
        const audioPlayer = document.getElementById('audio-player');
        const uploadedAudio = document.getElementById('uploaded-audio');
        audioPlayer.src = '';
        uploadedAudio.style.display = 'none';
    }

    toggleBtn.addEventListener('change', event => {
        resetAll();
        if (toggleBtn.checked) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    statusElement.innerText = 'Aufnahme läuft...';
                    isRecording = true;
                    audioChunks = [];

                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                        handleAudioFile(audioBlob);
                        displayAudio(audioBlob);
                        toggleBtn.checked = false;
                        showLoading();
                    };
                })
                .catch(error => {
                    statusElement.innerText = 'Fehler beim Zugriff auf das Mikrofon';
                    console.error('Mikrofon Fehler:', error);
                    toggleBtn.checked = false;
                });
        } else {
            if (isRecording) {
                mediaRecorder.stop();
                statusElement.innerText = 'Aufnahme beendet';
                isRecording = false;
                showLoading();
            }
        }
    });

    function handleFiles(files) {
        resetAll();
        const file = files[0];
        if (file) {
            handleAudioFile(file);
            displayAudio(file);
        }
    }

    function handleAudioFile(file) {
        const formData = new FormData();
        formData.append('audio', file);

        fetch('https://api.bcommonslab.org/commoner/transcribe', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            if (data.error) {
                statusElement.innerText = 'Fehler bei der Transkription: ' + data.error;
                console.error('Transkription Fehler:', data.error);
            } else {

                document.getElementById('transcription').innerText = data.Transcript || '';
                document.getElementById('reflection').innerText = data.Eindruck || '';

                updateCircle('circle-gemeinschaft', 'gemeinschaft-prozent', data.Gemeinschaft);
                updateCircle('circle-vertrauen', 'vertrauen-prozent', data.Vertrauen);
                updateCircle('circle-gegenseitig', 'gegenseitig-prozent', data.Gegenseitig);
                updateCircle('circle-nachhaltig', 'nachhaltig-prozent', data.Nachhaltig);
                updateCircle('circle-inklusion', 'inklusion-prozent', data.Inklusion);
                updateCircle('circle-sozialesmiteinander', 'sozialesmiteinander-prozent', data.SozialesMiteinander);
                updateCircle('circle-gleichrangigeselbstorganisation', 'gleichrangigeselbstorganisation-prozent', data.GleichrangigeSelbstOrganisation);
                updateCircle('circle-sorgendesselbstbestimmteswirtschaften', 'sorgendesselbstbestimmteswirtschaften-prozent', data.SorgendesSelbstbestimmtesWirtschaften);

                statusElement.innerText = 'Aufnahme beendet';
            }
            showCenter();
        })
        .catch(error => {
            hideLoading();
            statusElement.innerText = 'Fehler bei der Transkription';
            console.error(error);
        });
    }

    function displayAudio(file) {
        const audioPlayer = document.getElementById('audio-player');
        const uploadedAudio = document.getElementById('uploaded-audio');
        const fileURL = URL.createObjectURL(file);
        audioPlayer.src = fileURL;
        uploadedAudio.style.display = 'block';
    }

    function updateCircle(circleId, percentId, value) {
        const circle = document.getElementById(circleId);
        const percent = document.getElementById(percentId);
        circle.style.setProperty('--p', value);
        percent.innerText = value + "%";
    }

    const dropArea = document.getElementById('drop-area');

    dropArea.addEventListener('dragover', event => {
        event.preventDefault();
        dropArea.classList.add('highlight');
    });

    dropArea.addEventListener('dragleave', event => {
        dropArea.classList.remove('highlight');
    });

    dropArea.addEventListener('drop', event => {
        event.preventDefault();
        dropArea.classList.remove('highlight');
        const files = event.dataTransfer.files;
        handleFiles(files);
        showLoading();
        showCenter();
    });

    document.getElementById('fileElem').addEventListener('change', (event) => {
        handleFiles(event.target.files);
        showLoading();
        showCenter();
    });
});
