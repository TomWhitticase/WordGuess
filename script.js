document.getElementById("restart").addEventListener("click", generateWord);
document.getElementById("enter").addEventListener("click", guessWord);

document
  .getElementById("open-settings")
  .addEventListener("click", openSettings);
document
  .getElementById("close-settings")
  .addEventListener("click", closeSettings);
document
  .getElementById("apply-settings")
  .addEventListener("click", createBoard);

function openSettings() {
  document.getElementById("settings").style.display = "block";
}
function closeSettings() {
  document.getElementById("settings").style.display = "none";
}

document.addEventListener("keydown", function () {
  document.getElementById("guess").focus();
  showGuess();
});

document.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    guessWord();
  }
});

let wordLength; //assigned from settings
let guesses; //assigned from settings
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let targetWord = "";
let counter = 0;
let wordList = [];
let timeouts = [];
let excludedLetters = [];
let guessedWords = [];
let revealedWord = "";
let realGuesses = false;
let realWords = false;

const delayInMilliseconds = 100;

function createBoard() {
  //get values from settings
  wordLength = document.getElementById("word-length").value;
  guesses = document.getElementById("number-of-guesses").value;
  realGuesses = document.getElementById("real-guesses").checked;

  let guessesHtml = "";
  revealedWord = "_".repeat(wordLength);

  for (let i = 0; i < guesses; i++) {
    guessesHtml += `<div id="${i}" class="guess">`;
    for (let j = 0; j < wordLength; j++) {
      guessesHtml += `<div class="placeholder card"></div>`;
    }
    guessesHtml += `</div>`;
  }

  document.getElementById("guesses").innerHTML = guessesHtml;
  generateWord();
}

function showGuess() {
  //wait 1ms for the dom to update from keypresses
  setTimeout(function () {
    let textBox = document.getElementById("guess");
    //convert to upperCase
    textBox.value = textBox.value.toUpperCase();
    //remove invalid characters
    if (!alphabet.includes(textBox.value.substring(textBox.value.length - 1))) {
      textBox.value = textBox.value.substring(0, textBox.value.length - 1);
    }

    let guess = textBox.value;
    let letterCards = document.getElementById(counter).children;

    for (let i = 0; i < letterCards.length; i++) {
      let letterCard = letterCards[i];
      letterCard.className = " placeholder card ";
      if (guess[i]) {
        letterCard.innerHTML = guess[i];
        letterCard.className = " placeholder-focussed card ";
        if (excludedLetters.includes(guess[i])) {
          letterCard.className += " placeholder-excluded ";
        }
        //show green if in correct place
        if (guess[i] == revealedWord[i]) {
          letterCard.className += " green-letter ";
          //return;
        }

        //show orange if correct letter in wrong place
        let includesLetter = false;
        let inGuessedSpot = false;
        for (let j = 0; j < guessedWords.length; j++) {
          //loop through previous guesses to see if word contains letter
          if (guessedWords[j].includes(guess[i])) {
            includesLetter = true;
          }
          if (guessedWords[j][i] == guess[i]) {
            inGuessedSpot = true;
          }
        }
        if (revealedWord[i] != "_" && revealedWord[i] != guess[i]) {
          inGuessedSpot = true;
        }
        if (inGuessedSpot) {
          letterCard.className += " placeholder-excluded ";
        } else if (includesLetter) {
          letterCard.className += " orange-letter ";
        }
      } else {
        letterCard.innerHTML = "";
      }

      for (let i = 0; i < wordLength; i++) {
        let letterCard = letterCards[i];
        letterCard.className = " placeholder card ";
        if (guess[i]) {
          letterCard.innerHTML = guess[i];
          letterCard.className = " placeholder-focussed card ";
          if (excludedLetters.includes(guess[i])) {
            letterCard.className += " placeholder-excluded ";
          }
          //show green if in correct place
          if (guess[i] == revealedWord[i]) {
            letterCard.className += " green-letter ";
          } else {
            //show orange if correct letter in wrong place
            let includesLetter = false;
            let inGuessedSpot = false;
            for (let j = 0; j < guessedWords.length; j++) {
              //loop through previous guesses to see if word contains letter
              if (guessedWords[j].includes(guess[i])) {
                includesLetter = true;
              }
              if (guessedWords[j][i] == guess[i]) {
                inGuessedSpot = true;
              }
            }
            if (revealedWord[i] != "_" && revealedWord[i] != guess[i]) {
              inGuessedSpot = true;
            }
            if (inGuessedSpot) {
              letterCard.className += " placeholder-excluded ";
            } else if (includesLetter) {
              letterCard.className += " orange-letter ";
            }
          }
        } else {
          letterCard.innerHTML = "";
        }
      }
    }
  });
}

