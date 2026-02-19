// ===== Game Configuration =====
const CONFIG = {
    GRID_ROWS: 5,      // Vertical grid size (number of rows) - default for medium
    GRID_COLS: 5,      // Horizontal grid size (number of columns) - default for medium
    TIMER_DURATION: 600, // seconds
    POINTS_PER_WORD: 60,   // Maximum points per word (p) - matches reference game
    TIME_PENALTY: 1,       // Points lost per second (1 point/second)
    HINT_PENALTY: 50,
    WORDS_TO_FIND: 6,  // Number of words to find in each game (default for medium)
};

// Difficulty settings
// Word counts match the PRD reward table: Easy=5, Medium=8, Hard=10
const DIFFICULTY_SETTINGS = {
    easy:   { min: 5,  max: 5,  rows: 5, cols: 5, maxWordLength: 4 },
    medium: { min: 8,  max: 8,  rows: 6, cols: 6, maxWordLength: 5 },
    hard:   { min: 10, max: 10, rows: 7, cols: 7, maxWordLength: 6 }
};

// Helper function to split text into grapheme clusters
function getGraphemes(text, lang = 'hindi') {
    if (lang === 'english') {
        return Array.from(text.toUpperCase());
    }
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text), s => s.segment);
    }
    return Array.from(text);
}

// ===== Language Databases =====
const HINDI_CHARACTERS = ["अ","आ","इ","ई","उ","ऊ","ए","ऐ","ओ","औ","क","ख","ग","घ","च","छ","ज","झ","ट","ठ","ड","ढ","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह","का","कि","की","कु","कू","के","कै","को","कौ","गा","गि","गी","गु","गू","गे","गै","गो","गौ","चा","चि","ची","चु","चू","चे","चै","चो","चौ","जा","जि","जी","जु","जू","जे","जै","जो","जौ","ता","ति","ती","तु","तू","ते","तै","तो","तौ","दा","दि","दी","दु","दू","दे","दै","दो","दौ","ना","नि","नी","नु","नू","ने","नै","नो","नौ","पा","पि","पी","पु","पू","पे","पै","पो","पौ","बा","बि","बी","बु","बू","बे","बै","बो","बौ","मा","मि","मी","मु","मू","मे","मै","मो","मौ","या","यि","यी","यु","यू","ये","यै","यो","यौ","रा","रि","री","रु","रू","रे","रै","रो","रौ","ला","लि","ली","लु","लू","ले","लै","लो","लौ","वा","वि","वी","वु","वू","वे","वै","वो","वौ","सा","सि","सी","सु","सू","से","सै","सो","सौ","हा","हि","ही","हु","हू","हे","है","हो","हौ"];

const ENGLISH_CHARACTERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

