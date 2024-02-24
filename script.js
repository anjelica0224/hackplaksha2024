document.addEventListener('DOMContentLoaded', function () {
    let answer = "";
    let attemptsLeft = 5;
    let originalQuote = '';
    let revealedQuote = '';
    let flagged = [];
    let hintUsed = false;

    // Function to fetch a synonym from an API
    function fetchSynonym(word) {
        // Replace with your preferred synonym API endpoint
        fetch('https://api.datamuse.com/words?ml=' + word)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
            // Display a random synonym as a hint
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
        hintUsed = true; // Mark hint as used
        } else {
        displayMessage('You have already used the hint.');
        }
    });

  
    // Function to fetch a random quote from the Quotable API
    function fetchQuote() {
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
  
          // Split the original quote into words
          const words = originalQuote.split(' ');
          const max = words[0];
          for(let i = 0; i < words.length; i++)
          {
                if(words[i] > max)
                {
                     max = words[i];   
                }
          }

          for(let j = 0; j < words.length; j++)
          if(words[i].length > 0.8 * max.length)
          {
                const candidates = [];
                candidates.push(words[i]);
                const wordToBlankIndex = Math.floor(Math.random() * candidateWords.length);
                answer = candidateWords[wordToBlankIndex];
                const blankedWord = answer;
                // Blank out the selected word in the revealed quote
                const blankedIndex = words.indexOf(answer);
                words[blankedIndex] = '_'.repeat(blankedWord.length);
  
          }
        
          // Join the words back together to form the revealed quote
          revealedQuote = words.join(' ');
  
          // Display the initial revealed quote
          displayQuote(revealedQuote);
  
          // Reset attempts left
          attemptsLeft = 5;
          updateAttemptsDisplay();
  
          // Clear previous messages
          displayMessage('');
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
        displayMessage('OMG! You got it right!', true);
        setTimeout(fetchQuote, 3000); // Reset the game after 3 seconds
      } else {
        // Incorrect guess
        //attemptsLeft--;
        if(flagged.includes(guess.trim()))
        {
        displayMessage('Sorry you have already tried this!!!!!');
        }
        else
        {
        flagged.push(guess.trim());
        attemptsLeft = Math.max(attemptsLeft - 1, 0);
        updateAttemptsDisplay();

        
            if (attemptsLeft === 0) {
            // Out of attempts
            displayMessage(`Sorry, you're out of attempts. The correct quote was: "${originalQuote}"`);
            setTimeout(fetchQuote, 3000); // Reset the game after 3 seconds
            }     
            else 
            {
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
  
    // Fetch a quote when the page loads
    fetchQuote();
  
    // Event listener for the guess form submission
    document.getElementById('guess-form').addEventListener('submit', function (event) {
      event.preventDefault();
      if (answer === "") return;
      let guess = document.getElementById('guess').value;
      checkGuess(guess);
    });
  });
