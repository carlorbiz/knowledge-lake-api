// Aussie Wordle Game Logic
class AussieWordle {
    constructor() {
        this.targetWord = getTodaysWord();
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.maxGuesses = 6;
        this.guesses = [];
        this.letterStates = {}; // Track letter states for keyboard
        
        this.gameBoard = document.getElementById('game-board');
        this.keyboard = document.getElementById('keyboard');
        this.messageEl = document.getElementById('game-message');
        
        this.initializeGame();
        this.bindEvents();
        // Temporarily disable loadGameState to test
        // this.loadGameState();
        this.updateCountdown();
        
        // Update countdown every second
        setInterval(() => this.updateCountdown(), 1000);
    }
    
    initializeGame() {
        this.createBoard();
        this.bindKeyboard();
        this.bindModals();
    }
    
    createBoard() {
        // Board is already created in HTML, just need to get references
        this.tiles = Array.from(document.querySelectorAll('.tile'));
    }
    
    bindEvents() {
        // Add debounce mechanism to prevent double input
        this.lastKeyPress = null;
        this.lastKeyTime = 0;
        
        // Physical keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Virtual keyboard events - single handler only
        this.keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                e.preventDefault();
                e.stopPropagation();
                const key = e.target.getAttribute('data-key');
                this.processKeyPressWithDebounce(key, 'virtual');
            }
        });
    }
    
    bindKeyboard() {
        // This method is now handled by bindEvents() to avoid duplicate handlers
        // Keeping empty to maintain compatibility
    }
    
    bindModals() {
        // Help modal
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        
        helpBtn.addEventListener('click', () => {
            this.openModal(helpModal);
        });
        
        // Stats modal
        const statsBtn = document.getElementById('stats-btn');
        const statsModal = document.getElementById('stats-modal');
        
        statsBtn.addEventListener('click', () => {
            this.updateStatsDisplay();
            this.openModal(statsModal);
        });
        
        // Share buttons
        const shareBtn = document.getElementById('share-btn');
        const shareResultsBtn = document.getElementById('share-results-btn');
        
        shareBtn.addEventListener('click', () => this.shareResults());
        shareResultsBtn.addEventListener('click', () => this.shareResults());
        
        // Close buttons
        const closeBtns = document.querySelectorAll('.close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = btn.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                this.closeModal(modal);
            });
        });
        
        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        const key = e.key.toUpperCase();
        
        if (key === 'ENTER') {
            e.preventDefault();
            this.processKeyPressWithDebounce('ENTER', 'physical');
        } else if (key === 'BACKSPACE') {
            e.preventDefault();
            this.processKeyPressWithDebounce('BACKSPACE', 'physical');
        } else if (key.match(/[A-Z]/) && key.length === 1) {
            e.preventDefault();
            this.processKeyPressWithDebounce(key, 'physical');
        }
    }
    
    processKeyPressWithDebounce(key, source) {
        const now = Date.now();
        const timeDiff = now - this.lastKeyTime;
        
        // Prevent duplicate keys within 100ms
        if (this.lastKeyPress === key && timeDiff < 100) {
            return;
        }
        
        // Special handling for mobile - prefer virtual keyboard over physical
        if (source === 'physical' && timeDiff < 200 && this.isMobileDevice()) {
            return;
        }
        
        this.lastKeyPress = key;
        this.lastKeyTime = now;
        this.processKeyPress(key);
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }
    
    processKeyPress(key) {
        console.log('Processing key:', key, 'Game over:', this.gameOver, 'Current row:', this.currentRow, 'Current guess:', this.currentGuess);
        
        if (this.gameOver) return;
        
        // Add visual feedback for mobile users
        if (this.isMobileDevice()) {
            this.highlightKey(key);
        }
        
        if (key === 'ENTER') {
            console.log('Enter key pressed, calling submitGuess()');
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (key.match(/[A-Z]/) && this.currentGuess.length < 5) {
            this.addLetter(key);
        }
    }
    
    highlightKey(key) {
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, 150);
        }
    }
    
    addLetter(letter) {
        if (this.currentGuess.length < 5) {
            this.currentGuess += letter;
            this.updateCurrentRow();
        }
    }
    
    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentRow();
        }
    }
    
    updateCurrentRow() {
        const startIndex = this.currentRow * 5;
        for (let i = 0; i < 5; i++) {
            const tile = this.tiles[startIndex + i];
            const letter = this.currentGuess[i] || '';
            tile.textContent = letter;
            
            if (letter) {
                tile.classList.add('filled');
            } else {
                tile.classList.remove('filled');
            }
        }
    }
    
    submitGuess() {
        console.log('Submit guess called - Current row:', this.currentRow, 'Current guess:', this.currentGuess);
        
        if (this.currentGuess.length !== 5) {
            this.showMessage('Not enough letters', 'error');
            this.shakeRow();
            return;
        }
        
        if (!isValidWord(this.currentGuess)) {
            this.showMessage('Not in word list', 'error');
            this.shakeRow();
            return;
        }
        
        console.log('Valid guess, processing...');
        
        // Store the current guess
        const currentGuess = this.currentGuess;
        const currentRow = this.currentRow;
        
        // Add to guesses array
        this.guesses.push(currentGuess);
        console.log('Guesses array now:', this.guesses);
        
        // Process the guess immediately
        this.processGuess(currentGuess, currentRow);
        
        // Move to next row immediately (no timeout delays)
        this.currentRow++;
        this.currentGuess = '';
        
        console.log('Moved to row:', this.currentRow);
        
        // Check win/lose conditions
        if (currentGuess === this.targetWord) {
            console.log('Game won!');
            this.gameWon = true;
            this.gameOver = true;
            this.showMessage('Excellent!', 'success');
            this.updateStats(true, currentRow + 1);
            setTimeout(() => this.showGameOverModal(), 2000);
        } else if (currentRow >= this.maxGuesses - 1) {
            console.log('Game lost!');
            this.gameOver = true;
            this.showMessage(`The word was ${this.targetWord}`, 'error');
            this.updateStats(false, 0);
            setTimeout(() => this.showGameOverModal(), 2000);
        }
        
        this.saveGameState();
    }
    
    processGuess(guess, rowIndex) {
        const startIndex = rowIndex * 5;
        
        // Create working copies for analysis
        const targetLetters = this.targetWord.split('');
        const guessLetters = guess.split('');
        const result = Array(5).fill('absent');
        
        console.log('Processing guess:', guess, 'against target:', this.targetWord);
        
        // First pass: mark correct positions and remove from both arrays
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null; // Mark as used
                guessLetters[i] = null;  // Mark as processed
            }
        }
        
        console.log('After correct pass:', result);
        
        // Second pass: check for present letters in remaining positions
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null) { // Only check unprocessed letters
                const letterToCheck = guessLetters[i];
                const targetIndex = targetLetters.indexOf(letterToCheck);
                
                if (targetIndex !== -1) {
                    result[i] = 'present';
                    targetLetters[targetIndex] = null; // Mark this occurrence as used
                }
                // If not found, it remains 'absent' 
            }
        }
        
        console.log('Final result:', result);
        
        // Apply results to tiles with animation
        for (let i = 0; i < 5; i++) {
            const tile = this.tiles[startIndex + i];
            const letter = guess[i];
            
            setTimeout(() => {
                tile.classList.add('flip');
                tile.classList.add(result[i]);
                this.updateLetterState(letter, result[i]);
                
                // Update keyboard after last tile
                if (i === 4) {
                    setTimeout(() => this.updateKeyboard(), 100);
                }
            }, i * 100);
        }
    }
    

    

    
    updateLetterState(letter, state) {
        const currentState = this.letterStates[letter];
        
        // Priority: correct > present > absent
        if (state === 'correct' || 
            (state === 'present' && currentState !== 'correct') ||
            (state === 'absent' && !currentState)) {
            this.letterStates[letter] = state;
        }
    }
    
    updateKeyboard() {
        const keys = document.querySelectorAll('.key[data-key]');
        keys.forEach(key => {
            const letter = key.getAttribute('data-key');
            const state = this.letterStates[letter];
            
            if (state) {
                key.classList.remove('correct', 'present', 'absent');
                key.classList.add(state);
            }
        });
    }
    
    shakeRow() {
        const startIndex = this.currentRow * 5;
        for (let i = 0; i < 5; i++) {
            const tile = this.tiles[startIndex + i];
            tile.classList.add('shake');
            setTimeout(() => tile.classList.remove('shake'), 500);
        }
    }
    
    showMessage(text, type = '') {
        this.messageEl.textContent = text;
        this.messageEl.className = `message show ${type}`;
        
        setTimeout(() => {
            this.messageEl.classList.remove('show');
        }, 3000);
    }
    
    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    showGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const revealedWord = document.getElementById('revealed-word');
        const wordDefinition = document.getElementById('word-definition');
        const finalGuesses = document.getElementById('final-guesses');
        const finalStreak = document.getElementById('final-streak');
        
        if (this.gameWon) {
            const messages = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
            title.textContent = messages[this.currentRow] || 'Well Done!';
        } else {
            title.textContent = 'Better luck tomorrow!';
        }
        
        revealedWord.textContent = this.targetWord;
        wordDefinition.textContent = getWordDefinition(this.targetWord);
        
        const stats = this.getStats();
        finalGuesses.textContent = this.gameWon ? this.currentRow + 1 : 'X';
        finalStreak.textContent = stats.currentStreak;
        
        this.openModal(modal);
    }
    
    shareResults() {
        const stats = this.getStats();
        const guessCount = this.gameWon ? this.currentRow + 1 : 'X';
        
        let shareText = `Aussie Wordle ${guessCount}/6\\n\\n`;
        
        // Add emoji grid
        for (let row = 0; row <= this.currentRow && row < this.maxGuesses; row++) {
            for (let col = 0; col < 5; col++) {
                const tileIndex = row * 5 + col;
                const tile = this.tiles[tileIndex];
                
                if (tile.classList.contains('correct')) {
                    shareText += '🟩';
                } else if (tile.classList.contains('present')) {
                    shareText += '🟨';
                } else {
                    shareText += '⬜';
                }
            }
            shareText += '\\n';
        }
        
        if (navigator.share) {
            navigator.share({
                text: shareText
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText.replace(/\\n/g, '\\n')).then(() => {
                this.showMessage('Results copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareText.replace(/\\n/g, '\\n');
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showMessage('Results copied to clipboard!', 'success');
        }
    }
    
    updateCountdown() {
        const timeLeft = getTimeUntilNextWord();
        const countdownEl = document.getElementById('countdown');
        
        if (countdownEl) {
            countdownEl.textContent = `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`;
        }
        
        // Check if it's a new day (new word available)
        const currentWord = getTodaysWord();
        if (currentWord !== this.targetWord && this.gameOver) {
            // New word available, reload the game
            location.reload();
        }
    }
    
    // Statistics and Storage
    saveGameState() {
        const gameState = {
            targetWord: this.targetWord,
            currentRow: this.currentRow,
            guesses: this.guesses,
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            letterStates: this.letterStates,
            lastPlayed: new Date().toDateString()
        };
        
        localStorage.setItem('aussie-wordle-game', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const saved = localStorage.getItem('aussie-wordle-game');
        console.log('Loading game state:', saved);
        
        if (!saved) {
            console.log('No saved game state found');
            return;
        }
        
        try {
            const gameState = JSON.parse(saved);
            console.log('Parsed game state:', gameState);
            
            // Check if it's the same day and same word
            if (gameState.targetWord === this.targetWord && 
                gameState.lastPlayed === new Date().toDateString()) {
                
                console.log('Restoring game state for same day/word');
                this.currentRow = gameState.currentRow;
                this.guesses = gameState.guesses || [];
                this.gameOver = gameState.gameOver || false;
                this.gameWon = gameState.gameWon || false;
                this.letterStates = gameState.letterStates || {};
                
                console.log('Restored state - Row:', this.currentRow, 'Guesses:', this.guesses, 'Game over:', this.gameOver);
                
                // Restore board state
                this.restoreBoard();
                this.updateKeyboard();
            } else {
                console.log('Different day/word, clearing old state');
                localStorage.removeItem('aussie-wordle-game');
            }
        } catch (e) {
            console.error('Error loading game state:', e);
            localStorage.removeItem('aussie-wordle-game');
        }
    }
    
    restoreBoard() {
        for (let row = 0; row < this.guesses.length; row++) {
            const guess = this.guesses[row];
            const startIndex = row * 5;
            
            // Set letters and evaluate without animation
            this.restoreRow(guess, row);
        }
        
        if (!this.gameOver) {
            this.currentRow = this.guesses.length;
            this.currentGuess = '';
        }
    }
    
    restoreRow(guess, rowIndex) {
        const startIndex = rowIndex * 5;
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const result = Array(5).fill('absent');
        
        // First pass: check correct positions
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct';
                targetArray[i] = null;
                guessArray[i] = null;
            }
        }
        
        // Second pass: check present letters
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] && targetArray.includes(guessArray[i])) {
                result[i] = 'present';
                const targetIndex = targetArray.indexOf(guessArray[i]);
                targetArray[targetIndex] = null;
            }
        }
        
        // Set tiles immediately (no animation for restore)
        for (let i = 0; i < 5; i++) {
            const tile = this.tiles[startIndex + i];
            const letter = guess[i];
            
            tile.textContent = letter;
            tile.classList.add('filled', result[i]);
            
            // Update letter state for keyboard
            this.updateLetterState(letter, result[i]);
        }
    }
    
    getStats() {
        const saved = localStorage.getItem('aussie-wordle-stats');
        const defaultStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0],
            lastPlayed: null
        };
        
        if (!saved) return defaultStats;
        
        try {
            return { ...defaultStats, ...JSON.parse(saved) };
        } catch (e) {
            return defaultStats;
        }
    }
    
    updateStats(won, guesses) {
        const stats = this.getStats();
        const today = new Date().toDateString();
        
        // Check if already played today
        if (stats.lastPlayed === today) return;
        
        stats.gamesPlayed++;
        stats.lastPlayed = today;
        
        if (won) {
            stats.gamesWon++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            stats.guessDistribution[guesses - 1]++;
        } else {
            stats.currentStreak = 0;
        }
        
        localStorage.setItem('aussie-wordle-stats', JSON.stringify(stats));
    }
    
    updateStatsDisplay() {
        const stats = this.getStats();
        
        document.getElementById('games-played').textContent = stats.gamesPlayed;
        document.getElementById('win-percentage').textContent = 
            stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        document.getElementById('current-streak').textContent = stats.currentStreak;
        document.getElementById('max-streak').textContent = stats.maxStreak;
        
        // Update distribution chart
        const maxCount = Math.max(...stats.guessDistribution, 1);
        for (let i = 0; i < 6; i++) {
            const count = stats.guessDistribution[i];
            const percentage = (count / maxCount) * 100;
            
            document.getElementById(`guess-${i + 1}`).textContent = count;
            document.querySelector(`[data-guess="${i + 1}"]`).style.width = `${Math.max(percentage, 7)}%`;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AussieWordle();
});

// Service Worker registration for offline play (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}