const HINDI_WORDS = [["आ","द","र्श"],["अ","ना","ज"],["सं","गी","त"],["जी","व","न"],["कि","ता","ब"],["गा","ड़ी"],["सा","ह","स"],["स","मा","ज"],["म","हि","ला"],["खे","ल"],["बा","ल"],["सा","ध","न"],["चाँ","द"],["न","दी"],["घ","र"],["न","म","क"],["ह","वा"],["चा","य"],["भा","षा"],["रं","ग"],["मि","त्र"],["स","म","य"],["स","च"],["चि","त्र"],["झी","ल"],["क","ल","म"],["खे","त"],["दु","का","न"],["या","त्रा"],["झा","ड़"],["शि","क्षा"],["प","रि","वा","र"],["क","वि"],["मं","दि","र"],["शा","म"],["शां","ति"],["खो","ज"],["यो","ग"],["ग","र्मी"],["क","ला"],["खा","ना"],["प्रे","म"],["आ","ज"],["अ","मी","र"],["बं","द","र"],["यो","ज","ना"],["ह","रा"],["प","त्र"],["रो","टी"],["दे","श"],["गा","ना"],["ग","री","ब"],["द","वा"],["रा","ज"],["स","फ","र"],["ब","हु","त"],["ग","णि","त"],["ता","ज"],["का","ल"],["आ","वा","स"],["मौ","स","म"],["का","म"],["वि","वा","ह"],["पा","नी"],["ब","गी","चा"],["का","र्या","ल","य"],["आ","म"],["बी","मा","री"],["गा","य","क"],["ना","ट","क"],["दि","शा"],["पं","ख"],["खे","ती"],["सा","ध","ना"],["मि","ट्टी"],["सुं","द","र"],["स","मु","द्र"],["मी","ठा"],["छा","त्र"],["म","ह","ल"],["न","ह","र"],["सै","र"],["पे","ड़"],["ज","न"],["का","ग","ज़"],["क","क्षा"],["ग","ह","ना"],["सु","र"],["म","शी","न"],["वा","ह","न"],["ईं","ट"],["बा","रि","श"],["ह","रि","त"],["भ","व","न"],["पु","ल"],["वि","चा","र"],["सु","ख"],["दां","त"],["उ","त्त","र"],["खु","शी"],["बा","त"],["ध","र्म"],["रो","ग"],["उ","धा","र"],["न","ग","र"],["जं","ग","ल"],["ठं","डा"],["रा","त्रि"],["ह","री"],["आं","ग","न"],["आ","नं","द"],["फ","स","ल"],["तौ","ल"],["सू","र","ज"],["ना","म"],["म","ट","र"],["व","की","ल"],["स","ला","ह"],["जो","श"],["स","ड़","क"],["बा","जा","र"],["ब","च","त"],["ज्ञा","न"],["छ","वि"],["सो","च"],["धा","गा"],["ला","भ"],["जी","रा"],["शो","ध"],["फु","ल"],["ग","ण","ना"],["स","भा"],["आ","हा","र"],["दि","न"],["क","ड़ी"],["आ","शा"],["भ","ज","न"],["स","दी"],["मि","ठा","ई"],["वि","ष","य"],["प","द"],["अ","मृ","त"],["म","छ","ली"],["बी","ज"],["सा","ग","र"],["सा","ल"],["पै","सा"],["गी","त"],["पा","ठ"],["का","र"],["भा","ई"],["वि","द्या"],["श","ह","र"],["का","र्य"],["रा","शि"],["टे","ब","ल"],["यु","द्ध"],["खा","द्य"],["दे","वी"],["से","ह","त"],["हिं","दी"],["धा","रा"],["मा","ला"],["ह","र्ष"],["ब","ज","ट"],["कु","र्सी"],["छा","या"],["आ","ज्ञा"],["सं","तो","ष"],["ले","ख","न"],["पा","र्क"],["यं","त्र"],["ले","ख","क"],["चा","द","र"],["सं","ता","न"],["श्र","म"],["आं","धी"],["शो","क"],["मे","ज़"],["प","ह","ल"],["मा","र्ग"],["धू","ल"],["च","म","क"],["मृ","दु"],["ज","ल"],["नि","य","म"],["त","ट"],["सु","झा","व"],["का","ला"],["ल","ह","र"],["ना","व"],["भं","डा","र"],["अं","क"],["प","थ"],["शे","र"],["धू","प"],["पु","रा","ना"],["भू","मि"],["मा","सू","म"],["स","वा","री"],["चू","ड़ी"],["आ","ग"],["क","रि","य","र"],["ग्र","ह"],["इ","का","ई"],["अ","नु","भ","व"],["ऊ","र्जा"],["आ","का","श"],["अ","ट","ल"],["अ","ग","ला"],["आ","द","र"],["आ","घा","त"],["अं","गू","र"],["आ","या","म"],["अं","ग"],["आ","भा","स"],["आ","कृ","ति"],["अ","खि","ल"],["अ","धि","का","र"],["आ","य"],["अ","सं","भ","व"],["अ","म","र"],["अ","का","ल"],["अं","श"],["अ","क्ष","र"],["अ","ति","थि"],["आ","श्र","म"],["अ","पी","ल"],["अ","नु","कू","ल"],["अ","र्थ"],["अ","धि","क"],["आ","भा","र"],["अ","णु"],["आ","प","सी"],["आ","कां","क्षा"],["अ","गा","ध"],["आ","पू","र्ति"],["अ","पू","र्व"],["अ","च","ल"],["अ","नु","म","ति"],["अ","व","शे","ष"],["अ","रु","ण"],["अ","शां","ति"],["अं","कि","त"],["अ","भि","ज्ञ"],["आ","व","र","ण"],["आ","यू","र्वे","द"],["आ","शं","का"],["आ","श्र","य"],["आ","वे","द","न"],["अ","नं","त"],["अ","शु","द्ध"],["अ","भ","य"],["अ","शो","क"],["आ","क्रो","श"],["उ","प","दे","श"],["उ","पा","स","ना"],["आ","श्रि","त"],["आ","चा","र"],["उ","पे","क्षा"],["अ","दा"],["आ","लो","क"],["औ","ष","धि"],["आ","रं","भ"],["स","क्रि","य"],["अ","ग","म"],["अ","स","हा","य"],["उ","प","यो","ग"],["अ","र्ज","न"],["अ","नु","मा","न"],["अ","प्रि","य"],["अ","ग्र","णी"],["अ","ति"],["आ","दे","श"],["अ","हं","का","र"],["आ","धा","र"],["आ","धु","नि","क"],["अ","व","धि"],["अं","त","र","ण"],["अं","त","रा","ल"],["अ","र्च","ना"],["आ","डं","ब","र"],["अ","धि","नि","य","म"],["अ","खं","ड"],["अ","र्ध"],["अ","र्क"],["अ","नु","कू","ल"],["अ","व","ग","ति"],["अ","भि","न","य"],["आ","मू","ल"],["आं","शि","क"],["अ","ना","म"],["आ","य","त","न"],["अ","नु","ग्र","ह"],["अ","लं","कृ","त"],["अ","लो","प"],["आ","यो","ग"],["आ","मं","त्र","ण"],["अ","ति","रे","क"],["अ","म","ल"],["अं","त","र"],["अ","हिं","सा"],["अ","ल","गा","व"],["अ","थ","वा"],["आ","रो","प"],["अ","वि","वा","द"],["अ","शां","त"],["अ","सी","म"],["आ","वृ","त्ति"],["अ","पू","र्ण"],["अ","नु","दा","न"],["अ","भि","यो","ग"],["आ","क","र्ष","ण"],["अ","सं","ग","त"],["आ","ग्र","ह"],["अ","मि","त"],["आ","क्रा","म","क"],["अ","नु","भू","ति"],["आ","व","र्त","न"],["अ","सं","तो","ष"],["अ","ने","क","ता"],["अ","र्च","न"],["आ","का","र"],["अ","व","य","व"],["आ","मं","त्रि","त"],["अ","नि","य","मि","त"],["अ","प","रा","ध"],["आ","यो","जि","त"],["अ","तु","ल","नी","य"],["अ","क","स","र"],["अ","धी","न"],["अ","व","मा","न"],["अं","त","र्ज्ञा","न"],["आ","यो","ज","क"],["अ","ना","मि","का"],["सं","वि","धा","न"],["उ","प","का","र"],["प्र","सि","द्ध"],["सृ","ज","न"],["म","ह","त्व"],["वि","जे","ता"],["उ","दा","ह","र","ण"],["सं","प","त्ति"],["मा","न","व","ता"],["न","वी","न"],["सु","ल","झा","ना"],["प्र","ग","ति"],["स","ह","यो","ग"],["प्र","भा","व"],["प","रं","प","रा"],["स","ह","म","ति"],["शा","स","न"],["सु","र","क्षा"],["सं","र","क्ष","ण"],["सं","र","च","ना"],["स","प","ना"],["सा","व","धा","नी"],["सं","सा","र"],["उ","द्य","म"],["प","रि","व","र्त","न"],["सं","चा","र"],["सं","के","त"],["सं","पू","र्ण"],["वि","व","र","ण"],["सं","चा","ल","न"],["स","म","र्थ","न"],["प्र","वृ","त्ति"],["नि","वे","द","न"],["वि","त्ती","य"],["नि","यं","त्र","ण"],["सं","बं","ध"],["व","र्ण","न"],["वि","का","स"],["सं","यो","ज","न"],["आ","धु","नि","क","ता"],["प्र","कृ","ति"],["स","ही"],["प","रि","णा","म"],["मं","च"],["शा","न","दा","र"],["स","ह","म","त"],["अ","भि","ने","ता"],["सं","भा","व","ना"],["उ","प","यो","गी"],["प्र","सं","ग"],["नि","रा","धा","र"],["सा","रां","श"],["स","मृ","द्धि"],["दृ","ढ़","ता"],["वि","शे","ष","ता"],["स","मा","न"],["व","र्ण"],["प्र","द","र्श","न"],["ग","ति"],["मू","ल"],["स","ज","ग"],["सु","धा","र"],["प","र","म"],["वि","ज","य"],["ग्र","ह","ण"],["स","हा","य","क"],["वि","भा","ज","न"],["उ","प","यो","गि","ता"],["न","वी","न","ता"],["स","ह","यो","गि","ता"],["सं","पू","र्ण","ता"],["प्रा","कृ","ति","क"],["सं","ग","त"],["वि","प","री","त"],["सं","प्रे","ष","ण"],["स","म","झौ","ता"],["वि","भा","ग"],["प","री","क्ष","ण"],["नौ","क","री"],["वि","वे","क"],["प्र","सि","द्धि"],["सु","ग","म","ता"],["वि","चा","र","शी","ल"],["स","मा","नां","त","र"],["नि","वे","श"],["सं","ग","ठि","त"],["नि","र्दे","श"],["व","र्त","मा","न"],["स","ह","का","री"],["स","भी"],["स","म","य","सी","मा"],["प्र","ति","कू","ल"],["सु","वि","धा"],["प्र","यो","ज","न"],["सु","ख","द"],["प्रे","र","क"],["रू","पां","त","र","ण"],["शि","क्ष","ण"],["सं","तु","लि","त"],["नि","यो","ज","न"],["सं","बं","धि","त"],["सा","म","ग्री"],["आ","च","र","ण"],["उ","प","क्र","म"],["वि","वि","ध","ता"],["प्र","भा","व","शा","ली"],["स","मा","न","ता"],["वि","विधि"],["प्र","व","र्त","न"],["सु","प","रि","चि","त"],["सु","प","रि","णा","म"],["प्र","मा","ण"],["स","र्वो","त्त","म"],["प्र","णा","ली"],["स","हा","य","ता"],["वृ","त्तां","त"],["वि","सं","ग","ति"],["उ","पा","य"],["स","हा","नु","भू","ति"]];