function generateWord() {
  //restart button animation
  document.getElementById("restart").classList.remove("spin");
  setTimeout(function () {
    document.getElementById("restart").classList.add("spin");
  }, 1);

  //clear previous timeouts
  for (var i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }

  for (let i = 0; i < alphabet.length; i++) {
    document.getElementById(alphabet[i]).className = "";
  }

  //clear previous words
  revealedWord = "_".repeat(wordLength);
  document.getElementById("revealed-word").innerHTML = revealedWord;
  excludedLetters = [];
  guessedWords = [];
  for (let i = 0; i < guesses; i++) {
    let letterCards = document.getElementById(i).children;
    for (let j = 0; j < letterCards.length; j++) {
      let letterCard = letterCards[j];
      letterCard.classList.remove("animate");
      setTimeout(function () {
        letterCard.innerHTML = "";
        letterCard.className = "placeholder card ";
        letterCard.className += "animate ";
      }, delayInMilliseconds * (i + j));
    }
  }

  counter = 0;

  fetch("https://random-word-api.herokuapp.com/word?length=" + wordLength)
    .then((res) => res.json())
    .then((data) => (targetWord = data[0].toUpperCase()))
    .then((data) => console.log(data))
    .catch((error) => console.log(error));

  fetch("https://random-word-api.herokuapp.com/all")
    .then((res) => res.json())
    .then((data) => (wordList = data))
    .catch((error) => console.log(error));
}

function guessWord() {
  if (counter >= guesses) return;
  let guess = document.getElementById("guess").value;
  showGuess();
  if (guess.length != wordLength) {
    message(`Enter a ${wordLength} letter word`);
    return;
  }
  if (realGuesses && !wordList.includes(guess.toLowerCase())) {
    message("Not in word list!");
    return;
  }
  guessedWords.push(guess);
  document.getElementById("guess").value = "";

  const colours = getLetterColours(targetWord, guess);
  updateKeyboard(guess, colours);
  //update reveled word on screen
  document.getElementById("revealed-word").innerHTML = revealedWord;

  let letterCards = document.getElementById(counter).children;

  for (let i = 0; i < guess.length; i++) {
    let letterCard = letterCards[i];
    letterCard.classList.remove("animate");
    timeouts.push(
      setTimeout(function () {
        letterCard.innerHTML = guess[i];
        letterCard.className = "card ";
        letterCard.className += colours[i];

        letterCard.classList.add("animate");
      }, delayInMilliseconds * i)
    );
  }

  if (guess == targetWord) {
    message("You Won!!!");
    counter = guesses;
  } else if (counter == guesses - 1) {
    message("Game over!!! The word was " + targetWord);
  }

  counter++;
}

function getLetterColours(targetWord, guess) {
  // initialize all colours to GRAY
  const colours = Array(guess.length).fill("grey-letter");
  // loop through guess and mark green if fully correct
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetWord[i]) {
      colours[i] = "green-letter";
      // remove letter from answer, so it's not scored again
      targetWord = targetWord.replace(guess[i], " ");
      revealedWord =
        revealedWord.substring(0, i) + guess[i] + revealedWord.substring(i + 1);
    }
  }
  // loop through guess and mark orange if partially correct
  for (let i = 0; i < guess.length; i++) {
    if (colours[i] !== "green-letter" && targetWord.includes(guess[i])) {
      colours[i] = "orange-letter";
      // remove letter from answer, so it's not scored again
      targetWord = targetWord.replace(guess[i], " ");
    }
  }
  return colours;
}

function updateKeyboard(guess, colours) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const colour = colours[i];

    if (colour == "green-letter") {
      document.getElementById(letter).className = "green-key";
    } else if (colour == "orange-letter") {
      document.getElementById(letter).className = "orange-key";
    } else if (colour == "grey-letter") {
      if (!document.getElementById(letter).className) {
        document.getElementById(letter).className = "red-key";
      }

      if (!excludedLetters.includes(letter) && !targetWord.includes(letter))
        excludedLetters.push(letter);
    }
  }
}

function message(text) {
  // Get the snackbar DIV
  const x = document.createElement("div");
  x.set;
  x.id = "snackbar";
  x.innerHTML = text;
  // Add the "show" class to DIV
  x.className = "show";

  document.getElementsByTagName("body")[0].appendChild(x);
  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
    document.getElementsByTagName("body")[0].removeChild(x);
  }, 3000);
}

createBoard();
