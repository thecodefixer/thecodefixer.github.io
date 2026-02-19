// ===== Game Configuration Variables =====
// This file contains configuration that would normally come from a backend.
// The multi-level scoring logic is implemented here so that NO frontend
// (UI/HTML) changes are required — the backend decides reward eligibility
// and the amount, then passes the final result to the app.

// ─────────────────────────────────────────────────────────────────────────────
// Client-type detection (web or app)
// The app passes ?in_app=app in the URL; web sessions omit it.
// ─────────────────────────────────────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const _request_client = urlParams.get("in_app") === "app" ? "app" : "web";

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Level Reward Configuration Table
// Source of truth for difficulty → threshold → coins mapping.
// In production this would come from the server (e.g. SHABDKHOJ_REWARD_CONFIG).
//
// Level   | Words | Max Score | Coin Threshold | Coins Awarded
// --------|-------|-----------|----------------|---------------
// Easy    |   5   |    300    |     > 200      |     10
// Medium  |   8   |    480    |     > 350      |     15
// Hard    |  10   |    600    |     > 500      |     20
// ─────────────────────────────────────────────────────────────────────────────
const REWARD_CONFIG = {
  easy: {
    words: 5,
    maxScore: 300,
    coinThreshold: 200, // score must be STRICTLY GREATER THAN this
    coinsAwarded: 10,
  },
  medium: {
    words: 8,
    maxScore: 480,
    coinThreshold: 350,
    coinsAwarded: 15,
  },
  hard: {
    words: 10,
    maxScore: 600,
    coinThreshold: 500,
    coinsAwarded: 20,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Encryption key (if needed for API calls)
// In production, this should come from your backend.
// ─────────────────────────────────────────────────────────────────────────────
const k = ""; // Leave empty if not using encryption

// ─────────────────────────────────────────────────────────────────────────────
// Hindi words database
// In the old game, this comes from the server.
// For now, this is handled by the existing word sets in script.js.
// ─────────────────────────────────────────────────────────────────────────────
const hindiWordsFromDB = []; // Not needed — using local word sets

// ─────────────────────────────────────────────────────────────────────────────
// Backend Reward Evaluation Function
// This function encapsulates ALL reward logic so the frontend never needs
// to know about thresholds or coin amounts — it just receives a result.
//
// Parameters:
//   difficulty  {string}  'easy' | 'medium' | 'hard'
//   finalScore  {number}  The player's final score for this session
//
// Returns:
//   {
//     eligible:     {boolean}  true if score meets the threshold
//     coinsAwarded: {number}   coins to issue (0 if not eligible)
//     alreadyRewarded: {boolean} true if the user already got coins today
//     message:      {string}   human-readable result for debugging
//   }
// ─────────────────────────────────────────────────────────────────────────────
function evaluateReward(difficulty, finalScore) {
  const config = REWARD_CONFIG[difficulty];

  if (!config) {
    console.warn("⚠️ Unknown difficulty level:", difficulty);
    return {
      eligible: false,
      coinsAwarded: 0,
      alreadyRewarded: false,
      message: "Unknown difficulty",
    };
  }

  // ── Once-per-day guard ────────────────────────────────────────────────────
  // Store the last reward date in localStorage (keyed by difficulty so each
  // level is tracked independently — a user can earn from Easy AND Hard on
  // the same day if they play both).
  const storageKey = `sk_reward_date_${difficulty}`;
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const lastRewardDate = localStorage.getItem(storageKey);

  if (lastRewardDate === today) {
    console.log(`🔒 Reward already issued today for difficulty: ${difficulty}`);
    return {
      eligible: false,
      coinsAwarded: 0,
      alreadyRewarded: true,
      message: `Coins already awarded today for ${difficulty} level.`,
    };
  }

  // ── Score threshold check ─────────────────────────────────────────────────
  const meetsThreshold = finalScore > config.coinThreshold;

  if (meetsThreshold) {
    // Record today's reward date so subsequent plays don't re-award
    localStorage.setItem(storageKey, today);

    console.log(
      `✅ Reward issued: ${config.coinsAwarded} coins for ${difficulty} (score ${finalScore} > ${config.coinThreshold})`,
    );
    return {
      eligible: true,
      coinsAwarded: config.coinsAwarded,
      alreadyRewarded: false,
      message: `Congratulations! You earned ${config.coinsAwarded} coins.`,
    };
  }

  console.log(
    `❌ No reward: score ${finalScore} did not exceed threshold ${config.coinThreshold} for ${difficulty}`,
  );
  return {
    eligible: false,
    coinsAwarded: 0,
    alreadyRewarded: false,
    message: `Score ${finalScore} did not meet the threshold of ${config.coinThreshold} for ${difficulty} level.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// App Communication Helper — OLD GAME EXACT FLOW
//
// FLOW (matches shabdkhoj.blade.php → shabdkhoj.min.js exactly):
//   1. Game ends → evaluateReward() checks score vs threshold
//   2. If eligible → “क्लेम करें” (Claim) button is shown in the modal
//   3. User TAPS the Claim button → sendClaimToApp() fires
//   4. App receives the event → backend credits coins to the logged-in user
//
// ⚠️  Coins are NEVER credited automatically — only on explicit Claim tap.
//      This prevents double-crediting if the user closes and reopens the modal.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * prepareRewardModal(rewardResult)
 * Called from endGame() immediately after the modal opens.
 * Shows or hides the Claim button based on eligibility.
 * Does NOT send anything to the app — waits for user tap.
 *
 * @param {Object} rewardResult  — return value of evaluateReward()
 */
function prepareRewardModal(rewardResult) {
    const claimBtn = document.getElementById('claimCoinsBtn');
    if (!claimBtn) return;

    if (_request_client === 'app' && rewardResult.eligible) {
        // ✔ User is inside the app AND score qualifies → show Claim button
        claimBtn.style.display = '';
        claimBtn.disabled = false;  // re-enable in case of previous click
        claimBtn.dataset.coins   = rewardResult.coinsAwarded;
        claimBtn.dataset.claimed = 'false';
    } else {
        // Web session, or score didn't qualify, or already rewarded today → hide
        claimBtn.style.display = 'none';
    }
}

/**
 * sendClaimToApp(coins)
 * Fired ONLY when the user explicitly taps the “क्लेम करें” button.
 * Sends the reward event to the Amar Ujala native app bridge.
 *
 * @param {number} coins  — number of coins to credit
 */
function sendClaimToApp(coins) {
    if (_request_client !== 'app') return;  // safety guard

    const payload = {
        action: 'issue_coins',
        coins: coins
    };

    console.log('💰 Sending coin claim to app:', payload);

    // Method 1: AuGame bridge (Amar Ujala Android / iOS app)
    if (window.AuGame && typeof window.AuGame.gameEvent === 'function') {
        window.AuGame.gameEvent(JSON.stringify(payload));
        console.log('✅ AuGame.gameEvent() called');
    }

    // Method 2: ReactNative WebView bridge (fallback)
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        console.log('✅ ReactNativeWebView.postMessage() called');
    }

    // Method 3: GTM dataLayer (analytics / server-side tag can catch this)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'shabdkhoj_coin_claimed',
        coins_claimed: coins
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Debug Mode  —  activated by adding  ?debug_test  to the URL
//
// When active it provides:
//   • Color-coded grid-cell highlights showing every hidden word's position
//   • Numbered badges on the first letter of each word
//   • A floating side-panel listing words, coordinates, direction & reward info
//   • A toolbar with: Reveal All | Hide Hints | Copy State | Close Debug
//
// Usage:
//   https://…/index.html?debug_test
//   https://…/index.html?in_app=app&debug_test          (works alongside in_app)
//
// Call  window.gameConfig.debug.renderDebugOverlay()  after each new game
// starts to refresh the overlay.  This is wired automatically in startGame().
// ─────────────────────────────────────────────────────────────────────────────
const DEBUG_MODE = urlParams.has('hints');

// Palette of distinct colours for up to 12 words
const DEBUG_WORD_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF',
    '#FF8B94', '#6C5CE7', '#FD79A8', '#00B894',
    '#FDCB6E', '#74B9FF', '#E17055', '#55EFC4'
];

/**
 * Injects (or refreshes) the debug overlay onto the rendered grid.
 * Must be called AFTER renderGrid() so the .grid-cell elements exist.
 *
 * @param {GameState} gameState  - the live `game` object from script.js
 */
function renderDebugOverlay(gameState) {
    if (!DEBUG_MODE) return;

    // ── Clean up any previous overlay ────────────────────────────────────────
    document.getElementById('dbg-panel')?.remove();
    document.getElementById('dbg-toolbar')?.remove();
    document.getElementById('dbg-badge-style')?.remove();

    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(c => {
        c.removeAttribute('data-dbg-word');
        c.style.removeProperty('--dbg-color');
        c.classList.remove('dbg-word-cell', 'dbg-word-start');
        const badge = c.querySelector('.dbg-badge');
        if (badge) badge.remove();
    });

    if (!gameState || !gameState.currentWordSet) return;

    const gridDims = gameState.getGridDimensions();
    const words    = gameState.currentWordSet.words;
    const wordPos  = gameState.wordPositions;   // { word: [idx, idx, …] }
    const diff     = gameState.settings.difficulty;
    const reward   = REWARD_CONFIG[diff];

    // ── Inject CSS for cell highlights ───────────────────────────────────────
    const style = document.createElement('style');
    style.id = 'dbg-badge-style';
    style.textContent = `
        .dbg-word-cell {
            outline: 3px solid var(--dbg-color) !important;
            outline-offset: -3px;
            background: color-mix(in srgb, var(--dbg-color) 22%, transparent) !important;
            position: relative;
        }
        .dbg-word-start {
            outline-width: 4px !important;
        }
        .dbg-badge {
            position: absolute;
            top: 1px;
            left: 2px;
            font-size: 9px;
            font-weight: 900;
            line-height: 1;
            color: #fff;
            background: var(--dbg-color);
            border-radius: 3px;
            padding: 1px 3px;
            pointer-events: none;
            z-index: 10;
            font-family: monospace;
        }
        #dbg-panel {
            position: fixed;
            top: 60px;
            right: 0;
            width: 260px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            background: rgba(10,10,20,0.96);
            color: #e0e0e0;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            border-left: 3px solid #6C5CE7;
            border-radius: 8px 0 0 8px;
            padding: 10px;
            z-index: 99999;
            box-shadow: -4px 0 20px rgba(0,0,0,0.5);
        }
        #dbg-panel h3 {
            margin: 0 0 8px;
            font-size: 13px;
            color: #6C5CE7;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        #dbg-panel .dbg-section {
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        #dbg-panel .dbg-word-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 3px 0;
            padding: 3px 5px;
            border-radius: 4px;
            background: rgba(255,255,255,0.04);
        }
        #dbg-panel .dbg-swatch {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            flex-shrink: 0;
        }
        #dbg-panel .dbg-word-name {
            flex: 1;
            font-weight: bold;
            color: #fff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        #dbg-panel .dbg-coords {
            color: #aaa;
            font-size: 10px;
        }
        #dbg-panel .dbg-kv {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
        }
        #dbg-panel .dbg-kv span:first-child { color: #aaa; }
        #dbg-panel .dbg-kv span:last-child  { color: #FFE66D; font-weight: bold; }
        #dbg-toolbar {
            position: fixed;
            bottom: 10px;
            right: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 99999;
            padding: 8px;
            background: rgba(10,10,20,0.92);
            border-left: 3px solid #6C5CE7;
            border-radius: 8px 0 0 8px;
        }
        .dbg-btn {
            padding: 6px 10px;
            font-size: 11px;
            font-family: monospace;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            white-space: nowrap;
            width: 100%;
            text-align: left;
        }
        .dbg-btn-reveal  { background:#00B894; color:#000; }
        .dbg-btn-hide    { background:#636e72; color:#fff; }
        .dbg-btn-copy    { background:#0984e3; color:#fff; }
        .dbg-btn-close   { background:#d63031; color:#fff; }
        .dbg-btn:hover   { opacity: 0.85; }
        /* Tiny DEBUG badge in top-left corner of viewport */
        #dbg-watermark {
            position: fixed;
            top: 4px;
            left: 50%;
            transform: translateX(-50%);
            background: #d63031;
            color: #fff;
            font-size: 10px;
            font-weight: 900;
            font-family: monospace;
            padding: 2px 8px;
            border-radius: 0 0 6px 6px;
            z-index: 99999;
            letter-spacing: 2px;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // ── Watermark banner ──────────────────────────────────────────────────────
    let wm = document.getElementById('dbg-watermark');
    if (!wm) {
        wm = document.createElement('div');
        wm.id = 'dbg-watermark';
        wm.textContent = '🐛 DEBUG MODE';
        document.body.appendChild(wm);
    }

    // ── Highlight cells for each word ─────────────────────────────────────────
    const wordMeta = []; // collect for the panel

    words.forEach((word, wi) => {
        const positions = wordPos[word];
        if (!positions || positions.length === 0) return;

        const color = DEBUG_WORD_COLORS[wi % DEBUG_WORD_COLORS.length];

        // Determine direction from first two positions
        let direction = '?';
        if (positions.length >= 2) {
            const diff0 = positions[1] - positions[0];
            const cols   = gridDims.cols;
            if      (diff0 === 1)         direction = '→ R';
            else if (diff0 === -1)        direction = '← L';
            else if (diff0 === cols)      direction = '↓ D';
            else if (diff0 === -cols)     direction = '↑ U';
            else if (diff0 === cols + 1)  direction = '↘ DR';
            else if (diff0 === cols - 1)  direction = '↙ DL';
            else if (diff0 === -(cols-1)) direction = '↗ UR';
            else if (diff0 === -(cols+1)) direction = '↖ UL';
        }

        // Row/col of start cell
        const startIdx = positions[0];
        const startRow = Math.floor(startIdx / gridDims.cols);
        const startCol = startIdx % gridDims.cols;

        wordMeta.push({ word, color, positions, direction, startRow, startCol, wi });

        positions.forEach((cellIdx, pi) => {
            const cell = cells[cellIdx];
            if (!cell) return;

            cell.style.setProperty('--dbg-color', color);
            cell.classList.add('dbg-word-cell');
            if (pi === 0) cell.classList.add('dbg-word-start');

            // Badge on the first letter only
            if (pi === 0) {
                const badge = document.createElement('span');
                badge.className = 'dbg-badge';
                badge.textContent = wi + 1;
                cell.appendChild(badge);
            }
        });
    });

    // ── Side panel ────────────────────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.id = 'dbg-panel';

    // Header
    panel.innerHTML = `<h3>🐛 Debug Panel</h3>`;

    // Game info section
    const infoSection = document.createElement('div');
    infoSection.className = 'dbg-section';
    infoSection.innerHTML = `
        <div class="dbg-kv"><span>Difficulty</span><span>${diff.toUpperCase()}</span></div>
        <div class="dbg-kv"><span>Grid</span><span>${gridDims.rows}×${gridDims.cols}</span></div>
        <div class="dbg-kv"><span>Words</span><span>${words.length}</span></div>
        <div class="dbg-kv"><span>Language</span><span>${gameState.currentWordSet.language}</span></div>
        <div class="dbg-kv"><span>Client</span><span>${_request_client}</span></div>
    `;
    panel.appendChild(infoSection);

    // Reward config section
    const rewardSection = document.createElement('div');
    rewardSection.className = 'dbg-section';
    rewardSection.innerHTML = `
        <div style="color:#6C5CE7;font-weight:bold;margin-bottom:4px;">⭐ Reward Config</div>
        <div class="dbg-kv"><span>Threshold</span><span>&gt; ${reward.coinThreshold}</span></div>
        <div class="dbg-kv"><span>Coins if won</span><span>${reward.coinsAwarded} 🪙</span></div>
        <div class="dbg-kv"><span>Max Score</span><span>${reward.maxScore}</span></div>
        <div class="dbg-kv"><span>Current Score</span><span id="dbg-live-score">${gameState.score}</span></div>
        <div class="dbg-kv"><span>Eligible?</span><span id="dbg-live-eligible">${gameState.score > reward.coinThreshold ? '✅ YES' : '❌ NO'}</span></div>
    `;
    panel.appendChild(rewardSection);

    // Word list section
    const wordSection = document.createElement('div');
    wordSection.className = 'dbg-section';
    wordSection.innerHTML = `<div style="color:#6C5CE7;font-weight:bold;margin-bottom:4px;">📍 Word Positions</div>`;

    wordMeta.forEach(({ word, color, positions, direction, startRow, startCol, wi }) => {
        const row = document.createElement('div');
        row.className = 'dbg-word-row';
        row.innerHTML = `
            <div class="dbg-swatch" style="background:${color}"></div>
            <span style="color:#aaa;font-size:10px;min-width:14px;">${wi + 1}.</span>
            <span class="dbg-word-name" title="${word}">${word}</span>
            <span class="dbg-coords">[${startRow},${startCol}] ${direction}</span>
        `;
        wordSection.appendChild(row);
    });
    panel.appendChild(wordSection);

    // All-difficulty reward table
    const tableSection = document.createElement('div');
    tableSection.innerHTML = `<div style="color:#6C5CE7;font-weight:bold;margin-bottom:4px;">📊 All Levels</div>`;
    Object.entries(REWARD_CONFIG).forEach(([lvl, cfg]) => {
        const active = lvl === diff;
        tableSection.innerHTML += `
            <div class="dbg-kv" style="${active ? 'color:#FFE66D' : ''}">
                <span>${active ? '▶ ' : '  '}${lvl.toUpperCase()}</span>
                <span>&gt;${cfg.coinThreshold} → ${cfg.coinsAwarded}🪙</span>
            </div>`;
    });
    panel.appendChild(tableSection);

    document.body.appendChild(panel);

    // ── Toolbar ───────────────────────────────────────────────────────────────
    const toolbar = document.createElement('div');
    toolbar.id = 'dbg-toolbar';

    // Reveal All — auto-finds every word
    const btnReveal = document.createElement('button');
    btnReveal.className = 'dbg-btn dbg-btn-reveal';
    btnReveal.textContent = '👁 Reveal All Words';
    btnReveal.title = 'Auto-complete all unfound words (for testing end-game flow)';
    btnReveal.addEventListener('click', () => {
        if (!window.game || !window.game.isGameActive) return;
        const foundList = window.game.foundWords.map(fw => fw.word);
        window.game.currentWordSet.words.forEach(word => {
            if (foundList.includes(word)) return;
            const positions = window.game.wordPositions[word];
            if (!positions) return;
            // Simulate a successful find
            window.game.selectedCells = positions;
            window.game.currentWord   = word;
            window.game.currentSelectionColor = DEBUG_WORD_COLORS[
                window.game.currentWordSet.words.indexOf(word) % DEBUG_WORD_COLORS.length
            ];
            if (typeof checkWord === 'function') checkWord();
        });
    });
    toolbar.appendChild(btnReveal);

    // Toggle hint highlights
    let hintsVisible = true;
    const btnHide = document.createElement('button');
    btnHide.className = 'dbg-btn dbg-btn-hide';
    btnHide.textContent = '🙈 Hide Hints';
    btnHide.addEventListener('click', () => {
        hintsVisible = !hintsVisible;
        document.querySelectorAll('.dbg-word-cell').forEach(c => {
            c.style.opacity = hintsVisible ? '' : '1';
            c.style.outline = hintsVisible ? '' : 'none';
            c.style.background = hintsVisible ? '' : '';
        });
        document.querySelectorAll('.dbg-badge').forEach(b => {
            b.style.display = hintsVisible ? '' : 'none';
        });
        btnHide.textContent = hintsVisible ? '🙈 Hide Hints' : '👁 Show Hints';
    });
    toolbar.appendChild(btnHide);

    // Copy game state to clipboard
    const btnCopy = document.createElement('button');
    btnCopy.className = 'dbg-btn dbg-btn-copy';
    btnCopy.textContent = '📋 Copy State';
    btnCopy.title = 'Copy full game state JSON to clipboard';
    btnCopy.addEventListener('click', () => {
        const state = {
            difficulty: diff,
            language: gameState.currentWordSet.language,
            grid: { rows: gridDims.rows, cols: gridDims.cols },
            score: gameState.score,
            words: wordMeta.map(m => ({
                word: m.word,
                startRow: m.startRow,
                startCol: m.startCol,
                direction: m.direction,
                positions: m.positions
            })),
            rewardConfig: reward,
            timestamp: new Date().toISOString()
        };
        navigator.clipboard.writeText(JSON.stringify(state, null, 2))
            .then(() => { btnCopy.textContent = '✅ Copied!'; setTimeout(() => { btnCopy.textContent = '📋 Copy State'; }, 2000); })
            .catch(() => { btnCopy.textContent = '❌ Failed'; setTimeout(() => { btnCopy.textContent = '📋 Copy State'; }, 2000); });
    });
    toolbar.appendChild(btnCopy);

    // Close debug (remove overlay without reloading)
    const btnClose = document.createElement('button');
    btnClose.className = 'dbg-btn dbg-btn-close';
    btnClose.textContent = '✕ Close Debug';
    btnClose.addEventListener('click', () => {
        document.getElementById('dbg-panel')?.remove();
        document.getElementById('dbg-toolbar')?.remove();
        document.getElementById('dbg-watermark')?.remove();
        document.getElementById('dbg-badge-style')?.remove();
        document.querySelectorAll('.grid-cell').forEach(c => {
            c.classList.remove('dbg-word-cell', 'dbg-word-start');
            c.style.removeProperty('--dbg-color');
            c.querySelector('.dbg-badge')?.remove();
        });
    });
    toolbar.appendChild(btnClose);

    document.body.appendChild(toolbar);

    // ── Live score updater (polls every 500ms while game is active) ───────────
    const liveScoreEl   = document.getElementById('dbg-live-score');
    const liveEligibleEl = document.getElementById('dbg-live-eligible');
    const scorePoller = setInterval(() => {
        if (!document.getElementById('dbg-panel')) { clearInterval(scorePoller); return; }
        if (!window.game) return;
        const s = window.game.score;
        if (liveScoreEl)    liveScoreEl.textContent   = s;
        if (liveEligibleEl) liveEligibleEl.textContent = s > reward.coinThreshold ? '✅ YES' : '❌ NO';
    }, 500);

    console.log('🐛 Debug overlay rendered. Words:', wordMeta.map(m => `${m.wi+1}. ${m.word} [${m.startRow},${m.startCol}] ${m.direction}`));
}

// ─────────────────────────────────────────────────────────────────────────────
// Export for use in other files
// ─────────────────────────────────────────────────────────────────────────────
window.gameConfig = {
    requestClient: _request_client,
    rewardConfig: REWARD_CONFIG,
    encryptionKey: k,
    hindiWords: hindiWordsFromDB,
    evaluateReward,
    prepareRewardModal,
    sendClaimToApp,
    debug: {
        isActive: DEBUG_MODE,
        renderDebugOverlay
    }
};

console.log('🔧 Game config loaded:', {
    client: _request_client,
    rewardConfig: REWARD_CONFIG,
    debugMode: DEBUG_MODE
});

if (DEBUG_MODE) {
    console.warn('🐛 DEBUG MODE ACTIVE — add ?debug_test to URL to enable');
    console.info('📌 Tip: window.gameConfig.debug.renderDebugOverlay(game) to refresh overlay');
}