const ENGLISH_WORDS = ["LOVE","HOPE","LIFE","TIME","WORK","PLAY","BOOK","TREE","STAR","MOON","BIRD","FISH","KING","RING","SONG","WORD","HAND","LAND","WIND","MIND","GOLD","COLD","BOLD","TOLD","MAKE","TAKE","LAKE","WAKE","FIRE","WIRE","TIRE","HIRE","GAME","NAME","FAME","SAME","RAIN","PAIN","GAIN","MAIN","BLUE","TRUE","CLUE","GLUE","BEAR","DEAR","FEAR","HEAR","JUMP","PUMP","BUMP","DUMP","SHIP","TRIP","SLIP","FLIP","SNOW","BLOW","FLOW","GLOW","DARK","PARK","MARK","BARK","ROAD","LOAD","TOAD","CODE","ROSE","NOSE","POSE","HOSE","WAVE","CAVE","SAVE","GAVE","BELL","TELL","SELL","WELL","DOOR","POOR","MOOR","FLOOR","COIN","JOIN","RAIN","PAIN","BEAN","MEAN","LEAN","DEAN","TEAM","BEAM","SEAM","CREAM","FARM","HARM","WARM","CHARM","BIRD","WORD","LORD","CORD","FISH","WISH","DISH","SWISH","FROG","BLOG","CLOG","SMOG","GIFT","LIFT","SIFT","SWIFT","HILL","MILL","PILL","WILL","NEST","BEST","REST","TEST","LAMP","CAMP","DAMP","RAMP","SAND","BAND","HAND","LAND","MILK","SILK","BULK","HULK","MOON","SOON","NOON","SPOON","RAIN","MAIN","PAIN","TRAIN","STAR","SCAR","CHAR","GUITAR","BEAR","PEAR","WEAR","SWEAR","COIN","JOIN","LOIN","GROIN","BOAT","COAT","GOAT","FLOAT","SEED","NEED","FEED","SPEED","TREE","FREE","FLEE","AGREE","DRUM","PLUM","GLUM","CHUM","KING","RING","SING","BRING","BALL","CALL","FALL","HALL","DUCK","LUCK","BUCK","TRUCK","CAKE","MAKE","TAKE","SNAKE","BONE","CONE","TONE","PHONE","KITE","BITE","SITE","WHITE","MICE","RICE","DICE","PRICE","CUBE","TUBE","RUBE","LUBE","MULE","RULE","YULE","FUEL","DUNE","JUNE","TUNE","PRUNE","CAPE","TAPE","DRAPE","GRAPE","MAZE","GAZE","HAZE","BLAZE","WAVE","CAVE","PAVE","BRAVE","DOME","HOME","ROME","CHROME","VINE","MINE","PINE","SPINE","ZONE","BONE","CONE","DRONE","LIME","TIME","DIME","CRIME","SAGE","CAGE","PAGE","STAGE","ROBE","LOBE","GLOBE","PROBE","TIDE","RIDE","HIDE","SLIDE","FAME","GAME","LAME","BLAME","CURE","PURE","SURE","LURE","DUKE","LUKE","PUKE","FLUKE","DAZE","HAZE","MAZE","CRAZE","VASE","BASE","CASE","CHASE","ROPE","HOPE","COPE","SLOPE","PIKE","BIKE","HIKE","SPIKE","DOME","ROME","TOME","GNOME","MUTE","CUTE","LUTE","FLUTE","FADE","JADE","MADE","SHADE","PILE","MILE","TILE","SMILE","FUME","PLUME","FLUME","ASSUME"];

// ===== UI Translations =====
const UI_TRANSLATIONS = {
    hindi: {
        wordListTitle: "शब्द खोजने के लिए अक्षरों को चुनें",
        newGameBtn: "नया खेल शुरू करें",
        gameOverTitle: "खेल समाप्त!",
        yourScore: "आपका स्कोर:",
        bestScore: "आज का सर्वोत्तम स्कोर:",
        wordsFound: "शब्द मिले:",
        outOf: "में से",
        playAgain: "फिर से खेलें",
        modalCoinsText: "कॉइन्स अर्जित करने",
        modalCongratsPrefix: "के लिए",
        modalCongratsText: "बधाई!",
        modalMessage: "अच्छा प्रयास!",
        playAgainText: "पुनः खेलें"
    },
    english: {
        wordListTitle: "Select letters to find words",
        newGameBtn: "Start New Game",
        gameOverTitle: "Game Over!",
        yourScore: "Your Score:",
        bestScore: "Today's Best Score:",
        wordsFound: "Words Found:",
        outOf: "out of",
        playAgain: "Play Again",
        modalCoinsText: "coins earned for",
        modalCongratsPrefix: "",
        modalCongratsText: "Congratulations!",
        modalMessage: "Good Effort!",
        playAgainText: "Play Again"
    }
};

function updateUILanguage(lang) {
    const t = UI_TRANSLATIONS[lang];
    
    // Update word list title (in pattern display)
    if (game.selectedCells && game.selectedCells.length === 0) {
        const patternDisplay = document.getElementById('patternDisplay');
        if (patternDisplay) patternDisplay.textContent = t.wordListTitle;
    }
    
    // Update new game button
    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) newGameBtn.textContent = t.newGameBtn;
    
    // Update game over modal labels
    const yourScoreLabel = document.getElementById('yourScoreLabel');
    if (yourScoreLabel) yourScoreLabel.textContent = t.yourScore;
    
    const bestScoreLabel = document.getElementById('bestScoreLabel');
    if (bestScoreLabel) bestScoreLabel.textContent = t.bestScore;
    
    const wordsFoundLabel = document.getElementById('wordsFoundLabel');
    if (wordsFoundLabel) wordsFoundLabel.textContent = t.wordsFound;

    // Update coin / congrats text elements (always apply these)
    if (elements.modalCoinsText)      elements.modalCoinsText.textContent      = t.modalCoinsText;
    if (elements.modalCongratsPrefix) elements.modalCongratsPrefix.textContent = t.modalCongratsPrefix;
    if (elements.modalCongratsText)   elements.modalCongratsText.textContent   = t.modalCongratsText;
    if (elements.playAgainText)       elements.playAgainText.textContent       = t.playAgainText;
    if (elements.yourScoreLabel)      elements.yourScoreLabel.textContent      = t.yourScore;
    if (elements.bestScoreLabel)      elements.bestScoreLabel.textContent      = t.bestScore;

    // NOTE: modalMessage is intentionally NOT updated here.
    // endGame() sets it based on eligibility AFTER calling this function,
    // so we must not overwrite it blindly with the generic "Good Effort" text.
    // Store the default text as a data attribute so endGame() can read it.
    if (elements.modalMessage) {
        elements.modalMessage.dataset.defaultText = t.modalMessage;
    }

    // Update Play Again button (preserve SVG, only update text span)
    const playAgainTextEl = document.getElementById('playAgainText');
    if (playAgainTextEl) playAgainTextEl.textContent = t.playAgainText;
}

