function createSpeechToText(grammar) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  recognizer.lang = "en-US";

  const SpeechGrammarList =
    window.SpeechGrammarList || window.webkitSpeechGrammarList;
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);

  recognizer.grammars = speechRecognitionList;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onend = function () {
    console.log("ended");
    recognizer.start();
  };

  function onResult(callback) {
    recognizer.onresult = function (e) {
      const result = e.results[0][0].transcript;
      console.log(e);
      console.log(result);
      callback(result);
    };
  }

  function start() {
    recognizer.start();
  }

  function stop() {
    recognizer.stop();
  }

  return { onResult, start, stop };
}

function createTextToSpeech() {
  const speech = new SpeechSynthesisUtterance();
  speech.lang = "en";
  speech.voice = window.speechSynthesis.getVoices()[49];
  console.log(speech);
  function speak(text) {
    if (!text) {
      return;
    }
    speech.text = text;
    window.speechSynthesis.speak(speech);
  }

  function cancel() {
    window.speechSynthesis.cancel(speech);
  }

  return { speak, speech, cancel };
}

function loadButton() {
  const quizContainer = document.querySelector(
    "[class*='mc-quiz-question--container--']"
  );
  const quizQuestion = document.querySelector(
    "[class*='mc-quiz-question--question-prompt--']"
  );

  if (!quizContainer || !quizQuestion) {
    console.log("No quiz container found, trying again in 1 second...");
    setTimeout(loadButton, 1000);
    return;
  }

  const voiceButton = document.createElement("button");
  voiceButton.innerHTML = "🎤 Speak";

  var textToSpeech = createTextToSpeech();
  function runSpeech() {
    textToSpeech.cancel();
    const text = quizQuestion.textContent;
    console.log("speaking", text);
    textToSpeech.speak(text);
  }

  voiceButton.onclick = (e) => {
    e.preventDefault();
    runSpeech();
  };

  quizContainer.insertBefore(voiceButton, quizQuestion);

  quizContainer.addEventListener("DOMNodeInserted", function (event) {
    if (event.target.parentNode == quizContainer) {
      return;
    }
    console.log("Added element");

    runSpeech();
  });

  // Speech recognition

  function clickButtonWithPurpose(dataPurpose) {
    return () => {
      const button = document.querySelector(`[data-purpose="${dataPurpose}"]`);
      button.click();
    };
  }

  function checkAnswer(index) {
    return () => {
      const answers = document.querySelectorAll("[name=answer]");
      answers[index].click();
    };
  }
  const actions = {
    1: checkAnswer(0),
    2: checkAnswer(1),
    3: checkAnswer(2),
    4: checkAnswer(3),
    5: checkAnswer(4),
    6: checkAnswer(5),
    "next question": clickButtonWithPurpose("go-to-next-question"),
    "skip question": clickButtonWithPurpose("skip-question"),
    back: clickButtonWithPurpose("go-to-prev-question"),
  };

  const speechToText = createSpeechToText(
    `#JSGF V1.0; grammar actions; public <action> = ${Object.keys(actions).join(
      " | "
    )} ;`
  );

  speechToText.onResult((result) => {
    console.log("Heard:", result);

    Object.entries(actions).map(([word, action]) => {
      if (result.includes(word)) {
        console.log("Found word:", word);
        action();
      }
    });
  });
  speechToText.start();
}

window.onload = function () {
  loadButton();
};
