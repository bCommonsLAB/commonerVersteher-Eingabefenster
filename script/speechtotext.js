function text2Speech(elementId, section) {
  var text = document.getElementById(elementId).innerText;

  fetch("http://127.0.0.1:5000/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text, section: section }),
  })
    .then((response) => response.blob())
    .then((blob) => {
      var url = window.URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio.play();
    })
    .catch((error) => console.error("Error:", error));
}