// ===== Game State =====
class GameState {
    constructor() {
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.timeRemaining = 0;
        this.selectedCells = [];
        this.grid = []; // Array of grapheme clusters
        this.wordPositions = {}; // Store where each word is placed
        this.wordColors = {}; // Store assigned color for each word
        this.foundWords = []; // Store found words with their cell indices and colors
        this.currentSelectionColor = '#4fd1c5'; // Default selection color
        this.isGameActive = false;
        this.timerInterval = null;
        this.currentWord = '';
        this.currentWordSet = null;
        this.gameStartTime = null; // Track when game started
        this.currentWordStartTime = null; // Track when current word search started
        this.leaderboardData = {
            currentUserScore: 0,
            leftRank: 10,
            rightRank: 12
        };
        
        // Detect iOS devices (vibration not supported in iOS Safari)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // Check if vibration API is supported
        const vibrationSupported = 'vibrate' in navigator;
        
        // Persistent Settings
        this.settings = {
            sound: localStorage.getItem('soundEnabled') !== 'false',
            // Disable vibration by default on iOS or if not supported
            vibration: vibrationSupported && !isIOS 
                ? localStorage.getItem('vibrationEnabled') !== 'false'
                : false,
            theme: localStorage.getItem('gameTheme') || 'sunset',
            language: localStorage.getItem('gameLanguage') || 'hindi',
            difficulty: localStorage.getItem('gameDifficulty') || 'easy'
        };
        
        // Save vibration state for iOS
        if (isIOS || !vibrationSupported) {
            localStorage.setItem('vibrationEnabled', 'false');
        }
        
        this.applyTheme(this.settings.theme);
    }
    
    applyTheme(themeName) {
        document.body.className = themeName === 'default' ? '' : `theme-${themeName}`;
        localStorage.setItem('gameTheme', themeName);
        this.settings.theme = themeName;
    }

    toggleSound(enabled) {
        this.settings.sound = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    toggleVibration(enabled) {
        this.settings.vibration = enabled;
        localStorage.setItem('vibrationEnabled', enabled);
    }

    vibrate(pattern = 50) {
        // Check if vibration is enabled and supported
        if (!this.settings.vibration) return;
        
        if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
            try {
                navigator.vibrate(pattern);
            } catch (err) {
                console.warn('Vibration failed:', err);
            }
        } else {
            console.log('Vibration API not supported on this device');
        }
    }

    setLanguage(lang) {
        this.settings.language = lang;
        localStorage.setItem('gameLanguage', lang);
    }

    setDifficulty(difficulty) {
        this.settings.difficulty = difficulty;
        localStorage.setItem('gameDifficulty', difficulty);
    }

    getGridDimensions() {
        const difficulty = DIFFICULTY_SETTINGS[this.settings.difficulty];
        return {
            rows: difficulty.rows,
            cols: difficulty.cols
        };
    }

    reset() {
        this.score = 0;
        this.timeRemaining = 0;
        this.selectedCells = [];
        this.currentWord = '';
        this.isGameActive = true;
        this.wordPositions = {};
        this.foundWords = []; // Reset found words
        this.wordColors = {}; // Reset word colors
        this.gameStartTime = Date.now(); // Set game start time
        this.currentWordStartTime = Date.now(); // Set initial word start time
        this.selectRandomWordSet();
        this.generateGrid();
    }

    selectRandomWordSet() {
        // Get word count based on difficulty
        const difficultyRange = DIFFICULTY_SETTINGS[this.settings.difficulty];
        const numWords = Math.floor(Math.random() * (difficultyRange.max - difficultyRange.min + 1)) + difficultyRange.min;
        const selected = [];
        const gridDims = this.getGridDimensions();
        const isEnglish = this.settings.language === 'english';
        const wordList = isEnglish ? ENGLISH_WORDS : HINDI_WORDS;
        const charList = isEnglish ? ENGLISH_CHARACTERS : HINDI_CHARACTERS;
        
        // Use maxWordLength from difficulty settings
        const maxWordLength = difficultyRange.maxWordLength;
        
        // Filter words by length first
        let eligibleWords = [];
        if (isEnglish) {
            eligibleWords = wordList.filter(word => word.length <= maxWordLength);
        } else {
            eligibleWords = wordList.filter(wordArr => wordArr.length <= maxWordLength);
        }
        
        // If not enough eligible words, expand the length limit
        if (eligibleWords.length < numWords) {
            console.warn(`Not enough words of length <= ${maxWordLength}. Expanding to grid size.`);
            const maxLen = Math.max(gridDims.rows, gridDims.cols);
            if (isEnglish) {
                eligibleWords = wordList.filter(word => word.length <= maxLen);
            } else {
                eligibleWords = wordList.filter(wordArr => wordArr.length <= maxLen);
            }
        }
        
        // Randomly select words from eligible list
        let attempts = 0;
        const maxSelectionAttempts = 1000;
        
        while (selected.length < numWords && attempts < maxSelectionAttempts && eligibleWords.length > 0) {
            attempts++;
            
            const randomIndex = Math.floor(Math.random() * eligibleWords.length);
            
            if (isEnglish) {
                const word = eligibleWords[randomIndex];
                if (!selected.includes(word)) {
                    selected.push(word);
                }
            } else {
                const wordArr = eligibleWords[randomIndex];
                const wordStr = wordArr.join('');
                if (!selected.includes(wordStr)) {
                    selected.push(wordStr);
                }
            }
        }
        
        console.log(`Selected ${selected.length} words for ${this.settings.difficulty} difficulty (max length: ${maxWordLength})`);
        
        this.currentWordSet = {
            words: selected,
            fillerChars: charList,
            language: this.settings.language
        };
    }

