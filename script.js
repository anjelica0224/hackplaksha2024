document.addEventListener('DOMContentLoaded', function () {
    let answer = "";
    let attemptsLeft = 5;
    let originalQuote = '';
    let revealedQuote = '';
  
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
  
          // Randomly select one word to blank out
          const wordToBlankIndex = Math.floor(Math.random() * words.length);
          answer = words[wordToBlankIndex];
          const blankedWord = answer;
  
          // Blank out the selected word in the revealed quote
          words[wordToBlankIndex] = '_'.repeat(blankedWord.length);
  
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
      if (guess.trim() === answer) {
        // Correct guess
        displayMessage('OMG! You got it right!');
        setTimeout(fetchQuote, 3000); // Reset the game after 3 seconds
      } else {
        // Incorrect guess
        //attemptsLeft--;
        attemptsLeft = Math.max(attemptsLeft - 1, 0);
        updateAttemptsDisplay();
        if (attemptsLeft === 0) {
          // Out of attempts
          displayMessage(`Sorry, you're out of attempts. The correct quote was: "${originalQuote}"`);
          setTimeout(fetchQuote, 3000); // Reset the game after 3 seconds
        } else {
          // Display remaining attempts
          displayMessage('Incorrect guess. Try again!');
        }
      }
    }
  
    // Function to display message
    function displayMessage(message) {
      document.getElementById('message').textContent = message;
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