document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.querySelector(".drag-image"),
    dragText = dropArea.querySelector("h6"),
    input = dropArea.querySelector("input"),
    loadingScreen = document.getElementById("loading-screen"),
    statusElement = document.getElementById("status"),
    userTextElement = document.getElementById("user-text"),
    openPopupBtn = document.getElementById("open-popup"),
    closePopupBtn = document.getElementById("close-popup"),
    popupContainer = document.getElementById("popup-container"),
    browseButton = dropArea.querySelector("button"); // Der Button zum Durchsuchen der Datei

  let file;

  // Funktion zum Anzeigen des Ladebildschirms
  function showLoading() {
    loadingScreen.style.display = "flex";
  }

  // Funktion zum Verstecken des Ladebildschirms
  function hideLoading() {
    loadingScreen.style.display = "none";
  }

  // Funktion zum Öffnen des Popups
  function openPopup() {
    popupContainer.style.display = "flex";
    popupContainer.classList.remove("slideOut");
    popupContainer.classList.add("slideIn");
  }

  // Funktion zum Schließen des Popups
  function closePopup() {
    popupContainer.classList.remove("slideIn");
    popupContainer.classList.add("slideOut");
    popupContainer.addEventListener(
      "animationend",
      () => {
        if (popupContainer.classList.contains("slideOut")) {
          popupContainer.style.display = "none";
        }
      },
      { once: true },
    );
  }

  // Funktion zum Überprüfen und Hochladen der Datei
  function viewFile() {
    let fileType = file.type;
    let validExtensions = ["audio/mpeg"];
    if (validExtensions.includes(fileType)) {
      closePopup(); // Schließt das Popup-Fenster
      showLoading(); // Zeigt den Ladebildschirm
      sendFileToServer(file); // Startet den Upload
    } else {
      alert("This is not an MP3 File!");
      dropArea.classList.remove("active");
      dragText.textContent = "Drag & Drop to Upload MP3 File";
    }
  }

  // Funktion zum Senden der Datei an den Server
  function sendFileToServer(file) {
    const formData = new FormData();
    formData.append("audio", file);

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
          // Hier wird das Transkript in das Eingabefeld eingefügt
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

  // Event-Listener für Datei-Upload über das Eingabefeld
  input.addEventListener("change", function () {
    file = this.files[0];
    dropArea.classList.add("active");
    viewFile();
  });

  // Event-Listener für Drag-and-Drop-Interaktionen
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload MP3 File";
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    file = event.dataTransfer.files[0];
    dropArea.classList.remove("active");
    viewFile();
  });

  // Event-Listener für den Datei-Durchsuchen-Button
  browseButton.addEventListener("click", () => {
    input.click(); // Öffnet das Datei-Auswahlfenster
  });

  // Event-Listener für das Öffnen und Schließen des Popups
  openPopupBtn.addEventListener("click", openPopup);
  closePopupBtn.addEventListener("click", closePopup);

  // Schließen des Popups beim Klick außerhalb des Inhalts
  window.addEventListener("click", (event) => {
    if (event.target == popupContainer) {
      closePopup();
    }
  });
});
