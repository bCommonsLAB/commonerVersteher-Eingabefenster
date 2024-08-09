const fullTextout =
  "Ich bin dein Commoning Versteher und du.... kannst hier deine Überlegungen zu Themen rund ums Commoning einsprechen. Ich werde diese transkribieren, eine kurze Reflexion schreiben und dann bewerten, wie sehr der Text den Idealen des Commonings entspricht.";
const fullText =
  "Ich bin dein Commoning Versteher und du kannst hier deine Überlegungen zu Themen rund ums Commoning einsprechen. Ich werde diese transkribieren, eine kurze Reflexion schreiben und dann bewerten, wie sehr der Text den Idealen des Commonings entspricht.";

const initialText = fullTextout;
text1.innerText = fullTextout;

let timeoutId;

text1.addEventListener("mouseover", () => {
  clearTimeout(timeoutId);
  text1.innerText = fullText;
  text1.style.height = `${text1.scrollHeight}px`;
});

text1.addEventListener("mouseout", () => {
  text1.style.height = "17px";
  timeoutId = setTimeout(() => {
    text1.innerText = initialText;
  }, 725);
});