    generateGrid() {
        let allWordsPlaced = false;
        let regenerationAttempts = 0;
        const maxRegenerationAttempts = 20; // Increased from 10
        const gridDims = this.getGridDimensions();

        while (!allWordsPlaced && regenerationAttempts < maxRegenerationAttempts) {
            regenerationAttempts++;
            
            // Initialize empty grid with dynamic size
            this.grid = Array(gridDims.rows * gridDims.cols).fill('');
            this.wordPositions = {};
            
            // Directions: horizontal, vertical, diagonal
            const directions = [
                { dx: 1, dy: 0 },   // horizontal right
                { dx: 0, dy: 1 },   // vertical down
                { dx: 1, dy: 1 },   // diagonal down-right
                { dx: -1, dy: 1 },  // diagonal down-left
            ];

            let wordsPlacedCount = 0;

            // Try to place each word
            for (const word of this.currentWordSet.words) {
                const graphemes = getGraphemes(word, this.currentWordSet.language);
                let placed = false;
                let attempts = 0;
                const maxAttempts = 200; // Increased from 100

                while (!placed && attempts < maxAttempts) {
                    attempts++;
                    
                    // Random starting position and direction
                    const startRow = Math.floor(Math.random() * gridDims.rows);
                    const startCol = Math.floor(Math.random() * gridDims.cols);
                    const direction = directions[Math.floor(Math.random() * directions.length)];

                    // Check if word fits
                    if (this.canPlaceWord(graphemes, startRow, startCol, direction, gridDims)) {
                        this.placeWord(word, graphemes, startRow, startCol, direction, gridDims);
                        placed = true;
                        wordsPlacedCount++;
                    }
                }
                
                // Log if word couldn't be placed
                if (!placed) {
                    console.warn(`Failed to place word: "${word}" (${graphemes.length} chars) after ${maxAttempts} attempts`);
                }
            }

            // Check if all words were placed
            if (wordsPlacedCount === this.currentWordSet.words.length) {
                allWordsPlaced = true;
                console.log(`✓ Successfully placed all ${wordsPlacedCount} words in attempt ${regenerationAttempts}`);
            } else {
                console.log(`✗ Only placed ${wordsPlacedCount}/${this.currentWordSet.words.length} words in attempt ${regenerationAttempts}`);
            }
        }
        
        // Final validation
        if (!allWordsPlaced) {
            console.error(`WARNING: Could not place all words after ${maxRegenerationAttempts} attempts!`);
            console.error(`Placed: ${Object.keys(this.wordPositions).length}/${this.currentWordSet.words.length}`);
        }

        // Fill empty cells with random single characters
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] === '') {
                const randomChar = this.currentWordSet.fillerChars[
                    Math.floor(Math.random() * this.currentWordSet.fillerChars.length)
                ];
                this.grid[i] = randomChar;
            }
        }
    }

    canPlaceWord(graphemes, row, col, direction, gridDims) {
        for (let i = 0; i < graphemes.length; i++) {
            const newRow = row + (i * direction.dy);
            const newCol = col + (i * direction.dx);

            // Check bounds
            if (newRow < 0 || newRow >= gridDims.rows || 
                newCol < 0 || newCol >= gridDims.cols) {
                return false;
            }

            const index = newRow * gridDims.cols + newCol;
            
            // Check if cell is empty or has the same grapheme
            if (this.grid[index] !== '' && this.grid[index] !== graphemes[i]) {
                return false;
            }
        }
        return true;
    }

    placeWord(word, graphemes, row, col, direction, gridDims) {
        const positions = [];
        
        for (let i = 0; i < graphemes.length; i++) {
            const newRow = row + (i * direction.dy);
            const newCol = col + (i * direction.dx);
            const index = newRow * gridDims.cols + newCol;
            
            this.grid[index] = graphemes[i];
            positions.push(index);
        }
        
        this.wordPositions[word] = positions;
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        // Simulate leaderboard updates
        this.leaderboardData.currentUserScore = Math.floor(this.score / 10);
    }
}

// ===== DOM Elements =====
const elements = {
    timer: document.getElementById('timer'),
    currentRank: document.getElementById('currentRank'),
    bestScore: document.getElementById('bestScore'),
    scoreChange: document.getElementById('scoreChange'),
    congratsBanner: document.getElementById('congratsBanner'),
    coinsWon: document.getElementById('coinsWon'),
    currentUserScore: document.getElementById('currentUserScore'),
    wordGrid: document.getElementById('wordGrid'),
    wordGridContainer: document.querySelector('.word-grid-container'),
    wordConnections: document.getElementById('wordConnections'),
    patternDisplay: document.getElementById('patternDisplay'),
    wordList: document.getElementById('wordList'),
    newGameBtn: document.getElementById('newGameBtn'),
    hintBtn: document.getElementById('hintBtn'),
    gameOverModal: document.getElementById('gameOverModal'),
    closeGameOverBtn: document.getElementById('closeGameOverBtn'),
    coinsEarnedText: document.getElementById('coinsEarnedText'),
    modalCoinsText: document.getElementById('modalCoinsText'),
    modalCongratsPrefix: document.getElementById('modalCongratsPrefix'),
    modalCongratsText: document.getElementById('modalCongratsText'),
    modalMessage: document.getElementById('modalMessage'),
    playAgainText: document.getElementById('playAgainText'),
    modalYourScore: document.getElementById('modalYourScore'),
    modalBestScore: document.getElementById('modalBestScore'),
    yourScoreLabel: document.getElementById('yourScoreLabel'),
    bestScoreLabel: document.getElementById('bestScoreLabel'),
    finalScore: document.getElementById('finalScore'),
    wordsFound: document.getElementById('wordsFound'),
    totalWords: document.getElementById('totalWords'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    leftRank: document.getElementById('leftRank'),
    rightRank: document.getElementById('rightRank'),
    menuBtn: document.querySelector('.menu-btn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    settingsMenuItem: document.getElementById('settingsMenuItem'),
    soundMenuItem: document.getElementById('soundMenuItem'),
    backBtn: document.querySelector('.back-btn'),
    refreshMenuItem: document.getElementById('refreshMenuItem'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    soundToggle: document.getElementById('soundToggle'),
    vibrationToggle: document.getElementById('vibrationToggle'),
    themeOptions: document.querySelectorAll('.theme-option'),
    languageSelect: document.getElementById('languageSelect'),
    difficultySelect: document.getElementById('difficultySelect'),
    introScreen: document.getElementById('introScreen'),
    introStartBtn: document.getElementById('introStartBtn')
};

// ===== Game Instance =====
const game = new GameState();

// Vibrant color palette for found words
const VIBRANT_COLORS = [
    '#FF6B9D',  // Hot Pink
    '#4ECDC4',  // Turquoise
    '#FF8C42',  // Tangerine
    '#95E1D3',  // Mint
    '#C44569',  // Raspberry
    '#F38181',  // Coral
    '#AA96DA',  // Lavender
    '#FCBAD3',  // Light Pink
    '#FFFFD2',  // Cream Yellow
    '#A8E6CF',  // Seafoam
    '#FFD3B6',  // Peach
    '#FFAAA5',  // Salmon
    '#FF8B94',  // Rose
    '#A8D8EA',  // Sky Blue
    '#FCBAD3',  // Bubblegum
    '#DDA0DD',  // Plum
    '#87CEEB',  // Light Sky Blue
    '#98D8C8',  // Aquamarine
];

// Get a random color from the palette
function getRandomColor() {
    return VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
}

// ===== UI Functions =====
function updateTimer() {
    const minutes = Math.floor(game.timeRemaining / 60);
    const seconds = game.timeRemaining % 60;
    elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (game.timeRemaining >= CONFIG.TIMER_DURATION) {
        endGame();
    } else {
        game.timeRemaining++;
    }
}

function updateScore() {
    elements.currentRank.textContent = game.score;
    elements.bestScore.textContent = game.bestScore;
}

function showScorePopup(points) {
    // Show score change indicator
    elements.scoreChange.textContent = `+${points}`;
    elements.scoreChange.classList.add('show');
    
    setTimeout(() => {
        elements.scoreChange.classList.remove('show');
    }, 2000);
    
    // Show congratulations banner with actual points earned
    elements.coinsWon.textContent = points;
    elements.congratsBanner.classList.add('show');
    
    setTimeout(() => {
        elements.congratsBanner.classList.remove('show');
    }, 3000);
}

function updateLeaderboard() {
    elements.leftRank.textContent = game.leaderboardData.leftRank;
    elements.currentUserScore.textContent = game.leaderboardData.currentUserScore;
    elements.rightRank.textContent = game.leaderboardData.rightRank;
}

function renderGrid() {
    elements.wordGrid.innerHTML = '';
    
    // Set grid columns dynamically based on difficulty
    const gridDims = game.getGridDimensions();
    elements.wordGrid.style.gridTemplateColumns = `repeat(${gridDims.cols}, 1fr)`;
    
    game.grid.forEach((grapheme, index) => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = grapheme;
        cell.dataset.index = index;
        
        cell.addEventListener('mousedown', handleCellMouseDown);
        cell.addEventListener('mouseenter', handleCellMouseEnter);
        cell.addEventListener('mouseup', handleCellMouseUp);
        cell.addEventListener('touchstart', handleCellTouchStart);
        cell.addEventListener('touchmove', handleCellTouchMove);
        cell.addEventListener('touchend', handleCellTouchEnd);
        
        elements.wordGrid.appendChild(cell);
    });
}

// Helper function to adjust color brightness
function adjustColorBrightness(color, percent) {
    // Convert hex to RGB
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Draw connection line for found word
function drawConnectionLine(cellIndices, word, color) {
    if (!cellIndices || cellIndices.length < 2) return;
    
    // Store this found word for redrawing later
    game.foundWords.push({ cellIndices, word, color });
    
    // Draw the line
    redrawConnectionLine(cellIndices, color);
}

// Redraw a single connection line
function redrawConnectionLine(cellIndices, color, animate = true) {
    if (!cellIndices || cellIndices.length < 2) return;
    
    const cells = document.querySelectorAll('.grid-cell');
    const startCell = cells[cellIndices[0]];
    const endCell = cells[cellIndices[cellIndices.length - 1]];
    
    if (!startCell || !endCell) return;
    
    // Get bounding rectangles for accurate positioning (handles browser zoom)
    const containerRect = elements.wordGridContainer.getBoundingClientRect();
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();
    
    // Calculate center points relative to container
    const x1 = startRect.left - containerRect.left + startRect.width / 2;
    const y1 = startRect.top - containerRect.top + startRect.height / 2;
    const x2 = endRect.left - containerRect.left + endRect.width / 2;
    const y2 = endRect.top - containerRect.top + endRect.height / 2;
    
    // Create line element with rounded caps
    const svgNS = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '25');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.9');
    line.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
    
    // Add animation only on first draw
    if (animate) {
        line.style.animation = 'drawLine 0.5s ease-out';
    }
    
    elements.wordConnections.appendChild(line);
}

// Redraw all connection lines (called on resize and during selection)
function redrawAllConnectionLines() {
    // Clear existing lines
    elements.wordConnections.innerHTML = '';
    
    // Update SVG dimensions to match container
    const containerRect = elements.wordGridContainer.getBoundingClientRect();
    elements.wordConnections.setAttribute('width', containerRect.width);
    elements.wordConnections.setAttribute('height', containerRect.height);
    
    // Redraw all found words without animation
    game.foundWords.forEach(({ cellIndices, color }) => {
        redrawConnectionLine(cellIndices, color, false);
    });

    // Draw current selection line if dragging and has at least 2 cells
    if (game.selectedCells.length >= 2) {
        redrawConnectionLine(game.selectedCells, game.currentSelectionColor, false);
    }
}

// Clear all connection lines
function clearConnectionLines() {
    elements.wordConnections.innerHTML = '';
}

function renderWordList() {
    elements.wordList.innerHTML = '';
    
    const foundWordsList = game.foundWords.map(fw => fw.word);
    
    game.currentWordSet.words.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = `word-item ${foundWordsList.includes(word) ? 'found' : 'pending'}`;
        wordItem.textContent = word;
        elements.wordList.appendChild(wordItem);
    });
    
    updatePattern();
}

