const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');

let quizData = [];
let currentQuestion = 0;
let currentScore = 0;

function loadQuestion(index) {
  const q = quizData[index];
  updateProgressBar(index + 1, quizData.length);
  document.getElementById("question").innerText = `Q${index + 1}: ${q.question}`;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = '';
  document.getElementById("feedback").innerText = '';

  for (let key in q.options) {
    const btn = document.createElement("button");
    btn.innerText = `${key}. ${q.options[key]}`;
    btn.onclick = () => checkAnswer(parseInt(key), q.answer);
    optionsDiv.appendChild(btn);
  }
}

function updateProgressBar(current, total) {
  const progressBar = document.getElementById("progress-bar");
  const percent = Math.floor((current / total) * 100);
  progressBar.style.width = percent + "%";
}

function checkAnswer(selected, correct) {
  document.querySelectorAll("#options button").forEach(btn => btn.disabled = true);

  const feedback = document.getElementById("feedback");
  feedback.classList.remove("pulse", "shake"); // clear old
  void feedback.offsetWidth; // force reflow
  if (selected === correct) {
    correctSound.play();
    feedback.innerText = "✅ Correct!";
    feedback.style.color = "#4cd137";
    feedback.classList.add("pulse");
    currentScore ++;
  } else {
    incorrectSound.play();
    feedback.innerText = `❌ Incorrect. The correct answer is ${correct}.`;
    feedback.style.color = "#e84118";
    feedback.classList.add("shake");
  }
  document.getElementById("score").innerText = `Score: ${currentScore}`;

  setTimeout(() => {
    loadNextQuestion()
  }, 2000)
}

function loadNextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion(currentQuestion);
  } else {
    showQuizComplete();
  }
}

function showQuizComplete() {
  document.getElementById("question").innerText = "🎉 Quiz Complete!";
  document.getElementById("options").innerHTML = "";
  document.getElementById("feedback").innerText = `Your final score is ${currentScore} out of ${quizData.length}.`;
  document.getElementById("feedback").style.color = "#f7b731";
}

fetch('/api/questions')
    .then(response => response.json())
    .then(data => {
      quizData = data;
      loadQuestion(currentQuestion);
    })
    .catch(error => {
      console.error('Failed to load quiz data:', error);
      document.getElementById("question").innerText = "Failed to load quiz.";
    });