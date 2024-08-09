document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");
  const sendBtn = document.getElementById("sendbutton");
  const centerSprachanalyse = document.getElementById("center");
  const sprachanalyse = document.getElementById("sprachanalyse");
  const mustersprachanalyse = document.getElementById("mustersprachanalyse");
  const musteranalyse = document.getElementById("mustersprache");
  const loadingScreen = document.getElementById("loading-screen");

  centerSprachanalyse.style.display = "none";
  sprachanalyse.style.display = "none";
  musteranalyse.style.display = "none";
  mustersprachanalyse.style.display = "none";

  function showCenter() {
    centerSprachanalyse.style.display = "flex";
    sprachanalyse.style.display = "flex";
    mustersprachanalyse.style.display = "flex";
    musteranalyse.style.display = "flex";
    animateExpansion(centerSprachanalyse);
    animateExpansion(sprachanalyse);
    animateExpansion(mustersprachanalyse);
    animateExpansion(musteranalyse);
  }

  function animateExpansion(element) {
    element.animate(
      [
        { transform: "scaleY(0)", height: "0px" },
        { transform: "scaleY(1)", height: element.scrollHeight + "px" },
      ],
      {
        duration: 500,
        easing: "ease-out",
        fill: "forwards",
      },
    );
  }

  function showLoading() {
    loadingScreen.style.display = "flex";
  }

  function hideLoading() {
    loadingScreen.style.display = "none";
  }

  function resetAll() {
    if (statusElement) statusElement.innerText = "Bereit zur Analyse";
    const transcriptionElement = document.getElementById("user-text");
    const reflectionElement = document.getElementById("reflection");
    if (transcriptionElement) transcriptionElement.innerText = "";
    if (reflectionElement) reflectionElement.innerText = "";
    updateCircle("circle-gemeinschaft", "gemeinschaft-prozent", 0);
    updateCircle("circle-vertrauen", "vertrauen-prozent", 0);
    updateCircle("circle-gegenseitig", "gegenseitig-prozent", 0);
    updateCircle("circle-nachhaltig", "nachhaltig-prozent", 0);
    updateCircle("circle-inklusion", "inklusion-prozent", 0);
    updateCircle(
      "circle-sozialesmiteinander",
      "sozialesmiteinander-prozent",
      0,
    );
    updateCircle(
      "circle-gleichrangigeselbstorganisation",
      "gleichrangigeselbstorganisation-prozent",
      0,
    );
    updateCircle(
      "circle-sorgendesselbstbestimmteswirtschaften",
      "sorgendesselbstbestimmteswirtschaften-prozent",
      0,
    );
  }

  sendBtn.addEventListener("click", () => {
    resetAll();
    const userTextElement = document.getElementById("user-text");
    if (!userTextElement) {
      statusElement.innerText = "Fehler: Text-Eingabefeld nicht gefunden";
      return;
    }
    const userText = userTextElement.value;

    if (userText.trim() === "") {
      statusElement.innerText = "Bitte geben Sie einen Text ein.";
      return;
    }

    showLoading();
    const formData = new FormData();
    formData.append("text", userText);

    fetch("http://localhost:5000/analyze-text", {
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
          const transcriptionElement = document.getElementById("user-test");
          const reflectionElement = document.getElementById("reflection");
          if (transcriptionElement)
            transcriptionElement.innerText = data.Transcript || "";
          if (reflectionElement)
            reflectionElement.innerText = data.Eindruck || "";

          updateCircle(
            "circle-gemeinschaft",
            "gemeinschaft-prozent",
            data.Gemeinschaft,
          );
          updateCircle("circle-vertrauen", "vertrauen-prozent", data.Vertrauen);
          updateCircle(
            "circle-gegenseitig",
            "gegenseitig-prozent",
            data.Gegenseitig,
          );
          updateCircle(
            "circle-nachhaltig",
            "nachhaltig-prozent",
            data.Nachhaltig,
          );
          updateCircle("circle-inklusion", "inklusion-prozent", data.Inklusion);
          updateCircle(
            "circle-kommerziell",
            "kommerziell-prozent",
            data.Kommerziell,
          );
          updateCircle(
            "circle-sozialesmiteinander",
            "sozialesmiteinander-prozent",
            data.SozialesMiteinander,
          );
          updateCircle(
            "circle-gleichrangigeselbstorganisation",
            "gleichrangigeselbstorganisation-prozent",
            data.GleichrangigeSelbstOrganisation,
          );
          updateCircle(
            "circle-sorgendesselbstbestimmteswirtschaften",
            "sorgendesselbstbestimmteswirtschaften-prozent",
            data.SorgendesSelbstbestimmtesWirtschaften,
          );

          statusElement.innerText = "Analyse beendet";
        }
        showCenter();
      })
      .catch((error) => {
        hideLoading();
        statusElement.innerText = "Fehler bei der Analyse";
        console.error(error);
      });
  });

  function updateCircle(circleId, percentId, value) {
    const circle = document.getElementById(circleId);
    const percent = document.getElementById(percentId);
    if (circle) circle.style.setProperty("--p", value);
    if (percent) percent.innerText = value + "%";
  }
});
