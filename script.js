const HIGHSCORE = "highscore";
const INITIALLOAD = "init";

const isInitialLoad = () => {
    const isInitial = localStorage.getItem(INITIALLOAD) ?? true
    return isInitial;
}

const getHighScore = () => {
    return localStorage.getItem(HIGHSCORE) ?? 0;
};

const saveHighScore = (score) => {
    localStorage.setItem(HIGHSCORE, score);
};

document.addEventListener('DOMContentLoaded', function () {
  let modal = document.getElementById('default-modal')
  document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    localStorage.setItem(INITIALLOAD, false);
    fetchQuote();
  })

    if(isInitialLoad() === true) {
      modal.classList.add('flex');
      modal.classList.remove('hidden');
    } else {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }

    let score = 0;
    let answer = "";
    let attemptsLeft = 5;
    let originalQuote = '';
    let revealedQuote = '';
    let flagged = [];
    let hintUsed = false;
    let timeInterval;
    var startTime, endTime, timeTaken;
    let confettiElement = document.getElementById('canvas');
    let confetti = new ConfettiGenerator({ target: confettiElement });;

    let scoreSpan = document.getElementById('score')
    let timeSpan = document.getElementById('time')
    timeSpan.style.display = 'none';
    scoreSpan.textContent = `Score: ${score} | Highest: ${getHighScore()} `

    // Function to fetch a synonym from an API
    function fetchSynonym(word) {
        // Replace with your preferred synonym API endpoint
        fetch('https://api.datamuse.com/words?ml=' + word)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
            // Display a random synonym as a hint
            hintUsed = true; // Mark hint as used
            displayMessage('Hint: One synonym for the missing word is: ' + data[0].word);
            } else {
            displayMessage('Sorry, no synonyms found.');
            }
        })
        .catch(error => console.error('Error fetching synonym:', error));
    }

    // Event listener for the hint button
    document.getElementById('hint-button').addEventListener('click', function () {
        if (!hintUsed) {
        fetchSynonym(answer);
        } else {
        displayMessage('You have already used the hint.');
        }
    });
    
  
    // Function to fetch a random quote from the Quotable API
    function fetchQuote() {
        if(isInitialLoad() === true) return;
        confetti.clear();
        flagged = [];
        displayQuote('Loading...');
        displayMessage('');
        document.getElementById('guess').value = "";
        hintUsed = false;
        timeSpan.style.display = 'none';
      fetch('https://api.quotable.io/random')
        .then(response => response.json())
        .then(data => {
          originalQuote = data.content.trim(); // Remove leading and trailing whitespaces

          // Check if the quote is empty or contains only whitespace characters
          if (!originalQuote || /^\s*$/.test(originalQuote)) {
            // If so, fetch another quote
            fetchQuote();
            return;
          }

          fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyARlNq8KgvtpDz"+"APw12aVFb5Tdia1PbMFM", {
            method: "POST",
            body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: "You are conducting a quiz. You have a quote and you will suggest a prominent meaningful word in the quote that can be replaced with blank underscores " +
                            "so that the player can play a guessing game for the word. YOur output will include only the word that you suggest to be removed." +
                            `There should be no formatting in your output. Here is the quote: ${originalQuote}`,
                      },
                    ],
                  },
                ],
              }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((data) => {
                timeSpan.style.display = 'block';
                startTime = Date.now()
                timeInterval = setInterval(() => {
                  timeSpan.textContent = `Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`
                }, 0);

                answer = data.candidates[0].content.parts[0].text;
                let blanks = "_".repeat(answer.length);
                revealedQuote = originalQuote.replace(new RegExp(`\\b${answer}\\b`, "gi"), blanks);

                // Display the initial revealed quote
                displayQuote(revealedQuote);

                // Reset attempts left
                attemptsLeft = 5;
                updateAttemptsDisplay();

                // Clear previous messages
                displayMessage('');
                
                startTime = Date.now();
                timeSpan.style.display = 'block';
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        })
        .catch(error => console.error('Error fetching quote:', error));
    }
  
    // Function to display the quote with revealed characters
    function displayQuote(quote) {
      document.getElementById('quote-container').textContent = quote;
    }
  
    // Function to update attempts left display
    function updateAttemptsDisplay() {
      document.getElementById('attempt-count').textContent = attemptsLeft;
    }
  
    // Function to check if the guess is correct
    function checkGuess(guess) {
      // Compare the guess with the original quote
      if (guess.trim().toLowerCase() === answer.toLowerCase()) {
        // Correct guess

        clearInterval(timeInterval);
        endTime = Date.now();
        timeTaken = (endTime - startTime) / 1000;
        score += 100;

        // attempts penalty
        score -= 40 - (attemptsLeft * 8);
  
        // time penalty
        if (Math.floor(timeTaken) > 15) {
          score -= Math.floor((Math.min(Math.floor(timeTaken), 100) / 2));
        }
  
        // hint penalty
        if (hintUsed) {
          score -= 10;
        }

        if(score > getHighScore()) {
          saveHighScore(score);
        }

        scoreSpan.textContent = `Score: ${score} | High: ${getHighScore()} `

        displayMessage('OMG! You got it right!', true);

        var confettiSettings = { target: confettiElement, start_from_edge: true, clock: 50, max: 250 };
        confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();

        setTimeout(fetchQuote, 5000); // Reset the game after 3 seconds
      } else {
        // Incorrect guess
        //attemptsLeft--;
        if(flagged.includes(guess.trim()))
        {
            displayMessage('Sorry you have already tried this!!!!!');
        }
        else{
            flagged.push(guess.trim());
            attemptsLeft = Math.max(attemptsLeft - 1, 0);
            updateAttemptsDisplay();
            if (attemptsLeft === 0) {
                // Out of attempts
                displayMessage(`Sorry, you're out of attempts. The correct quote was: "${originalQuote}"`);
                setTimeout(fetchQuote, 3000); // Reset the game after 3 seconds
            }     
            else {
                // Display remaining attempts
                displayMessage('Incorrect guess. Try again!');
            }
        }
      }
    }

  
    // Function to display message
    function displayMessage(message, success = false) {
      let msgHolder = document.getElementById('message');
      msgHolder.textContent = message;

      if (success) {
        msgHolder.style.color = "#00cc00";
      } else {
        msgHolder.style.color = "#FF0000";
      }
    }
  
    //Fetch a quote when the page loads
    fetchQuote();
  
    // Event listener for the guess form submission
    document.getElementById('guess-form').addEventListener('submit', function (event) {
      event.preventDefault();
      if (answer === "") return;
      let guess = document.getElementById('guess').value;
      checkGuess(guess);
    });
  });