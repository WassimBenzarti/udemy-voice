function createMessageDisplayer() {
  const parent = document.querySelector(".main-content");
  const element = document.createElement("div");
  element.style.background = "black";
  element.style.color = "white";
  element.style.padding = "10px";
  element.style.position = "fixed";
  element.style.bottom = "24px";
  element.style.right = "24px";
  element.style.boxShadow = "0px 8px 10px rgba(0,0,0,.2)";
  element.style.transition = `opacity 0.3s`;
  parent.appendChild(element);
  let timer;

  function showMessage(message) {
    element.style.opacity = 1;
    element.innerHTML = message;
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      element.style.opacity = 0;
    }, 3000);
  }
  return { showMessage };
}

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
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  let stopped = false
  let result = ''
  let callback = () => { }

  recognizer.onend = function () {
    console.log("Recognizer ended");
    if (result) {
      callback(result);
    }
    result = "";

    !stopped && recognizer.start();
  };

  function onResult(_callback) {
    callback = _callback;
    recognizer.onresult = function (e) {
      result = e.results[0][0].transcript;
    };
  }

  function start() {
    console.log("SpeechToText started");
    stopped = false;
    recognizer.start();
  }

  function stop() {
    console.log("SpeechToText aborted");
    stopped = true;
    recognizer.abort();
  }

  return { onResult, start, stop };
}

function createTextToSpeech() {
  const speech = new SpeechSynthesisUtterance();
  speech.lang = "en";
  speech.voice = window.speechSynthesis.getVoices()[49];
  async function _speak(text) {
    if (!text) {
      return;
    }
    speech.text = text;
    window.speechSynthesis.cancel(speech);
    window.speechSynthesis.speak(speech);

    return new Promise((resolve, reject) => {
      speech.onend = resolve;
      speech.onerror = reject;
    });
  }

  async function speak(text) {
    const sections = text.split('.');
    for (let section of sections) {
      await _speak(section);
    }
  }

  function cancel() {
    window.speechSynthesis.pause(speech);
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
  voiceButton.style.padding = "8px 16px";
  voiceButton.style.border = "none";
  voiceButton.style.borderRadius = "999px";
  voiceButton.style.color = "rgb(146, 8, 8)";
  voiceButton.style.fontWeight = "bold";
  voiceButton.style.background = "rgba(230, 0, 0, .2)";
  voiceButton.innerHTML = "🎤 Speak";

  var textToSpeech = createTextToSpeech();
  async function runSpeech() {
    if (voiceButton.innerHTML === "⏸️  Pause") {
      textToSpeech.cancel();
      voiceButton.innerHTML = "🎤 Speak";
      try {
        speechToText.start();
      } catch (e) {
        console.log("Warning: Already started speechToText");
      }
      return;
    }
    const text = quizQuestion.textContent;
    voiceButton.innerHTML = "⏸️  Pause";
    speechToText.stop();
    console.log("Start speaking", text);
    await textToSpeech.speak(text);
    console.log("Done speaking")
    try {
      speechToText.start();
    } catch (e) {
      console.log("Warning: Already started speechToText");
    }
    voiceButton.innerHTML = "🎤 Speak";
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

    //runSpeech();
  });

  // Speech recognition

  function clickButtonWithPurpose(dataPurposes) {
    return () => {
      const dataPurpose = dataPurposes.find(d => document.querySelector(`[data-purpose="${d}"]`))
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
    "check answer": clickButtonWithPurpose(["next-question-button"]),
    "next question": clickButtonWithPurpose(["go-to-next-question", "next-question-button"]),
    "skip question": clickButtonWithPurpose(["skip-question"]),
    back: clickButtonWithPurpose(["go-to-prev-question"]),
    "speak": runSpeech,
  };

  const speechToText = createSpeechToText(
    `#JSGF V1.0; grammar actions; public <action> = ${Object.keys(actions).join(
      " | "
    )} ;`
  );

  const messageDisplayer = createMessageDisplayer();

  speechToText.onResult((result) => {
    // console.log("Heard:", result);
    messageDisplayer.showMessage(result);

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