function updatePattern() {
    if (game.selectedCells.length > 0) {
        const pattern = game.selectedCells.map(index => game.grid[index]).join(' + ');
        elements.patternDisplay.textContent = pattern;
    } else {
        const t = UI_TRANSLATIONS[game.settings.language];
        elements.patternDisplay.textContent = t.wordListTitle;
    }
}

// ===== Cell Selection Handlers =====
let isMouseDown = false;

function handleCellMouseDown(e) {
    if (!game.isGameActive) return;
    
    // Unlock audio on iOS when user interacts with grid
    if (window.unlockAudio) window.unlockAudio();
    
    isMouseDown = true;
    game.selectedCells = [];
    game.currentWord = '';
    game.currentSelectionColor = getRandomColor(); // Pick a color for this selection
    
    // Update CSS variables for selection color
    const darkColor = adjustColorBrightness(game.currentSelectionColor, -20);
    document.documentElement.style.setProperty('--selection-color', game.currentSelectionColor);
    document.documentElement.style.setProperty('--selection-color-dark', darkColor);
    
    selectCell(parseInt(e.target.dataset.index));
}

function handleCellMouseEnter(e) {
    if (!game.isGameActive || !isMouseDown) return;
    
    selectCell(parseInt(e.target.dataset.index));
}

function handleCellMouseUp() {
    if (!game.isGameActive) return;
    
    isMouseDown = false;
    checkWord();
}

function handleCellTouchStart(e) {
    if (!game.isGameActive) return;
    
    // Unlock audio on iOS when user touches grid
    if (window.unlockAudio) window.unlockAudio();
    
    e.preventDefault();
    game.selectedCells = [];
    game.currentWord = '';
    game.currentSelectionColor = getRandomColor(); // Pick a color for this selection
    
    // Update CSS variables for selection color
    const darkColor = adjustColorBrightness(game.currentSelectionColor, -20);
    document.documentElement.style.setProperty('--selection-color', game.currentSelectionColor);
    document.documentElement.style.setProperty('--selection-color-dark', darkColor);
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-cell')) {
        selectCell(parseInt(element.dataset.index));
    }
}

function handleCellTouchMove(e) {
    if (!game.isGameActive) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-cell')) {
        selectCell(parseInt(element.dataset.index));
    }
}

function handleCellTouchEnd(e) {
    if (!game.isGameActive) return;
    
    e.preventDefault();
    checkWord();
}

function selectCell(index) {
    if (game.selectedCells.includes(index)) return;
    
    game.selectedCells.push(index);
    game.currentWord = game.selectedCells.map(i => game.grid[i]).join('');
    
    const cells = elements.wordGrid.querySelectorAll('.grid-cell');
    cells[index].classList.add('selected');
    
    updatePattern();
    redrawAllConnectionLines(); // Redraw lines to show selection
}

function checkWord() {
    const word = game.currentWord;
    const foundWordsList = game.foundWords.map(fw => fw.word);
    
    if (game.currentWordSet.words.includes(word) && !foundWordsList.includes(word)) {
        // Word found!
        // Calculate time-decay score: max(0, p - (t1 - t0))
        const currentTime = Date.now();
        const timeTaken = Math.floor((currentTime - game.currentWordStartTime) / 1000); // seconds
        const pointsEarned = Math.max(0, CONFIG.POINTS_PER_WORD - (timeTaken * CONFIG.TIME_PENALTY));
        
        game.addScore(pointsEarned);
        
        // Reset word start time for next word
        game.currentWordStartTime = Date.now();
        
        // Effects
        window.playSound('success');
        game.vibrate(100);
        
        // Use the current selection color for this word
        const wordColor = game.currentSelectionColor;
        game.wordColors[word] = wordColor;
        
        // Draw connection line with the same color (this also stores it in foundWords array)
        drawConnectionLine(game.selectedCells, word, wordColor);
        
        showScorePopup(pointsEarned);
        updateScore();
        renderWordList();
        
        // Mark cells as found with the word's color
        const cells = elements.wordGrid.querySelectorAll('.grid-cell');
        game.selectedCells.forEach(index => {
            cells[index].classList.remove('selected');
            cells[index].classList.add('found');
            // Apply the color as a custom background
            cells[index].style.background = `linear-gradient(135deg, ${wordColor} 0%, ${adjustColorBrightness(wordColor, -20)} 100%)`;
            cells[index].style.borderColor = adjustColorBrightness(wordColor, -30);
        });
        
        // Check if all words found
        if (game.foundWords.length === game.currentWordSet.words.length) {
            setTimeout(() => {
                endGame(true);
            }, 1000);
        }
        
        // Clear state after success
        game.selectedCells = [];
        game.currentWord = '';
    } else {
        // Word not found, clear selection
        window.playSound('wrong');
        game.vibrate([50, 50, 50]);
        game.selectedCells = []; // Clear cells first so line disappears
        game.currentWord = '';
        clearSelection();
    }
}

