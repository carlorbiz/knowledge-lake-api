# Aussie Wordle - Daily Word Challenge

A Wordle-style word puzzle game featuring authentic Australian English words based on Macquarie Dictionary standards. Challenge yourself with fair dinkum Aussie vocabulary!

## 🎯 Features

### Currently Implemented
- **Daily Word Challenge**: New 5-letter Australian word every day
- **Australian English Spelling**: Authentic vocabulary using proper Australian spellings (e.g., "colour", "centre", "realise")
- **Comprehensive Word Database**: Over 400 answer words and 2000+ valid guess words
- **Authentic Aussie Terms**: Includes genuine Australian slang and colloquialisms like "chook", "esky", "yakka", "bogan"
- **Smart Game Logic**: Proper letter highlighting (green=correct position, yellow=wrong position, grey=not in word)
- **Statistics Tracking**: Win percentage, current streak, max streak, guess distribution
- **Game State Persistence**: Resume games after browser close using local storage
- **Share Results**: Copy emoji-based results to share with friends
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Australian Time Zone**: Daily refresh at midnight AEST/AEDT
- **Educational Definitions**: Learn word meanings after completing puzzles
- **Accessibility Support**: Keyboard navigation and screen reader friendly

### Game Mechanics
- **6 attempts** to guess the daily word
- **Physical and virtual keyboards** supported
- **Real-time validation** of word entries
- **Animated tile flips** with colour-coded feedback
- **Keyboard colour updates** to track used letters
- **Shake animation** for invalid words
- **Success celebrations** with difficulty-based messages

### User Interface
- **Clean, modern design** with Australian colour scheme
- **Help modal** with clear instructions and examples
- **Statistics modal** with detailed performance metrics
- **Game over modal** with word reveal and definition
- **Countdown timer** showing time until next word
- **Message system** for game feedback

## 🚀 Technical Implementation

### File Structure
```
├── index.html          # Main game interface
├── css/
│   └── style.css       # Responsive styling with Australian theme
├── js/
│   ├── words.js        # Australian word database and utilities
│   └── game.js         # Core game logic and state management
└── README.md           # Project documentation
```

### Key Technologies
- **Vanilla JavaScript** for maximum performance and compatibility
- **CSS Grid/Flexbox** for responsive layout
- **Local Storage API** for persistent game state and statistics
- **CSS Animations** for smooth tile flips and transitions
- **Web Share API** with clipboard fallback for result sharing
- **Australian timezone handling** for accurate daily word rotation

### Word Database Features
- **ANSWER_WORDS**: Curated list of common, fair Australian words for daily challenges
- **VALID_WORDS**: Extended vocabulary including technical terms and variants
- **Word definitions**: Educational descriptions for completed words
- **Australian spelling consistency**: Proper "-our", "-ise", "-re" endings
- **Cultural authenticity**: Real Australian slang and regional terms

### Game Logic Highlights
- **Deterministic daily words** based on date calculation
- **Proper Wordle scoring** with correct letter precedence
- **State management** for game persistence across sessions
- **Statistics calculation** with streak tracking
- **Input validation** preventing invalid submissions
- **Animated feedback** for enhanced user experience

## 📱 Usage

### Playing the Game
1. Open `index.html` in any modern web browser
2. Type or click letters to build your 5-letter guess
3. Press ENTER to submit your guess
4. Use the colour feedback to improve your next guess:
   - **Green**: Correct letter in correct position
   - **Yellow**: Correct letter in wrong position
   - **Grey**: Letter not in the word
5. Complete the word in 6 attempts or fewer

### Viewing Statistics
- Click the 📊 icon to see your performance metrics
- Track games played, win percentage, and streaks
- View guess distribution to analyse your solving patterns
- See countdown to next daily word

### Sharing Results
- Complete the daily puzzle to unlock sharing
- Click "Share Results" to copy emoji grid to clipboard
- Share your results without spoiling the word

