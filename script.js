const modelURL = "./model/model.json";
const metadataURL = "./model/metadata.json";

let model, webcam, labelContainer, maxPredictions;
let nomeUtente = "";
let haSalutato = false;
const container = document.getElementById("container");
const img = document.getElementById("emotion-img");
const btn = document.getElementById("analyze-btn");
const homeImg = document.getElementById("home-img");
const imgContainer = document.getElementById("img-container");

// Presentazione iniziale
document
  .getElementById("presentation-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    nomeUtente = document.getElementById("nome").value.trim();
    if (!nomeUtente) return;
    document.getElementById("presentation-form").style.display = "none";
    btn.style.display = "block";
    document.getElementById("emoji").style.display = "block";

    // Saluto vocale
    const frase = nomeUtente.endsWith("a") //escamotage per il genere, non funziona per tutti i nomi
      ? `Benvenuta ${nomeUtente}`
      : `Benvenuto ${nomeUtente}`;
    document.getElementById("welcome-name").innerHTML = nomeUtente.endsWith("a")
      ? `Benvenuta <strong>${nomeUtente}</strong>!`
      : `Benvenuto <strong>${nomeUtente}</strong>!`;

    speak(frase, () => {
      init(); // Avvia solo dopo che ha parlato
    });
  });

async function init() {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(250, 250, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  btn.addEventListener("click", predict);
}

async function loop() {
  webcam.update();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  let maxProb = 0;
  let emotion = "";
  btn.textContent = "Sto analizzando...";
  btn.disabled = true;

  for (let i = 0; i < prediction.length; i++) {
    if (prediction[i].probability > maxProb) {
      maxProb = prediction[i].probability;
      emotion = prediction[i].className;
    }
  }

  labelContainer.innerHTML = `Sei: <strong>${emotion}</strong>`;
  const emoji = document.getElementById("emoji");
  imgContainer.classList.add("visible");
  homeImg.style.display = "none";

  if (emotion === "Felice") {
    // Nascondi l'immagine di sfondo
    container.style.backgroundColor = "#ffe066";
    emoji.textContent = "Sembri felice oggi! 😄";
    img.src = "./img/gioia.jpg";
    img.alt = "Gioia di Inside Out";
    speak(`Che bello ${nomeUtente}! Sembri felice oggi!`);
  } else if (emotion === "Triste") {
    container.style.backgroundColor = "#a2d2ff";
    emoji.textContent = "Sembri così triste... 😢";
    img.src = "./img/tristezza.jpg";
    img.alt = "Tristezza di Inside Out";
    speak(`Hey ${nomeUtente}, va tutto bene? sembri così triste...`);
  } else if (emotion === "Neutra") {
    container.style.backgroundColor = "#9f86cdff";
    emoji.textContent = "Sembri impassibile oggi 😐";
    img.src = "./img/noia.jpg";
    img.alt = "Noia di Inside Out";
    speak(`Wow ${nomeUtente}... Sembri impassibile oggi!`);
  }
  setTimeout(() => {
    imgContainer.classList.remove("visible");
    homeImg.style.display = "block";

    emoji.textContent = "";
    labelContainer.innerHTML = "";
    btn.disabled = false;
    btn.textContent = "Analizza emozione!";

    container.style.backgroundColor = "#f0fdff"; // Reset background color
  }, 5000); // Nascondi dopo 5 secondi
}

function speak(text, callback = null) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  synth.cancel();
  synth.speak(utter);
  if (callback) utter.onend = callback;
}

let lastSpoken = "";
function speakOnce(text) {
  if (text !== lastSpoken) {
    lastSpoken = text;
    speak(text);
  }
}