function clearSelection() {
    const cells = elements.wordGrid.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('selected');
    });
    updatePattern();
    redrawAllConnectionLines(); // Clear selection line
}

// ===== Game Control Functions =====
function startGame() {
    game.reset();
    updateScore();
    updateLeaderboard();
    renderGrid();
    renderWordList();
    clearConnectionLines();  // Clear previous connection lines

    // Reset modal state so coin section and message are fresh for the next game
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) modalTitle.style.display = 'none'; // Hidden until game ends
    if (elements.modalMessage) elements.modalMessage.style.display = '';
    const claimBtn = document.getElementById('claimCoinsBtn');
    if (claimBtn) {
        claimBtn.style.display = 'none';
        claimBtn.style.opacity = '';
        claimBtn.disabled = false;
        claimBtn.dataset.claimed = 'false';
        const btnText = document.getElementById('claimCoinsBtnText');
        if (btnText) btnText.textContent = '🪙 क्लेम करें';
    }


    // ── Debug overlay (only active when ?debug_test is in the URL) ────────────
    // Expose game state globally so the debug toolbar can access it
    window.game = game;
    if (window.gameConfig?.debug?.isActive) {
        // Small delay to ensure the grid cells are fully painted before overlaying
        setTimeout(() => window.gameConfig.debug.renderDebugOverlay(game), 50);
    }

    // Start timer
    if (game.timerInterval) {
        clearInterval(game.timerInterval);
    }
    game.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function endGame(allWordsFound = false) {
    game.isGameActive = false;

    if (game.timerInterval) {
        clearInterval(game.timerInterval);
    }

    if (allWordsFound) {
        window.playSound('complete');
        game.vibrate([100, 50, 100]);

        // Trigger celebration animations
        if (typeof triggerCelebration === 'function') {
            triggerCelebration();
        }
    }

    // ── Multi-level Reward Evaluation (backend logic in config.js) ────────────
    // Delegate entirely to the backend evaluateReward() function.
    // No threshold values or coin amounts live here — config.js owns them all.
    const difficulty   = game.settings.difficulty; // 'easy' | 'medium' | 'hard'
    const rewardResult = window.gameConfig
        ? window.gameConfig.evaluateReward(difficulty, game.score)
        : { eligible: false, coinsAwarded: 0, alreadyRewarded: false, message: 'Config not loaded' };

    const coinsEarned = rewardResult.coinsAwarded;

    // ── Step 1: Language update first ────────────────────────────────────────
    // Sets all modal labels, congrats text for the active language.
    // Does NOT set modalMessage — endGame controls that below.
    updateUILanguage(game.settings.language);

    // ── Step 2: Coin header ───────────────────────────────────────────────────
    // .modal-title  →  the "🪙 N coins के लिए बधाई!" banner at the top
    // Old game equivalent: #msg_with_coin
    if (elements.coinsEarnedText) {
        elements.coinsEarnedText.textContent = coinsEarned;
    }
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) {
        // Show coin banner ONLY when the user qualifies for coins
        modalTitle.style.display = rewardResult.eligible ? '' : 'none';
    }

    // ── Step 3: Message text ──────────────────────────────────────────────────
    // Old game equivalent: #msg_with_coin visible  → #msg_without_coin hidden
    //                      #msg_with_coin hidden   → #msg_without_coin visible
    if (elements.modalMessage) {
        if (rewardResult.eligible) {
            // Coin banner already says "बधाई!" — hide the plain message
            elements.modalMessage.style.display = 'none';
        } else if (rewardResult.alreadyRewarded) {
            elements.modalMessage.style.display = '';
            elements.modalMessage.textContent = game.settings.language === 'hindi'
                ? 'आज के लिए कॉइन्स पहले ही मिल चुके हैं। कल फिर खेलें!'
                : 'Coins already awarded today. Play again tomorrow!';
        } else {
            // Score below threshold — show "Good Effort"
            elements.modalMessage.style.display = '';
            elements.modalMessage.textContent =
                elements.modalMessage.dataset.defaultText ||
                (game.settings.language === 'hindi' ? 'अच्छा प्रयास!' : 'Good Effort!');
        }
    }

    // ── Step 4: Button visibility ─────────────────────────────────────────────
    //
    // Matching old game (shabdkhoj.blade.php lines 1238–1247) EXACTLY:
    //
    //  ┌──────────────────┬────────────────────────────────────────────────────┐
    //  │ playAgainBtn     │ ALWAYS visible  (= old game's #refresh_popup)      │
    //  │ claimCoinsBtn    │ Visible ONLY when client=app AND score≥threshold   │
    //  │                  │ (= old game's #claim button)                        │
    //  └──────────────────┴────────────────────────────────────────────────────┘

    // Play Again — ALWAYS shown so users can always restart
    if (elements.playAgainBtn) {
        elements.playAgainBtn.style.display = '';
    }

    // Claim button — config.js decides (app-only, score-threshold check)
    if (window.gameConfig) {
        window.gameConfig.prepareRewardModal(rewardResult);
    }

    // Update score displays
    if (elements.modalYourScore) elements.modalYourScore.textContent = game.score;
    if (elements.modalBestScore) elements.modalBestScore.textContent = game.bestScore;

    // Update optional elements if they exist
    if (elements.finalScore) elements.finalScore.textContent = game.score;
    if (elements.wordsFound) elements.wordsFound.textContent = game.foundWords.length;
    if (elements.totalWords) elements.totalWords.textContent = game.currentWordSet.words.length;

    // ── Analytics ─────────────────────────────────────────────────────────────

    // Track game completion (fires crossword_end event)
    if (window.gameTracking) {
        window.gameTracking.trackGameComplete(
            game.score,
            game.bestScore,
            game.foundWords.length,
            game.currentWordSet.words.length,
            game.timeRemaining,
            coinsEarned
        );
    }

    elements.gameOverModal.classList.add('show');
}

function giveHint() {
    if (!game.isGameActive) return;
    
    // Find an unfound word
    const foundWordsList = game.foundWords.map(fw => fw.word);
    const unfoundWords = game.currentWordSet.words.filter(word => !foundWordsList.includes(word));
    
    if (unfoundWords.length === 0) return;
    
    const hintWord = unfoundWords[0];
    
    // Get the positions of the hint word
    if (game.wordPositions[hintWord]) {
        const positions = game.wordPositions[hintWord];
        const cells = elements.wordGrid.querySelectorAll('.grid-cell');
        
        // Highlight the first letter
        const firstPos = positions[0];
        cells[firstPos].style.animation = 'pulse 1s ease 3';
        setTimeout(() => {
            cells[firstPos].style.animation = '';
        }, 3000);
    }
    
    // Deduct points for hint
    game.addScore(-CONFIG.HINT_PENALTY);
    updateScore();
    showScorePopup(-CONFIG.HINT_PENALTY);
}

