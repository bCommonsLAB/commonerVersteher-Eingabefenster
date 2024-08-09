document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");
  const micBtn = document.getElementById("mic-button");
  const loadingScreen = document.getElementById("loading-screen");
  const userTextElement = document.getElementById("user-text");

  let isRecording = false;
  let mediaRecorder;
  let audioChunks = [];

  function showLoading() {
    loadingScreen.style.display = "flex";
  }

  function hideLoading() {
    loadingScreen.style.display = "none";
  }

  function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          isRecording = true;
          micBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
          statusElement.innerText = "Aufnahme läuft...";

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            audioChunks = [];
            showLoading();
            sendAudioToServer(audioBlob);
          };
        })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
        });
    } else {
      console.error("Browser does not support audio recording.");
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      isRecording = false;
      micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
      statusElement.innerText = "Aufnahme beendet";
    }
  }

  micBtn.addEventListener("click", () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    fetch("http://localhost:5000/transcribe", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        hideLoading();
        if (data.error) {
          statusElement.innerText = "Fehler bei der Analyse: " + data.error;
          console.error("Analyse Fehler:", data.error);
        } else {
          if (userTextElement) userTextElement.value = data.transcript || "";
          statusElement.innerText = "Analyse beendet";
        }
      })
      .catch((error) => {
        hideLoading();
        statusElement.innerText = "Fehler bei der Analyse";
        console.error(error);
      });
  }
});