## 🎮 Game Features in Detail

### Daily Word System
- **Timezone-aware**: Updates at midnight Australian time
- **Consistent rotation**: Same word for all players on same day
- **Seed-based selection**: Deterministic but unpredictable word choice
- **Fair vocabulary**: Only common, legitimate words as daily answers

### Statistics System
- **Persistent tracking**: Data saved locally across browser sessions
- **Comprehensive metrics**: Win rate, streaks, distribution analysis
- **Visual representation**: Bar chart showing guess patterns
- **Privacy-focused**: All data stored locally on user's device

### Australian Vocabulary
The word database includes:
- **Standard Australian English**: Proper spellings and common words
- **Regional slang**: Authentic terms like "arvo", "servo", "brekkie"
- **Cultural references**: Words specific to Australian context
- **Educational value**: Definitions help expand vocabulary knowledge

## 🔧 Customisation Options

### Easy Modifications
- **Word difficulty**: Adjust ANSWER_WORDS array for easier/harder words
- **Game length**: Change `maxGuesses` in game.js for more/fewer attempts
- **Colour scheme**: Update CSS custom properties for different themes
- **Timezone**: Modify timezone in getTodaysWord() function
- **Additional words**: Expand VALID_WORDS array for broader vocabulary

### Advanced Features
- **Multiple game modes**: Add timed mode or unlimited play
- **Hint system**: Implement letter or definition hints
- **Achievement system**: Track special accomplishments
- **Social features**: Add leaderboards or friend comparisons
- **Offline support**: Implement service worker for offline play

## 📈 Performance Characteristics

### Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile support**: iOS Safari, Android Chrome
- **Fallback features**: Graceful degradation for older browsers
- **No dependencies**: Pure vanilla JavaScript for maximum compatibility

### Performance Metrics
- **Fast loading**: Minimal resource requirements
- **Responsive interactions**: Smooth animations at 60fps
- **Memory efficient**: Small footprint with local storage only
- **Network independent**: Works entirely offline after initial load

## 🚀 Deployment Instructions

To make your Aussie Wordle live and accessible online:

**Use the Publish tab** in your development environment to deploy the website with one click. The Publish tab will handle all deployment processes automatically and provide you with the live website URL.

### Local Development
1. Serve files through a local web server (not file:// protocol)
2. Test on multiple devices and browsers
3. Verify daily word rotation works correctly
4. Check statistics persistence across sessions

## 🎯 Recommended Next Steps

### Immediate Enhancements
1. **Service Worker**: Add offline support for complete PWA experience
2. **Keyboard shortcuts**: Implement additional hotkeys for power users
3. **Animation polish**: Add more celebration effects for wins
4. **Word hints**: Optional definition clues for educational mode

### Advanced Features
1. **Multiple difficulty levels**: Easy/Medium/Hard word categories
2. **Australian trivia mode**: Cultural context questions
3. **Regional variations**: Different Australian state/territory word sets
4. **Audio pronunciation**: Hear correct pronunciation of words
5. **Educational integration**: Links to full Macquarie Dictionary entries

### Technical Improvements
1. **Progressive Web App**: Add manifest and service worker
2. **Performance monitoring**: Track user engagement metrics
3. **A/B testing**: Experiment with different game parameters
4. **Accessibility audit**: Full WCAG compliance review
5. **SEO optimisation**: Meta tags and structured data

## 🌟 Australian Cultural Elements

This game celebrates Australian English through:
- **Authentic vocabulary**: Real words from Australian lexicon
- **Cultural inclusivity**: Terms from various Australian communities
- **Educational focus**: Learn uniquely Australian expressions
- **Respectful representation**: Thoughtful inclusion of regional variations

The word selection aims to be inclusive, educational, and representative of modern Australian English while maintaining the fun and challenge of the original Wordle concept.

---

**Enjoy your daily dose of fair dinkum Australian word puzzles! 🇦🇺**