// ===== Event Listeners =====
elements.newGameBtn.addEventListener('click', startGame);
elements.hintBtn.addEventListener('click', giveHint);

// ── crossword_close: fires ONLY when the ✕ button on the game-end modal is tapped ──
// Matches old game: closing the result popup = crossword_close
if (elements.closeGameOverBtn) {
    elements.closeGameOverBtn.addEventListener('click', () => {
        if (window.gameTracking) {
            window.gameTracking.trackModalClose('game_over'); // → ep.augame=crossword_close
        }
        elements.gameOverModal.classList.remove('show');
        startGame();
    });
}

// Play Again button — restarts the game, does NOT fire crossword_close
elements.playAgainBtn.addEventListener('click', () => {
    elements.gameOverModal.classList.remove('show');
    startGame();
});

// ── Claim Coins button — matches old game's #claim button ─────────────────────
// Only shown in-app when the user has earned coins.
// Sends the reward to the app and disables itself to prevent double-claim.
const claimCoinsBtn = document.getElementById('claimCoinsBtn');
if (claimCoinsBtn) {
    claimCoinsBtn.addEventListener('click', () => {
        // Prevent double-tapping
        if (claimCoinsBtn.dataset.claimed === 'true') return;
        claimCoinsBtn.dataset.claimed = 'true';
        claimCoinsBtn.disabled = true;

        const coins = parseInt(claimCoinsBtn.dataset.coins || '0', 10);

        // Send to app bridge (window.AuGame.gameEvent / ReactNativeWebView.postMessage)
        if (window.gameConfig) {
            window.gameConfig.sendClaimToApp(coins);
        }

        // Track in analytics
        if (window.gameTracking) {
            window.gameTracking.trackClaimCoins(coins);
        }

        // Visual feedback: update button text to confirm claim
        const btnText = document.getElementById('claimCoinsBtnText');
        if (btnText) btnText.textContent = '✅ क्लेम हो गया!';
        claimCoinsBtn.style.opacity = '0.6';

        console.log(`🪙 ${coins} coins claimed and sent to app.`);
    });
}

// ── crossword_exit: fires ONLY when the back (←) header button is tapped ─────
// Matches old game: pressing back to leave the game = crossword_exit
if (elements.backBtn) {
    elements.backBtn.addEventListener('click', () => {
        if (window.gameTracking) {
            window.gameTracking.trackBackButton('header'); // → ep.augame=crossword_exit
        }
        // Small delay so GTM can flush the dataLayer push before the page unloads
        setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            }
        }, 200);
    });
}

// Prevent text selection during drag
document.addEventListener('selectstart', (e) => {
    if (isMouseDown) {
        e.preventDefault();
    }
});

// Dropdown Menu Event Listeners
elements.menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.dropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!elements.dropdownMenu.contains(e.target) && !elements.menuBtn.contains(e.target)) {
        elements.dropdownMenu.classList.remove('show');
    }
});

// Settings menu item - opens settings modal
elements.settingsMenuItem.addEventListener('click', () => {
    elements.dropdownMenu.classList.remove('show');
    
    // Sync toggles with state
    elements.soundToggle.checked = game.settings.sound;
    elements.vibrationToggle.checked = game.settings.vibration;
    elements.languageSelect.value = game.settings.language;
    elements.difficultySelect.value = game.settings.difficulty;
    
    // Sync theme active class
    elements.themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === game.settings.theme);
    });
    
    elements.settingsModal.classList.add('show');
});

// Sound menu item - toggles sound on/off
elements.soundMenuItem.addEventListener('click', () => {
    game.settings.sound = !game.settings.sound;
    game.toggleSound(game.settings.sound);
    
    // Toggle between mute and unmute icons
    const soundOnIcon = elements.soundMenuItem.querySelector('.sound-on');
    const soundOffIcon = elements.soundMenuItem.querySelector('.sound-off');
    
    if (game.settings.sound) {
        soundOnIcon.style.display = 'block';
        soundOffIcon.style.display = 'none';
        elements.soundMenuItem.style.backgroundColor = '';
    } else {
        soundOnIcon.style.display = 'none';
        soundOffIcon.style.display = 'block';
        elements.soundMenuItem.style.backgroundColor = '#000';
    }
    
    // Play a sound to confirm if turning on
    if (game.settings.sound) {
        window.playSound('success');
    }
});

// Refresh menu item - starts a new game
elements.refreshMenuItem.addEventListener('click', () => {
    elements.dropdownMenu.classList.remove('show');
    startGame();
});

elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.remove('show');
});

elements.soundToggle.addEventListener('change', (e) => {
    game.toggleSound(e.target.checked);
});

elements.vibrationToggle.addEventListener('change', (e) => {
    game.toggleVibration(e.target.checked);
});

elements.themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        game.applyTheme(theme);
        
        // Update active state in UI
        elements.themeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

elements.languageSelect.addEventListener('change', (e) => {
    game.setLanguage(e.target.value);
    updateUILanguage(e.target.value);
    // Restart game with new language
    startGame();
});

elements.difficultySelect.addEventListener('change', (e) => {
    game.setDifficulty(e.target.value);
    // Restart game with new difficulty
    startGame();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
        elements.settingsModal.classList.remove('show');
    }
});

// Add resize event listener to redraw connection lines
let resizeTimeout;
window.addEventListener('resize', () => {
    // Debounce resize events to avoid excessive redraws
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (game.foundWords.length > 0) {
            redrawAllConnectionLines();
        }
    }, 100);
});

// ===== Initialize Game =====
window.addEventListener('load', () => {
    // Load initial theme and language from state
    game.applyTheme(game.settings.theme);
    updateUILanguage(game.settings.language);
    
    // Hide vibration toggle on iOS (not supported)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const vibrationSupported = 'vibrate' in navigator;
    
    if (isIOS || !vibrationSupported) {
        const vibrationToggleContainer = document.querySelector('#vibrationToggle')?.closest('.setting-item');
        if (vibrationToggleContainer) {
            vibrationToggleContainer.style.opacity = '0.5';
            vibrationToggleContainer.style.pointerEvents = 'none';
            const vibrationLabel = vibrationToggleContainer.querySelector('span');
            if (vibrationLabel) {
                vibrationLabel.textContent += ' (Not supported on this device)';
            }
        }
    }
    
    // Initialize sound button icons based on current state
    const soundOnIcon = elements.soundMenuItem.querySelector('.sound-on');
    const soundOffIcon = elements.soundMenuItem.querySelector('.sound-off');
    
    if (game.settings.sound) {
        soundOnIcon.style.display = 'block';
        soundOffIcon.style.display = 'none';
        elements.soundMenuItem.style.backgroundColor = '';
    } else {
        soundOnIcon.style.display = 'none';
        soundOffIcon.style.display = 'block';
        elements.soundMenuItem.style.backgroundColor = '#000';
    }
    
    // Don't auto-start game - wait for intro screen button
    // startGame();
});

// Intro screen start button
elements.introStartBtn.addEventListener('click', () => {
    // Unlock audio for iOS Safari (requires user interaction)
    if (window.unlockAudio) {
        window.unlockAudio();
    }
    
    elements.introScreen.classList.add('hidden');
    startGame();
});
