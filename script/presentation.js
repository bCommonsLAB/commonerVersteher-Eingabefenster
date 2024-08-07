const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');

const fullText1 = "Ich bin dein Commoning Versteher und du kannst hier deine Überlegungen zu Themen rund ums Commoning einsprechen. Ich werde diese Transkribieren eine kurze Reflexion schreiben und dann Bewerten, wie sehr der Text den Idealen des Commonings entspricht.";

const initialText1 = fullText1.split(' ').slice(0, 5).join(' ') + '...';

text1.innerText = initialText1;

text1.addEventListener('mouseover', () => {
    text1.innerText = fullText1;
});

text1.addEventListener('mouseout', () => {
    text1.innerText = initialText1;
});
