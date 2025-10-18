/* ReadSMART — Enhanced Student Script (Modernized UI & Features) */

(() => {
  // ------------------- ELEMENTS -------------------
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const resetForm = document.getElementById('reset-form');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const forgotLink = document.getElementById('forgot-link');
  const resetCancel = document.getElementById('reset-cancel');
  const authCard = document.getElementById('auth-card');
  const homepage = document.getElementById('homepage');
  const welcomeText = document.getElementById('welcome-text');
  const foldersEl = document.getElementById('folders');
  
  // NEW ELEMENTS for the unified dashboard view
  const folderView = document.getElementById('folder-view');
  const contentDetailView = document.getElementById('content-detail-view');
  const contentTitleHeader = document.getElementById('content-title-header');
  const backToFoldersBtn = document.getElementById('back-to-folders');
  // Content area now refers to the INNER div for content injection
  const contentArea = document.getElementById('content-area-inner'); 

  const hamburger = document.getElementById('hamburger');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const menuLogout = document.getElementById('menu-logout');
  const menuProfileBtn = document.getElementById('menu-profile');
  const menuAboutBtn = document.getElementById('menu-about');
  const profileTemplate = document.getElementById('profile-template');
  const aboutModal = document.getElementById('about-modal');

  // New Feature Elements
  const catchyModal = document.getElementById('catchy-modal');
  const catchyText = document.getElementById('catchy-text');
  const catchyCloseBtn = document.getElementById('catchy-close-btn');

  let currentUser = null;
  let currentPassage = null; // Tracks the passage currently being viewed/quizzed

  // ------------------- UTILITIES -------------------

  // Folder Transition Animation - MODIFIED to switch views and set title
  function transitionContent(callback, title) {
    // Hide the folder view and show the content detail view
    folderView.style.display = 'none';
    contentDetailView.style.display = 'block';
    contentTitleHeader.textContent = title || ''; // Set the new title
    
    // Animation logic (now targets contentArea-inner)
    contentArea.classList.remove('animate-in');
    // Force reflow to restart animation
    void contentArea.offsetWidth; 
    
    setTimeout(() => {
        // Clear old content and call the function to inject new content
        contentArea.innerHTML = '';
        callback();
        // Animate the new content in
        contentArea.classList.add('animate-in');
    }, 100); 
  }

  // Capitalize utility
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Storage helpers (kept from original)
  function saveRecord(username, title, level, score, total) {
    const all = JSON.parse(localStorage.getItem('quizRecords') || '{}');
    if (!all[username]) all[username] = [];
    all[username].push({ date: new Date().toLocaleString(), title, level, score, total });
    localStorage.setItem('quizRecords', JSON.stringify(all));
  }
  
  function loadRecordsIntoTable(username) {
    // ... existing loadRecordsIntoTable logic ...
    const tableBody = document.querySelector('.profile-table tbody'); // Corrected selector
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const all = JSON.parse(localStorage.getItem('quizRecords') || '{}');
    const list = all[username] || [];
    if (list.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No records yet.</td></tr>';
      return;
    }
    list.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.date}</td><td>${r.title}</td><td>${r.level}</td><td>${r.score}</td><td>${r.total}</td>`;
      tableBody.appendChild(tr);
    });
  }

  // ------------------- PASSAGES & QUIZ DATA (Kept from original) -------------------
  // The 'passages' object is assumed to be fully defined here as per the fetched content.
  const passages = { /* ... (literal, inferential, critical data here) ... */
    literal: [
      {
        title: 'The Morning Routine',
        text: 'Liza rushed out of bed when the alarm rang at 6:15 a.m. She brushed her teeth quickly and grabbed a slice of toast before heading to school. On the way, she stopped to watch a group of birds perched on a nearby tree. At school, she unpacked her books and prepared for her favorite class, Science. Today, her teacher asked the students to design a simple experiment, a volcanic reaction, using vinegar and baking soda. Liza carefully mixed the ingredients and observed the fizzing reaction. During lunch, she and her friend Sarah compared notes about their experiments. In the afternoon, they had English class and read a short story about planets. After school, Liza walked home with her brother Paolo and talked about the experiment. At home, she completed her homework and wrote a reflection about what she learned. She felt proud that her experiment worked perfectly. Liza spent the evening reading a chapter from her favorite science book. Before bedtime, she packed her bag for the next day. She set her alarm and went to sleep, excited for tomorrow’s class.',
        level: 'literal',
        questions: [
          { q: 'What experiment did Liza do in Science class?', options: ['Plant growth','Volcano reaction','Egg in saltwater','Magnet test'], answer: 'Volcano reaction'},
          { q: 'Who did Liza compare notes with at lunch', options: ['Paolo','Sarah','Her teacher','Her sister'], answer: 'Sarah'},
          { q: 'What subject did she have in the afternoon?', options: ['Math','Science','English','History'], answer: 'English'},
          { q: 'How did Liza feel about her experiment?', options: ['Proud','Angry','Sad','Confused'], answer: 'Proud'},
          { q: 'What did she do before going to bed?', options: ['Play games','Pack her bag','Eat dinner','Watch TV'], answer: 'Pack her bag'}
        ]
      },
      // ... (other literal passages) ...
    ],
    inferential: [
      {
        title: 'The Lunchbox Sandwich',
        text: 'Marcus opened his lunchbox to find a peanut butter and jelly sandwich, cut diagonally, just the way he liked it. On the napkin beneath it, his mother had drawn a small, smiling sun. He didn’t notice the sun at first, but when he took a bite, he remembered she had an important job interview today. He knew she was nervous because she had woken up extra early to practice her answers. Marcus finished his sandwich quickly, feeling a little less worried about her. Later that day, she texted him an emoji of a thumbs-up. He smiled. Though they hadn’t talked all day, the sandwich and the little sun had already told him a lot.',
        level: 'inferential',
        questions: [
          { q: "What does the diagonal cut suggest about Marcus's mother?", keywords: ["care","love","detail"] },
          { q: "What can you infer about the mother's feelings that morning?", keywords: ["nervous","focused","worried"] },
          { q: "Why did the small drawing likely make Marcus feel better?", keywords: ["connection","support","comfort"] },
          { q: "How does the passage show that small actions can lead to larger outcomes?", keywords: ["sandwich","connection","care"] }
        ]
      },
      // ... (other inferential passages) ...
    ],
    critical: [
      {
        title: "The Volunteer Project",
        text: 'Sophia signed up to volunteer at a local shelter during summer because she wanted to help and to learn new skills. The first days were overwhelming: piles of donations to sort, worried animals to soothe, and logistics to coordinate. More experienced volunteers taught her efficient ways to receive and catalog items, set up feeding schedules, and handle nervous animals safely. Sophia noticed that small organizational changes—like labeling storage boxes and creating a simple checklist—saved time and reduced mistakes. She also learned to communicate clearly with the team and to accept guidance without feeling discouraged. Over the month she ran a small drive to gather blankets and organized a plan to rotate volunteers so no one burned out. The shelter staff remarked that these consistent practices improved the facility’s daily life and animal welfare. Through reflection, Sophia realized volunteering involved more than hands-on tasks: it required systems thinking, humility, and empathy. She also discovered leadership meant supporting others, listening, and improving processes rather than seeking praise. Her experiences pushed her to plan a small fundraising campaign to help with medical expenses, and she used basic budgeting and promotion skills she learned from teachers. In the end, Sophia felt that volunteering taught her about responsibility, consistency, and community impact more than she expected; it changed how she viewed problem-solving and service in everyday life.',
        level: 'critical',
        questions: [
          { q: "How did Sophia’s small organizational changes affect the shelter’s work, and why does that matter?", keywords: ["efficiency","labeling","time saved"] },
          { q: "What leadership qualities did Sophia develop and how did they show in her actions?", keywords: ["humility","listen","organize"] },
          { q: "Why is consistency important in volunteering according to the passage?", keywords: ["trust","routine","results"] },
          { q: "How could Sophia’s fundraising plan demonstrate problem-solving skills?", keywords: ["budget","promote","plan"] },
          { q: "What larger conclusion can be drawn about the value of community service?", keywords: ["impact","empathy","responsibility"] }
        ]
      },
      // ... (other critical passages) ...
    ]
  };

  // The scoring function (Kept from original, needed for critical/inferential)
  function scoreInferentialOrCritical(answer, keywords) {
    const text = answer.toLowerCase();
    const words = answer.trim().split(/\s+/).filter(Boolean);

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return words.length >= 8 ? 3 : 0; // teacher review
    }

    const kws = keywords.map(k => ('' + k).toLowerCase());
    const primaryCount = Math.min(2, kws.length);
    const primary = kws.slice(0, primaryCount);
    const related = kws.slice(primaryCount);

    let primaryMatches = primary.filter(pk => text.includes(pk)).length;
    let relatedMatches = related.filter(rk => text.includes(rk)).length;

    const isSentence = words.length > 1 && /[.?!]$/.test(answer.trim());

    if (words.length === 1 && kws.includes(words[0])) return 1;

    if (isSentence) {
      if (primaryMatches === primary.length) return 5;
      if (primaryMatches > 0 || relatedMatches > 0) return 4;
      return 3;
    }
    return 0;
  }

  // ------------------- NEW FEATURE: CATCHY LINES -------------------
  const catchyLines = [
    "Your mind is a muscle. Read a little, grow a lot!",
    "Every book is a door to a new adventure. Open yours!",
    "Reading is not just about words; it's about worlds.",
    "The more you read, the faster you get. Let's level up!",
    "Today's reader is tomorrow's leader. Ready to lead?",
    "A passage a day keeps the dullness away. Dive in!",
    "You are one sentence away from an amazing idea. Find it!",
    "Silence the doubts, open the book. Success awaits.",
  ];

  function showCatchyLine() {
    const randomIndex = Math.floor(Math.random() * catchyLines.length);
    catchyText.textContent = catchyLines[randomIndex];
    catchyModal.classList.add('active');
  }

  // Show the modal right away before the user logs in
  showCatchyLine();
  catchyCloseBtn.addEventListener('click', () => {
    catchyModal.classList.remove('active');
    catchyModal.setAttribute('aria-hidden', 'true');
  });

  // ------------------- NEW FOLDERS IMPLEMENTATION -------------------
  function setupFolders() {
    // Clear existing folders (only done once after login if needed)
    foldersEl.innerHTML = ''; 

    const levels = ['literal', 'inferential', 'critical'];
    const levelNames = {
      literal: '🎯 Literal',
      inferential: '🔍 Inferential',
      critical: '💡 Critical'
    };

    // 1. Core Levels (Existing)
    levels.forEach(level => {
      const folder = document.createElement('div');
      folder.className = 'folder';
      folder.dataset.level = level;
      folder.innerHTML = `<i class="fas fa-file-alt"></i>${levelNames[level]}`;
      folder.addEventListener('click', () => showPassageList(level));
      foldersEl.appendChild(folder);
    });

    // 2. New Folders (Requested)
    const newFolders = [
      { id: 'dictionary', name: '📖 Dictionary', icon: 'fas fa-book-open', func: showDictionary },
      { id: 'library', name: '📚 Library', icon: 'fas fa-book-reader', func: showLibrary },
      // NEW FOLDER
      { id: 'encyclopedia', name: '🌍 Encyclopedia', icon: 'fas fa-globe-americas', func: showEncyclopedia },
      { id: 'journal', name: '📝 Journal', icon: 'fas fa-feather-alt', func: showJournal },
      { id: 'games', name: '🕹️ Games', icon: 'fas fa-gamepad', func: showGames },
      { id: 'tips', name: '✨ Tips', icon: 'fas fa-lightbulb', func: showTips },
      { id: 'videos', name: '📺 Videos', icon: 'fas fa-video', func: showVideos }
    ];

    newFolders.forEach(item => {
      const folder = document.createElement('div');
      folder.className = 'folder';
      folder.id = `${item.id}-folder`;
      folder.dataset.level = item.id;
      folder.innerHTML = `<i class="${item.icon}"></i>${item.name}`;
      folder.addEventListener('click', item.func);
      foldersEl.appendChild(folder);
    });
  }
  
  // Get the new buttons by the IDs you set in index.html
const profileBtn = document.getElementById('utility-profile-btn');
const aboutBtn = document.getElementById('utility-about-btn');
const logoutBtn = document.getElementById('utility-logout-btn');

// Attach the existing functions to the new buttons
if (profileBtn) {
    profileBtn.addEventListener('click', showProfile);
}

  // ------------------- NEW FOLDER LOGIC (Title added to transitionContent calls) -------------------

  // Dictionary Folder - MODIFIED to use Merriam-Webster
  function showDictionary() {
    transitionContent(() => {
        const template = document.getElementById('dictionary-template');
        contentArea.innerHTML = '';
        contentArea.appendChild(template.content.cloneNode(true));
        
        const searchBtn = contentArea.querySelector('#dictionary-search-btn');
        const input = contentArea.querySelector('#dictionary-input');
        const iframe = contentArea.querySelector('#dictionary-iframe');
        
        // Reset placeholder text and iframe source
        contentArea.querySelector('.muted-text').textContent = 'Search a word to see its definition from Merriam-Webster here.';
        iframe.src = 'https://www.merriam-webster.com/'; // Default Merriam-Webster homepage
        
        searchBtn.addEventListener('click', () => {
            const word = input.value.trim();
            if (word) {
                // Using Merriam-Webster search URL
                iframe.src = `https://www.merriam-webster.com/dictionary/${word}`;
            }
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBtn.click();
            }
        });
    }, '📖 ReadSMART Dictionary'); // <-- New Title Argument
  }

  // Library Folder - MODIFIED to use Internet Archive
  function showLibrary() {
    transitionContent(() => {
        let html = `
            <div class="feature-card library-card">
              <h3 class="feature-title"><i class="fas fa-book-reader"></i> The ReadSMART Library</h3>
              <p>Explore millions of free books, movies, software, music, and more from the <a href="https://archive.org/details/texts" target="_blank" style="color: var(--primary); font-weight: 600;">Internet Archive (Archive.org)</a>.</p>
              <iframe src="https://archive.org/details/texts" style="width:100%; height:600px; border:1px solid var(--border-color); margin-top:15px; border-radius:8px; background:white;"></iframe>
            </div>
        `;
        contentArea.innerHTML = html;
        // Note: Removed the template in favor of direct HTML embedding for the iframe
    }, '📚 The ReadSMART Library'); // <-- New Title Argument
  }

  // Journal Folder (Save/Load Reflection Entries)
  function showJournal() {
    transitionContent(() => {
        const template = document.getElementById('journal-template');
        contentArea.innerHTML = '';
        contentArea.appendChild(template.content.cloneNode(true));

        const saveBtn = contentArea.querySelector('#journal-save-btn');
        const titleInput = contentArea.querySelector('#journal-title');
        const textInput = contentArea.querySelector('#journal-text');
        const journalListEl = contentArea.querySelector('#journal-list');

        loadJournalEntries(journalListEl);

        saveBtn.addEventListener('click', () => {
            const title = titleInput.value.trim();
            const text = textInput.value.trim();

            if (!title || !text) {
                alert('Please enter both a title and some text for your entry.');
                return;
            }

            const entry = {
                title: title,
                text: text,
                date: new Date().toLocaleString()
            };

            saveJournalEntry(entry);
            loadJournalEntries(journalListEl);

            titleInput.value = '';
            textInput.value = '';
            alert('✅ Journal entry saved!');
        });
    }, '📝 Reading Reflection Journal'); // <-- New Title Argument
  }

  function saveJournalEntry(entry) {
    const key = `journal:${currentUser.username}`;
    const entries = JSON.parse(localStorage.getItem(key) || '[]');
    entries.unshift(entry); // Add to the beginning
    localStorage.setItem(key, JSON.stringify(entries));
  }

  function loadJournalEntries(el) {
    const key = `journal:${currentUser.username}`;
    const entries = JSON.parse(localStorage.getItem(key) || '[]');
    el.innerHTML = '';

    if (entries.length === 0) {
      el.innerHTML = '<p class="muted-text">No entries saved yet. Start writing!</p>';
      return;
    }

    entries.forEach((entry, index) => {
      const div = document.createElement('div');
      div.className = 'journal-entry-display';
      div.innerHTML = `
        <strong>${entry.title}</strong>
        <p style="font-size:12px; color:#999; margin:2px 0 5px;">${entry.date}</p>
        <p style="white-space: pre-wrap; margin:0 0 10px;">${entry.text.substring(0, 100)}...</p>
      `;
      el.appendChild(div);
    });
  }

  // ------------------- WORD SCRAMBLE GAME LOGIC -------------------

  const wordScrambleData = [
    { word: "LITERAL", hint: "The surface meaning, facts, and details from the text." },
    { word: "INFER", hint: "To deduce or conclude information from evidence and reasoning." },
    { word: "CRITICAL", hint: "Involving careful judgment and evaluation of the text." },
    { word: "COMPREHENSION", hint: "The ability to understand something, like a reading passage." },
    { word: "VOCABULARY", hint: "The body of words used in a particular language." },
    { word: "PASSAGE", hint: "A short portion of a written work or speech." },
    { word: "REFLECTION", hint: "Serious thought or consideration about the content." },
    { word: "STRATEGY", hint: "A plan of action designed to achieve a major goal." },
  ];

  let currentWord = null;
  let currentHint = null;

  function scrambleWord(word) {
    const a = word.split("");
    let scrambled;
    // Ensure the word is not scrambled into itself
    do {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      scrambled = a.join("");
    } while (scrambled === word);
    return scrambled;
  }

  function showWordScramble() {
    transitionContent(() => {
        contentArea.innerHTML = '';
        const template = document.getElementById('word-scramble-template');
        contentArea.appendChild(template.content.cloneNode(true));
        
        const wordEl = document.getElementById('scrambled-word');
        const hintEl = document.getElementById('word-hint');
        const checkBtn = document.getElementById('scramble-check-btn');
        const skipBtn = document.getElementById('scramble-skip-btn');
        const input = document.getElementById('scramble-input');
        const messageEl = document.getElementById('scramble-message');

        // Function to start a new round
        function startNewRound() {
            // Clear old inputs and messages
            input.value = '';
            messageEl.textContent = 'Unscramble the reading term below!';
            messageEl.className = 'scramble-message';
            input.disabled = false;
            checkBtn.disabled = false;
            
            // Select a random word
            const randomIndex = Math.floor(Math.random() * wordScrambleData.length);
            const data = wordScrambleData[randomIndex];
            currentWord = data.word.toUpperCase();
            currentHint = data.hint;
            
            // Scramble and display
            const scrambled = scrambleWord(currentWord);
            wordEl.textContent = scrambled;
            hintEl.textContent = currentHint;
        }

        // Function to check the answer
        function checkAnswer() {
            const guess = input.value.trim().toUpperCase();
            if (guess === currentWord) {
                messageEl.textContent = `✅ Correct! The word was ${currentWord}.`;
                messageEl.className = 'scramble-message correct';
                input.disabled = true;
                checkBtn.disabled = true;
                // Automatically start next round after a delay
                setTimeout(startNewRound, 2000); 
            } else {
                messageEl.textContent = `❌ Incorrect. Try again!`;
                messageEl.className = 'scramble-message incorrect';
                input.value = ''; // Clear input for another try
            }
        }
        
        // Initial round
        startNewRound();

        // Event listeners
        checkBtn.addEventListener('click', checkAnswer);
        skipBtn.addEventListener('click', startNewRound);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkBtn.click(); // Trigger check
            }
        });

    }, '🕹️ Word Scramble');
  }
  // ------------------- END WORD SCRAMBLE GAME LOGIC -------------------

// ------------------- GAMES MENU MODIFICATION (NEW/REDEFINED) -------------------

function showGames() {
    transitionContent(() => {
        // Use the new games menu template
        contentArea.innerHTML = '';
        const template = document.getElementById('games-menu-template');
        contentArea.appendChild(template.content.cloneNode(true));
        const gamesListContainer = document.getElementById('games-list-container');
        
        const games = [
            // 1. Story Clues Adventure
            { id: 'story-clues', name: '1. Story Clues Adventure', icon: 'fas fa-book-reader', func: showStoryCluesAdventure, color: '#F25A67', text: 'Vocabulary in Context, Inferencing (Best Pick!)' },
            // 2. Main Idea Match
            { id: 'main-idea', name: '2. Main Idea Match', icon: 'fas fa-link', func: showMainIdeaMatch, color: '#5A67F2', text: 'Identifying Main Idea, Summarizing' },
            // 3. Comprehension Maze
            { id: 'maze', name: '3. Comprehension Maze', icon: 'fas fa-map-marked-alt', func: showComprehensionMaze, color: '#FF9800', text: 'Sequencing, Literal & Inferential Questions' },
            // Keep Word Scramble if it exists
            // { id: 'word-scramble', name: 'Word Scramble', icon: 'fas fa-dice', func: showWordScramble, color: '#20B2AA', text: 'Reading Terminology and Vocabulary' },
        ];

        games.forEach(game => {
            const folder = document.createElement('div');
            folder.className = 'folder game-folder';
            // Use 33 at the end of the hex code for ~20% opacity background
            folder.style.backgroundColor = game.color + '33'; 
            folder.style.color = game.color;
            folder.innerHTML = `
                <i class="${game.icon}"></i>
                <div style="font-size:16px; margin-bottom:5px;">${game.name}</div>
                <p style="font-size:12px; color:var(--text-light);">${game.text}</p>
            `;
            folder.addEventListener('click', game.func);
            gamesListContainer.appendChild(folder);
        });
        
    }, '🕹️ Games Arcade');
}


// ------------------- GAME DATA -------------------

// Data for Story Clues Adventure
const storyCluesData = [
    {
        title: "The Silent Forest",
        story: "The old cottage stood by a river that flowed with incredible **[SPEED]**. The surrounding trees were so tall that they completely blocked the sunlight, making the forest unnaturally **[DARK]**. A strange, beautiful bird perched on the roof, singing a haunting **[MELODY]** that echoed across the water. The air was still and held the scent of damp earth and pine needles, inviting a sense of mystery.",
        blanks: [
            { id: 0, correct: "SPEED", options: ["SLOWLY", "SPEED", "COLOR", "NOISE"] },
            { id: 1, correct: "DARK", options: ["BRIGHT", "WARM", "DARK", "DRY"] },
            { id: 2, correct: "MELODY", options: ["ROCK", "SHOUT", "MELODY", "SCREAM"] }
        ]
    },
    {
        title: "The Inventor's Workshop",
        story: "Professor Lin's workshop was filled with the smell of old oil and buzzing **[ELECTRICITY]**. Gears and wires covered every surface, a testament to her brilliant but messy mind. She was working on her most ambitious project yet: a robot designed to read stories aloud. A small, anxious **[MOUSE]** darted beneath her work table, startled by the constant rhythmic **[TICKING]** of a complex timer she had built.",
        blanks: [
            { id: 0, correct: "ELECTRICITY", options: ["FLOWERS", "WATER", "MAGIC", "ELECTRICITY"] },
            { id: 1, correct: "MOUSE", options: ["LION", "CAT", "MOUSE", "EAGLE"] },
            { id: 2, correct: "TICKING", options: ["SILENCE", "TICKING", "SINGING", "BANGING"] }
        ]
    },
];

// Data for Main Idea Match
const mainIdeaMatchData = [
    {
        id: 'set1',
        matches: [
            { pid: 'p1', passage: "The moon has no light of its own, but reflects the light of the sun. As the moon orbits the Earth, the amount of sunlight we see changes, causing the different phases like the new moon, crescent, and full moon.", idea: "The phases of the moon are caused by changing amounts of sunlight." },
            { pid: 'p2', passage: "In many cultures, dragons are seen as symbols of power, wisdom, and good fortune, often controlling water and weather. In others, they are depicted as greedy, destructive beasts that hoard treasure and destroy villages.", idea: "Dragons are represented differently across various global cultures." },
            { pid: 'p3', passage: "Learning a new language improves cognitive flexibility. It forces the brain to switch between language systems, which enhances problem-solving and multitasking skills, even in non-language tasks.", idea: "Bilingualism strengthens the brain's general cognitive functions." },
        ]
    }
];

// Data for Comprehension Maze
const comprehensionMazeData = {
    nodes: [
        { id: 1, passage: "When the clock struck midnight, the castle's grand hall fell silent. The king's favorite cat, whiskers twitching, crept towards the enormous, jeweled portrait on the wall. Its eyes seemed to follow the small creature.", question: "What time did the hall fall silent?", correct: "Midnight", options: ["Mid-day", "Midnight", "Sunrise", "The next morning"] },
        { id: 2, passage: "The secret to the perfect souffle lies in the careful separation of egg whites and yolks. If even a tiny bit of yolk contaminates the whites, the mixture will fail to hold the necessary air, and the souffle will be flat.", question: "What is the key factor in making a perfect souffle?", correct: "Carefully separating the egg parts", options: ["Baking temperature", "The type of flour", "Carefully separating the egg parts", "Using fresh milk"] },
        { id: 3, passage: "Despite its name, the red panda is not closely related to the giant panda. It is a unique species that primarily eats bamboo and spends most of its life in the trees of the eastern Himalayas.", question: "What is the primary diet of the red panda?", correct: "Bamboo", options: ["Small rodents", "Leaves and berries", "Insects", "Bamboo"] }
    ],
    path: [1, 2, 3] // Simple linear path for this example
};

// ------------------- 1. STORY CLUES ADVENTURE LOGIC -------------------

let currentStory = null;
let currentBlanks = [];
let storyScore = 0;

function formatPassage(text, solved = false) {
    let html = text;
    // Iterate over all possible blanks in the current story's data
    currentStory.blanks.forEach((blank) => {
        const regex = new RegExp(`\\[${blank.correct}\\]`);
        const isSolved = !currentBlanks.some(b => b.id === blank.id);
        
        if (solved || isSolved) {
            // Replaces the placeholder with the solved word
            html = html.replace(regex, `<span class="solved-word">${blank.correct.toLowerCase()}</span>`);
        } else if (blank.id === currentBlanks[0]?.id) {
            // Replaces the *current* active blank with a placeholder
            html = html.replace(regex, `<span data-blank-id="${blank.id}" class="blank-placeholder">____</span>`);
        } else {
            // Blanks yet to be reached (show as a small gap)
            html = html.replace(regex, '___'); 
        }
    });
    return html;
}

function checkStoryCluesAnswer(guess, blank, clickedButton, feedbackEl, storyPassageEl, optionsContainer, nextBtn) {
    const allButtons = optionsContainer.querySelectorAll('.blank-word-option');
    allButtons.forEach(btn => btn.disabled = true);

    if (guess.toUpperCase() === blank.correct.toUpperCase()) {
        storyScore++;
        feedbackEl.textContent = '✅ Correct! Finding the right word helps your understanding.';
        feedbackEl.className = 'game-message correct';
        clickedButton.classList.add('correct');
        
        // Replace the blank placeholder with the correct word
        const placeholder = storyPassageEl.querySelector(`[data-blank-id="${blank.id}"]`);
        if (placeholder) {
            placeholder.textContent = blank.correct.toLowerCase();
            placeholder.classList.remove('active-blank');
            placeholder.classList.add('solved-word');
        }

        currentBlanks.shift(); 
        setTimeout(() => loadCurrentBlank(feedbackEl, storyPassageEl, optionsContainer, nextBtn), 1500);

    } else {
        feedbackEl.textContent = `❌ Incorrect. The word was "${blank.correct.toLowerCase()}".`;
        feedbackEl.className = 'game-message incorrect';
        clickedButton.classList.add('incorrect');
        
        // Highlight the correct answer
        allButtons.forEach(btn => {
            if (btn.dataset.option.toUpperCase() === blank.correct.toUpperCase()) {
                btn.classList.add('correct');
            }
        });

        // Fail the story and move to the next one
        currentBlanks = []; 
        setTimeout(() => loadCurrentBlank(feedbackEl, storyPassageEl, optionsContainer, nextBtn), 2500);
    }
}

function loadCurrentBlank(feedbackEl, storyPassageEl, optionsContainer, nextBtn) {
    if (currentBlanks.length === 0) {
        // All blanks solved or story failed
        storyPassageEl.innerHTML = formatPassage(currentStory.story, true);
        optionsContainer.innerHTML = '';
        feedbackEl.textContent = `Story Complete! Your Score: ${storyScore} out of ${currentStory.blanks.length}.`;
        feedbackEl.className = 'game-message correct';
        nextBtn.style.display = 'block'; 
        return;
    }

    const currentBlank = currentBlanks[0];
    storyPassageEl.innerHTML = formatPassage(currentStory.story);
    feedbackEl.textContent = 'Select the best word from the options.';
    feedbackEl.className = 'game-message';
    
    // Find the placeholder and make it visible
    const placeholder = storyPassageEl.querySelector(`[data-blank-id="${currentBlank.id}"]`);
    if (placeholder) {
        placeholder.textContent = '____'; 
        placeholder.classList.add('active-blank');
    }

    // Render options
    optionsContainer.innerHTML = '';
    currentBlank.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'btn blank-word-option';
        button.textContent = option;
        button.dataset.option = option;
        
        button.addEventListener('click', () => checkStoryCluesAnswer(option, currentBlank, button, feedbackEl, storyPassageEl, optionsContainer, nextBtn));
        optionsContainer.appendChild(button);
    });
}

function showStoryCluesAdventure() {
    transitionContent(() => {
        contentArea.innerHTML = '';
        const template = document.getElementById('story-clues-template');
        contentArea.appendChild(template.content.cloneNode(true));

        const storyPassageEl = document.getElementById('story-passage');
        const optionsContainer = document.getElementById('blank-options-container');
        const feedbackEl = document.getElementById('game-message');
        const nextBtn = document.getElementById('story-next-btn');
        const skipBtn = document.getElementById('story-skip-btn');
        // const feedbackAnimationEl = document.getElementById('feedback-animation'); // Not used in this shortened version

        function startNewStory() {
            storyScore = 0;
            const randomIndex = Math.floor(Math.random() * storyCluesData.length);
            currentStory = storyCluesData[randomIndex];
            currentBlanks = currentStory.blanks.slice();
            loadCurrentBlank(feedbackEl, storyPassageEl, optionsContainer, nextBtn);
            nextBtn.style.display = 'none';
        }
        
        nextBtn.addEventListener('click', startNewStory);
        skipBtn.addEventListener('click', startNewStory);
        startNewStory();
    }, '🏰 Story Clues Adventure');
}


// ------------------- 2. MAIN IDEA MATCH LOGIC -------------------

function showMainIdeaMatch() {
    transitionContent(() => {
        contentArea.innerHTML = '';
        const template = document.getElementById('main-idea-match-template');
        contentArea.appendChild(template.content.cloneNode(true));

        const matchSet = mainIdeaMatchData[0].matches; 
        const passagesContainer = document.getElementById('passages-container');
        const ideasContainer = document.getElementById('ideas-container');
        const checkBtn = document.getElementById('match-check-btn');
        const skipBtn = document.getElementById('match-skip-btn');
        const messageEl = document.getElementById('match-message');

        function setupDragAndDrop() {
            passagesContainer.innerHTML = '';
            ideasContainer.innerHTML = '';
            messageEl.textContent = 'Drag and drop the main idea card to its correct passage.';
            messageEl.className = 'game-message';
            checkBtn.disabled = false;

            // Create and shuffle idea cards (the draggable items)
            const ideas = matchSet.map(m => ({ id: m.pid, text: m.idea }));
            ideas.sort(() => Math.random() - 0.5); // Shuffle ideas

            ideas.forEach(idea => {
                const ideaCard = document.createElement('div');
                ideaCard.className = 'match-card idea';
                ideaCard.draggable = true;
                ideaCard.id = `idea-${idea.id}`;
                ideaCard.textContent = idea.text;

                ideaCard.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', e.target.id);
                    e.target.style.opacity = '0.5';
                });
                ideaCard.addEventListener('dragend', (e) => {
                    e.target.style.opacity = '1';
                });
                ideasContainer.appendChild(ideaCard);
            });
            
            // Create passage cards (the drop targets)
            matchSet.forEach(match => {
                const passageCard = document.createElement('div');
                passageCard.className = 'match-card passage';
                passageCard.style.cursor = 'default';
                passageCard.innerHTML = `<div class="passage-text">${match.passage}</div>`;
                
                const dropTarget = document.createElement('div');
                dropTarget.className = 'drop-target';
                dropTarget.dataset.correctId = `idea-${match.pid}`;
                
                dropTarget.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropTarget.classList.add('highlight');
                });
                dropTarget.addEventListener('dragleave', () => {
                    dropTarget.classList.remove('highlight');
                });
                dropTarget.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropTarget.classList.remove('highlight');
                    const draggedId = e.dataTransfer.getData('text/plain');
                    const draggedEl = document.getElementById(draggedId);

                    if (draggedEl && draggedEl.classList.contains('idea')) {
                         // If the target already has an idea, move it back to the ideas container
                        if (dropTarget.querySelector('.idea')) {
                            ideasContainer.appendChild(dropTarget.firstElementChild);
                        }
                        dropTarget.appendChild(draggedEl);
                    }
                });

                passageCard.appendChild(dropTarget);
                passagesContainer.appendChild(passageCard);
            });
        }

        function checkMatches() {
            let correctCount = 0;
            const dropTargets = document.querySelectorAll('.drop-target');
            dropTargets.forEach(target => {
                target.style.borderStyle = 'solid';
                const ideaEl = target.querySelector('.idea');
                
                if (ideaEl) {
                    if (ideaEl.id === target.dataset.correctId) {
                        correctCount++;
                        target.style.borderColor = '#4CAF50';
                        target.style.backgroundColor = '#E8F5E9';
                        ideaEl.classList.add('correct');
                    } else {
                        target.style.borderColor = '#FF6B6B';
                        target.style.backgroundColor = '#FFEBEE';
                        ideaEl.classList.add('incorrect');
                    }
                    ideaEl.draggable = false;
                } else {
                    target.style.borderColor = '#FF6B6B';
                    target.style.backgroundColor = '#FFEBEE';
                }
            });

            if (correctCount === matchSet.length) {
                messageEl.textContent = '🥳 Perfect Match! All main ideas are correct.';
                messageEl.className = 'game-message correct';
            } else {
                messageEl.textContent = `Try again! You got ${correctCount} out of ${matchSet.length} correct.`;
                messageEl.className = 'game-message incorrect';
            }
            checkBtn.disabled = true;
        }

        checkBtn.addEventListener('click', checkMatches);
        skipBtn.addEventListener('click', setupDragAndDrop); // Restart
        
        setupDragAndDrop();

    }, '🔤 Main Idea Match');
}


// ------------------- 3. COMPREHENSION MAZE LOGIC -------------------

let currentMazeNode = 1;
let mazeSolvedNodes = [];

function showComprehensionMaze() {
    transitionContent(() => {
        contentArea.innerHTML = '';
        const template = document.getElementById('comprehension-maze-template');
        contentArea.appendChild(template.content.cloneNode(true));
        
        const mapContainer = document.getElementById('maze-map-container');
        const passageSnippetEl = document.getElementById('maze-passage-snippet');
        const questionEl = document.getElementById('maze-question');
        const optionsContainer = document.getElementById('maze-options-container');
        const feedbackEl = document.getElementById('maze-feedback');
        const resetBtn = document.getElementById('maze-reset-btn');

        function renderMaze() {
            mapContainer.innerHTML = '';
            
            // Check for game completion
            if (currentMazeNode === null) {
                feedbackEl.textContent = '🏆 Maze Solved! You finished the entire reading comprehension path.';
                feedbackEl.className = 'game-message correct';
                passageSnippetEl.textContent = '';
                questionEl.textContent = 'Congratulations!';
                optionsContainer.innerHTML = '';
                return;
            }

            // Render nodes and links
            comprehensionMazeData.path.forEach((nodeId, index) => {
                const nodeData = comprehensionMazeData.nodes.find(n => n.id === nodeId);
                if (!nodeData) return;

                const nodeEl = document.createElement('div');
                nodeEl.className = 'maze-node';
                nodeEl.textContent = nodeId;
                nodeEl.dataset.nodeId = nodeId;
                
                if (mazeSolvedNodes.includes(nodeId)) {
                    nodeEl.classList.add('solved');
                } else if (nodeId === currentMazeNode) {
                    nodeEl.classList.add('current');
                }

                // If the node is the current one, load its question on click
                if (nodeId === currentMazeNode && !mazeSolvedNodes.includes(nodeId)) {
                    nodeEl.addEventListener('click', () => loadNodeQuestion(nodeData));
                }

                mapContainer.appendChild(nodeEl);
                
                // Add link between nodes
                if (index < comprehensionMazeData.path.length - 1) {
                    const linkEl = document.createElement('div');
                    linkEl.className = 'maze-link';
                    mapContainer.appendChild(linkEl);
                }
            });
        }

        function loadNodeQuestion(nodeData) {
            optionsContainer.innerHTML = '';
            feedbackEl.textContent = 'Select the correct answer to advance!';
            feedbackEl.className = 'game-message';
            
            // Display passage snippet and question
            passageSnippetEl.textContent = `"${nodeData.passage.substring(0, 70)}..."`; // Snippet
            questionEl.textContent = nodeData.question;
            
            // Create options
            nodeData.options.sort(() => Math.random() - 0.5); // Shuffle
            nodeData.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'btn blank-word-option'; // Reuse style
                button.textContent = option;
                button.addEventListener('click', () => checkMazeAnswer(option, nodeData, button));
                optionsContainer.appendChild(button);
            });
        }

        function checkMazeAnswer(guess, nodeData, clickedButton) {
            const allButtons = optionsContainer.querySelectorAll('.blank-word-option');
            allButtons.forEach(btn => btn.disabled = true);

            if (guess === nodeData.correct) {
                feedbackEl.textContent = '✅ Correct! Moving to the next node.';
                feedbackEl.className = 'game-message correct';
                clickedButton.classList.add('correct');
                
                // Update state and move to next node
                mazeSolvedNodes.push(currentMazeNode);
                const nextIndex = comprehensionMazeData.path.indexOf(currentMazeNode) + 1;
                
                setTimeout(() => {
                    if (nextIndex < comprehensionMazeData.path.length) {
                        currentMazeNode = comprehensionMazeData.path[nextIndex];
                         // Load the next question automatically
                         const nextNodeData = comprehensionMazeData.nodes.find(n => n.id === currentMazeNode);
                         loadNodeQuestion(nextNodeData);
                    } else {
                        currentMazeNode = null; // Maze solved
                    }
                    renderMaze();
                }, 1500);

            } else {
                feedbackEl.textContent = `❌ Incorrect. You must answer correctly to pass this checkpoint.`;
                feedbackEl.className = 'game-message incorrect';
                clickedButton.classList.add('incorrect');
                
                // Highlight correct answer and re-enable buttons after a delay
                allButtons.forEach(btn => {
                    if (btn.textContent === nodeData.correct) {
                        btn.classList.add('correct');
                    }
                });
                setTimeout(() => {
                    allButtons.forEach(btn => {
                        btn.disabled = false;
                        btn.classList.remove('incorrect', 'correct');
                    });
                }, 1500);
            }
        }
        
        function resetMaze() {
            currentMazeNode = comprehensionMazeData.path[0];
            mazeSolvedNodes = [];
            renderMaze();
            const startNodeData = comprehensionMazeData.nodes.find(n => n.id === currentMazeNode);
            loadNodeQuestion(startNodeData);
        }

        resetBtn.addEventListener('click', resetMaze);
        
        // Initial call
        resetMaze();

    }, '🧩 Comprehension Maze');
}

  // ------------------- READING RACE GAME LOGIC (NEW) -------------------
  let timerInterval = null;
  let raceData = [];
  let currentRaceIndex = 0;
  let raceScore = 0;

  function generateReadingRaceData() {
      // Select 5 random passages/questions for a quick race
      const allPassages = [
          ...passages.literal.map(p => ({...p, level: 'literal'})), 
          ...passages.inferential.filter(p => p.questions.length > 0).map(p => ({...p, level: 'inferential'})),
          ...passages.critical.filter(p => p.questions.length > 0).map(p => ({...p, level: 'critical'}))
      ];

      raceData = [];
      const numQuestions = 5;

      for (let i = 0; i < numQuestions; i++) {
          // Pick a random passage
          const randomPassageIndex = Math.floor(Math.random() * allPassages.length);
          const passage = allPassages[randomPassageIndex];
          
          // Pick a random question from that passage
          if (passage && passage.questions.length > 0) {
              const randomQIndex = Math.floor(Math.random() * passage.questions.length);
              const question = passage.questions[randomQIndex];
              
              // For Race, always simplify to a single best answer or MCQ for fast judging
              if (passage.level === 'literal') {
                  raceData.push({
                      type: 'literal',
                      text: passage.text,
                      q: question.q,
                      options: question.options,
                      answer: question.answer
                  });
              } 
              // For inferential/critical, use the first keyword for a quick check
              else {
                  raceData.push({
                      type: 'keyword',
                      text: passage.text,
                      q: question.q,
                      keywords: question.keywords,
                      answer: (question.keywords && question.keywords.length > 0) ? question.keywords[0].toUpperCase() : 'UNKNOWN'
                  });
              }
          }
      }
      return raceData.length > 0;
  }

  function startTimer(duration, display) {
      let timer = duration, minutes, seconds;
      
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
          minutes = parseInt(timer / 60, 10);
          seconds = parseInt(timer % 60, 10);

          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;

          display.textContent = minutes + ":" + seconds;

          if (--timer < 0) {
              clearInterval(timerInterval);
              finishRace(false); // Time's up
          }
      }, 1000);
  }

  function finishRace(completed) {
      if (timerInterval) clearInterval(timerInterval);
      
      const timeRemainingEl = document.getElementById('race-time-remaining') ? document.getElementById('race-time-remaining').textContent : '00:00';
      const finalTime = completed ? `with ${timeRemainingEl} remaining!` : `— Time Expired.`;
      const maxScore = raceData.length * 5;
      const message = completed ? `You finished the race in time with ${raceScore} points!` : `Your race ended! You scored ${raceScore} points.`;
      
      transitionContent(() => {
          contentArea.innerHTML = `
              <div class="result-card feature-card" style="text-align:center;">
                  <h3 class="feature-title" style="color:var(--primary);">🏁 Race Finished!</h3>
                  <h4>Final Score: ${raceScore} / ${maxScore}</h4>
                  <p>You completed ${currentRaceIndex} questions ${finalTime}</p>
                  <p>${message}</p>
                  <div class="button-row" style="margin-top:30px; justify-content:center;">
                      <button class="btn btn-primary" id="race-play-again">Play Again</button>
                      <button class="btn btn-back" id="race-back-to-menu">Back to Games Menu</button>
                  </div>
              </div>
          `;
          document.getElementById('race-play-again').addEventListener('click', showReadingRace);
          document.getElementById('race-back-to-menu').addEventListener('click', showGames);
      }, 'Race Results');
  }

  function nextRaceQuestion() {
      if (currentRaceIndex >= raceData.length) {
          finishRace(true);
          return;
      }
      
      const data = raceData[currentRaceIndex];
      const questionContainer = document.getElementById('race-question-container');
      const questionIndexEl = document.getElementById('race-question-index');
      const feedbackEl = document.getElementById('race-feedback-message');
      
      questionIndexEl.textContent = `Question ${currentRaceIndex + 1} of ${raceData.length}`;
      feedbackEl.textContent = 'Read the passage quickly and answer the question!';
      feedbackEl.className = 'race-feedback-message';

      let questionHtml = '';
      
      // Display the passage snippet first
      questionHtml += `<div class="race-passage-text">
          <p><strong>Passage:</strong> ${data.text.substring(0, 150)}... 
          <span class="full-text-toggle" style="color:var(--primary);cursor:pointer;font-weight:600;">(Show Full Text)</span></p>
      </div>
      <div class="full-passage-display" style="display:none;padding:10px;border:1px dashed #ddd;margin-bottom:10px;border-radius:8px;">
          <p style="white-space:pre-wrap;">${data.text}</p>
      </div>
      
      <p style="margin-top:15px;"><strong>Question:</strong> ${data.q}</p>`;

      if (data.type === 'literal') {
          // MCQ for Literal
          questionHtml += `<form id="race-q-form">
              <div class="options-group">`;
              data.options.forEach((option, i) => {
                  questionHtml += `<label><input type="radio" name="race-answer" value="${option}"> ${option}</label>`;
              });
          questionHtml += `</div>
              <button type="submit" class="btn btn-primary">Submit Answer</button>
          </form>`;
      } else {
          // Keyword/Short Answer for Inferential/Critical
          questionHtml += `<form id="race-q-form">
              <input type="text" name="race-answer" placeholder="Type your core answer keyword here..." required />
              <p class="muted-text" style="font-size:12px;margin-top:5px;">(Score 5 points for the exact key term, 3 for a related term)</p>
              <button type="submit" class="btn btn-primary">Submit Answer</button>
          </form>`;
      }

      questionContainer.innerHTML = questionHtml;

      // Toggle full passage text
      questionContainer.querySelector('.full-text-toggle').addEventListener('click', (e) => {
          const fullTextDiv = questionContainer.querySelector('.full-passage-display');
          const isHidden = fullTextDiv.style.display === 'none';
          fullTextDiv.style.display = isHidden ? 'block' : 'none';
          e.target.textContent = isHidden ? '(Hide Full Text)' : '(Show Full Text)';
      });

      // Form submission logic
      document.getElementById('race-q-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const answer = (formData.get('race-answer') || '').trim();
          let points = 0;
          let correctMsg = '';
          let feedbackClass = 'correct';

          if (data.type === 'literal') {
              if (answer === data.answer) {
                  points = 5;
                  correctMsg = `✅ Correct! (+5 Pts)`;
              } else {
                  points = 0;
                  correctMsg = `❌ Incorrect. The answer was ${data.answer}.`;
                  feedbackClass = 'incorrect';
              }
          } else if (data.type === 'keyword') {
              const userAns = answer.toUpperCase();
              const keywords = data.keywords.map(k => k.toUpperCase());
              
              if (keywords.includes(userAns)) {
                  points = 5;
                  correctMsg = `✅ Excellent! You got the key term. (+5 Pts)`;
              } else if (keywords.some(k => userAns.includes(k) || k.includes(userAns))) {
                  points = 3;
                  correctMsg = `🟡 Good attempt! Close enough. (+3 Pts)`;
                  feedbackClass = 'partial';
              } else {
                  points = 0;
                  correctMsg = `❌ Not quite. Key term was: ${data.answer}.`;
                  feedbackClass = 'incorrect';
              }
          }

          raceScore += points;
          document.getElementById('race-score').textContent = raceScore;
          
          // Show feedback and move to next question
          feedbackEl.textContent = correctMsg;
          feedbackEl.className = `race-feedback-message ${feedbackClass}`;
          
          currentRaceIndex++;
          
          // Wait briefly then load the next question
          setTimeout(nextRaceQuestion, 1500);
      });
  }

  function showReadingRace() {
      // 1. Setup the race
      if (!generateReadingRaceData()) {
          alert("Error: Could not find enough passages to start the Reading Race. Try again later.");
          showGames();
          return;
      }
      currentRaceIndex = 0;
      raceScore = 0;
      const totalTimeInSeconds = 120; // 2 minutes for 5 questions

      transitionContent(() => {
          contentArea.innerHTML = '';
          const template = document.getElementById('reading-race-template');
          contentArea.appendChild(template.content.cloneNode(true));
          
          const timeDisplay = document.getElementById('race-time-remaining');
          const scoreDisplay = document.getElementById('race-score');
          scoreDisplay.textContent = raceScore;

          // 2. Start timer and first question
          startTimer(totalTimeInSeconds, timeDisplay);
          nextRaceQuestion();
          
          // 3. Setup buttons
          document.getElementById('race-quit-btn').addEventListener('click', () => finishRace(false));

      }, '🕹️ Reading Race');
  }

// Games Folder - MODIFIED to wire up ALL game buttons
function showGames() {
    transitionContent(() => {
        const template = document.getElementById('games-template');
        contentArea.innerHTML = '';
        contentArea.appendChild(template.content.cloneNode(true));

        // Event listeners for the game buttons
        const scrambleBtn = document.getElementById('play-word-scramble');
        const raceBtn = document.getElementById('play-reading-race');

        // NEW BUTTON IDS FOR THE NEW GAMES (The buttons must exist in index.html)
        const storyCluesBtn = document.getElementById('play-story-clues');
        const mainIdeaBtn = document.getElementById('play-main-idea-match');
        const mazeBtn = document.getElementById('play-comprehension-maze');


        if (scrambleBtn) {
            scrambleBtn.addEventListener('click', showWordScramble);
        }
        
        // ADD NEW GAME LISTENERS:
        if (storyCluesBtn) {
            storyCluesBtn.addEventListener('click', showStoryCluesAdventure);
        }
        if (mainIdeaBtn) {
            mainIdeaBtn.addEventListener('click', showMainIdeaMatch);
        }
        if (mazeBtn) {
            mazeBtn.addEventListener('click', showComprehensionMaze);
        }
        // END OF NEW GAME LISTENERS

        if (raceBtn) {
            raceBtn.addEventListener('click', showReadingRace);
        }
        
    }, '🕹️ Reading Challenges'); // <-- Updated Title
}
  // ------------------- END READING RACE GAME LOGIC -------------------

// ===============================
// NEW DATA: TIPS AND VIDEOS (ADD THIS BLOCK)
// ===============================
const readingTips = [
    "Set aside a quiet time each day to read — your mind deserves it!",
    "Always have a book nearby; inspiration strikes at unexpected moments.",
    "Ask questions while you read to deepen your understanding.",
    "Summarize what you read in your own words to retain more.",
    "Read a variety of genres to expand your imagination.",
    "Visualize the story or concept in your mind — pictures help memory.",
    "Discuss books with friends or family to gain new insights.",
    "Challenge yourself with slightly harder material each week.",
    "Take notes on key ideas to create your personal study guide.",
    "Teach someone what you learned; teaching is learning twice.",
    "Set goals: finish a chapter, understand a concept, or learn 5 new words.",
    "Reflect on your reading: How does it relate to your life?",
    "Reward yourself after completing reading sessions to stay motivated.",
    "Keep a list of favorite quotes or passages — it inspires future reading.",
    "Try reading aloud to improve focus and retention.",
    "Break longer texts into manageable sections to avoid overwhelm.",
    "Use bookmarks or sticky notes to track important points.",
    "Read for pleasure sometimes — joy fuels consistent reading.",
    "Explore topics outside your comfort zone to broaden perspective.",
    "Remember: every minute spent reading grows your mind."
];

const tipIcons = ['🌟','📖','❓','📝','🌍','🎨','💬','💪','🧩','👩‍🏫','🎯','🤔','🎁','📔','🗣️','🪄','📌','❤️','🌈','🧠'];

const videoList = [
    { title: "The Importance of Reading", url: "https://www.youtube.com/embed/mbCJqdrzwcE" },
    { title: "Effective Reading Strategies", url: "https://www.youtube.com/embed/LbO3lRXT0ww" },
    { title: "Types of Reading Explained", url: "https://www.youtube.com/embed/X5yJRAOlA1U" },
    { title: "Understanding Reading Comprehension", url: "https://www.youtube.com/embed/q4Y_67GMkP4" },
    { title: "Mastering Reading Comprehension", url: "https://www.youtube.com/embed/pro0TJL2TM8" },
    { title: "How to Improve Reading Comprehension", url: "https://www.youtube.com/embed/JDOt8BjjHJ4" },
    { title: "Levels of Reading Comprehension", url: "https://www.youtube.com/embed/B3fOJjV-NGg" },
    { title: "Reading Levels Made Simple", url: "https://www.youtube.com/embed/0ZoD1mV1aZo" },
    { title: "Literal Comprehension Basics", url: "https://www.youtube.com/embed/wCyljw_CcVA" },
    { title: "Literal Comprehension Guide", url: "https://www.youtube.com/embed/mUpr2P3JeZM" },
    { title: "Inferential Reading Skills", url: "https://www.youtube.com/embed/g2G-MaIxjBI" },
    { title: "Developing Inferential Thinking", url: "https://www.youtube.com/embed/M6ZvUdGVOXI" },
    { title: "Smart Reading Tips", url: "https://www.youtube.com/embed/LbO3lRXT0ww" },
    { title: "Critical Reading Made Easy", url: "https://www.youtube.com/embed/2G4fz3fyBE4" },
    { title: "Sharpen Your Critical Thinking", url: "https://www.youtube.com/embed/iOGvwPmKOqQ" }
];

// ===============================
// NEW FOLDER LOGIC: TIPS
// ===============================
function showTips() {
    transitionContent(() => {
        const template = document.getElementById('tips-template');
        contentArea.innerHTML = '';
        contentArea.appendChild(template.content.cloneNode(true));
        
        const tipsListEl = document.getElementById('tips-list');
        
        readingTips.forEach((tip, index) => {
            // Cycle through tip icons
            const icon = tipIcons[index % tipIcons.length]; 
            const li = document.createElement('li');
            li.className = 'tip-item';
            li.innerHTML = `<span class="tip-icon">${icon}</span> ${tip}`;
            tipsListEl.appendChild(li);
        });
        
    }, '✨ 20 Inspirational Reading Tips');
}

// ===============================
// NEW FOLDER LOGIC: VIDEOS
// ===============================
function showVideos() {
    transitionContent(() => {
        const template = document.getElementById('videos-template');
        contentArea.innerHTML = '';
        contentArea.appendChild(template.content.cloneNode(true));

        const videoListEl = document.getElementById('video-list-container');
        const iframeEl = document.getElementById('youtube-iframe');
        
        // Load the first video by default
        iframeEl.src = videoList[0].url;
        document.getElementById('video-title-header').textContent = videoList[0].title;

        videoList.forEach(video => {
            const item = document.createElement('div');
            item.className = 'video-list-item';
            item.innerHTML = `<i class="fas fa-play-circle"></i> ${video.title}`;
            
            item.addEventListener('click', () => {
                // Update the iframe source
                iframeEl.src = video.url;
                // Update the title display
                document.getElementById('video-title-header').textContent = video.title;
                // Scroll the iframe into view
                iframeEl.scrollIntoView({ behavior: 'smooth' });
            });
            
            videoListEl.appendChild(item);
        });

    }, '📺 Reading Strategy Videos');
}
  
  // NEW: Encyclopedia Folder (Wikipedia)
  function showEncyclopedia() {
    transitionContent(() => {
        let html = `
            <div class="feature-card encyclopedia-card">
              <h3 class="feature-title"><i class="fas fa-globe-americas"></i> ReadSMART Encyclopedia</h3>
              <p>Search any topic using <a href="https://www.wikipedia.org/" target="_blank" style="color: var(--primary); font-weight: 600;">Wikipedia</a> to deepen your knowledge beyond the text.</p>
              <iframe src="https://www.wikipedia.org/" style="width:100%; height:600px; border:1px solid var(--border-color); margin-top:15px; border-radius:8px; background:white;"></iframe>
            </div>
        `;
        contentArea.innerHTML = html;
    }, '🌍 ReadSMART Encyclopedia'); // <-- New Title Argument
  }


  // ------------------- QUIZ FLOW & FEEDBACK ENHANCEMENT -------------------
  
  // Renders the list of passages in a folder
  function showPassageList(level) {
    const levelNames = {
      literal: '🎯 Literal',
      inferential: '🔍 Inferential',
      critical: '💡 Critical'
    };
    
    transitionContent(() => {
        const list = passages[level];
        let html = `<div class="passage-list feature-card">
                        <h3>${levelNames[level]} Comprehension (${list.length} Passages)</h3>
                        <p>Select a passage to begin the quiz. Remember the goal is to understand deeply!</p>
                        <ul>`;

        list.forEach((p, index) => {
            html += `<li><a href="#" data-level="${level}" data-index="${index}">${p.title}</a></li>`;
        });
        html += `</ul></div>`;
        contentArea.innerHTML = html;

        // Add event listeners to each passage link
        contentArea.querySelectorAll('.passage-list a').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const lvl = e.target.dataset.level;
                const idx = parseInt(e.target.dataset.index);
                showPassageQuiz(lvl, idx);
            });
        });
    }, `${levelNames[level]} Comprehension`); // <-- New Title Argument for the list view
  }

  // Renders the passage and quiz form (simplified for brevity)
  function showPassageQuiz(level, index) {
      currentPassage = { level, index };
      const p = passages[level][index];
      
      let questionHtml = p.questions.map((q, qIndex) => {
          let optionsHtml = '';
          if (p.level === 'literal' || level === 'literal') { // Literal = MCQ
              optionsHtml = q.options.map((option, oIndex) => `
                  <label>
                      <input type="radio" name="q${qIndex}" value="${option}" required> ${option}
                  </label>
              `).join('');
          } else { // Inferential/Critical = Textarea
              optionsHtml = `<textarea name="q${qIndex}" placeholder="Type your reflective answer here..." required></textarea>`;
          }
          return `
              <div class="question">
                  <p><strong>${qIndex + 1}.</strong> ${q.q}</p>
                  <div class="options-group">${optionsHtml}</div>
              </div>
          `;
      }).join('');

      transitionContent(() => {
          contentArea.innerHTML = `
              <div class="passage-quiz-container feature-card">
                  <h3 class="feature-title">${p.title} - ${capitalize(level)} Level</h3>
                  <div class="passage-text passage">
                      <p>${p.text}</p>
                  </div>
                  <form id="quiz-form" style="margin-top:20px;">
                      ${questionHtml}
                      <div class="button-row">
                          <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Submit Answers</button>
                          <button type="button" class="btn btn-secondary" id="quiz-cancel-btn">Cancel</button>
                      </div>
                  </form>
              </div>
          `;
          
          // Note: The cancel button now goes back to the list, which in turn switches to the folder view.
          document.getElementById('quiz-cancel-btn').addEventListener('click', () => showPassageList(level));
          document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmission);
      }, `${p.title}`); // <-- New Title Argument for the quiz page
  }

  // Handles quiz submission and enhanced feedback
  function handleQuizSubmission(e) {
    e.preventDefault();

    const { level, index } = currentPassage;
    const passageData = passages[level][index];
    const formData = new FormData(e.target);
    let score = 0;
    const total = passageData.questions.length * 5; // Max score is 5 points per question

    passageData.questions.forEach((q, qIndex) => {
        const answer = formData.get(`q${qIndex}`) || '';

        if (level === 'literal') {
            // Literal (MCQ): 5 points for correct answer, 0 for incorrect
            if (answer === q.answer) {
                score += 5;
            }
        } else {
            // Inferential/Critical (Textarea): Score based on keyword match
            const points = scoreInferentialOrCritical(answer, q.keywords);
            score += points;
        }
    });

    // Save the record
    saveRecord(currentUser.username, passageData.title, capitalize(level), score, total);
    
    // Show enhanced results
    showResults(passageData.title, level, score, total);
  }


  // --- ENHANCED QUIZ FEEDBACK LOGIC ---
  function showResults(title, level, score, total) {
      const percentage = (score / total) * 100;
      let feedbackTitle;
      let feedbackMessage;
      let actionLink = '';

      if (percentage >= 80) {
          // High Score
          feedbackTitle = '🎉 Congratulations, ReadSMART Master!';
          feedbackMessage = `Your score of <strong>${score}/${total} (${percentage.toFixed(0)}%)</strong> shows you have a strong grasp of ${capitalize(level)} comprehension. Keep up the brilliant work!`;
          actionLink = '<p style="margin-top:20px;"><strong>Your score is high!</strong> You might be ready to challenge yourself with the next level!</p>';
      } else if (percentage >= 50) {
          // Mid Score
          feedbackTitle = '👍 Great Effort, Keep Growing!';
          feedbackMessage = `Your score of <strong>${score}/${total} (${percentage.toFixed(0)}%)</strong> is a solid foundation. With a little more focus on ${capitalize(level)} skills, you can master this!`;
          actionLink = '<p style="margin-top:20px;"><strong>Want to improve?</strong> Click <a href="#" id="tips-link">Tips</a> and <a href="#" id="videos-link">Videos</a> for proven strategies to boost your score!</p>';
      } else {
          // Low Score
          feedbackTitle = '⭐ Ready for a Boost?';
          feedbackMessage = `Your score of <strong>${score}/${total} (${percentage.toFixed(0)}%)</strong> is a good starting point. Don't worry, every expert was once a beginner! Let's build a better strategy.`;
          actionLink = '<p style="margin-top:20px;"><strong>Time to level up!</strong> Click <a href="#" id="tips-link">Tips and Strategies</a> or check out <a href="#" id="videos-link">Helpful Videos</a> right now!</p>';
      }

      transitionContent(() => {
          contentArea.innerHTML = `
              <div class="result-card feature-card" style="text-align:center;">
                  <h3 class="feature-title" style="color:${percentage >= 80 ? 'var(--primary)' : 'var(--secondary)'}">${feedbackTitle}</h3>
                  <h4>Passage: ${title} (${capitalize(level)})</h4>
                  <p>${feedbackMessage}</p>
                  ${actionLink}
                  <div class="button-row" style="margin-top:30px; justify-content:center;">
                      <button class="btn btn-primary" id="go-back-home-btn">Go Back Home</button>
                      <button class="btn btn-secondary" id="try-another-quiz-btn">Try Another ${capitalize(level)} Quiz</button>
                  </div>
              </div>
          `;
          
          // Attach listeners for dynamic links
          if (document.getElementById('tips-link')) {
              document.getElementById('tips-link').addEventListener('click', (e) => { e.preventDefault(); showTips(); });
          }
          if (document.getElementById('videos-link')) {
              document.getElementById('videos-link').addEventListener('click', (e) => { e.preventDefault(); showVideos(); });
          }
          
          // Attach listeners for buttons
          document.getElementById('go-back-home-btn').addEventListener('click', () => {
              // Simulate clicking the back button to show folders
              if (backToFoldersBtn) backToFoldersBtn.click();
          });
          document.getElementById('try-another-quiz-btn').addEventListener('click', () => showPassageList(level));

      }, 'Quiz Results'); // <-- New Title Argument
  }
  // ------------------- END QUIZ LOGIC -------------------

  // ------------------- AUTH LOGIC (Updated to manage new views) -------------------

  // Toggle signup/login
  if (showSignup) showSignup.addEventListener('click', e => { e.preventDefault(); loginForm.style.display = 'none'; signupForm.style.display = 'block'; resetForm.style.display = 'none'; });
  if (showLogin) showLogin.addEventListener('click', e => { e.preventDefault(); signupForm.style.display = 'none'; loginForm.style.display = 'block'; resetForm.style.display = 'none'; });

  // Forgot password link: hide login & signup, show reset panel (replace login)
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      signupForm.style.display = 'none';
      document.getElementById('reset-username').value = '';
      document.getElementById('reset-password').value = '';
      document.getElementById('reset-password-confirm').value = '';
      resetForm.style.display = 'block';
    });
  }

  // Reset cancel: go back to login form
  if (resetCancel) {
    resetCancel.addEventListener('click', () => {
      resetForm.style.display = 'none';
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Signup
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value.trim();
    const gender = document.getElementById('gender').value;
    const grade = document.getElementById('grade').value.trim();
    const section = document.getElementById('section').value.trim();
    const school = document.getElementById('school-student').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPass = document.getElementById('signup-password-confirm').value;

    if (password !== confirmPass) {
        alert('⚠️ Passwords do not match.');
        return;
    }

    if (!fullname || !gender || !grade || !section || !school || !username || !password) {
      alert('⚠️ Please complete all fields.');
      return;
    }
    if (password.length < 8) {
      alert('⚠️ Password must be at least 8 characters.');
      return;
    }
    if (localStorage.getItem(`user:${username}`)) {
      alert('⚠️ This username is already taken. Choose another one.');
      return;
    }

    const userObj = { fullname, gender, grade, section, school, username, password, role: 'student' };
    localStorage.setItem(`user:${username}`, JSON.stringify(userObj));
    alert('✅ Account created. Please log in.');
    signupForm.reset();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Login
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const stored = JSON.parse(localStorage.getItem(`user:${username}`) || 'null');
    if (!stored) {
      alert('⚠️ Username not recognized. Please create an account first.');
      return;
    }
    if (stored.password !== password) {
      alert('❌ Incorrect password.');
      return;
    }
    // login success
    currentUser = stored;
    authCard.style.display = 'none';
    homepage.style.display = 'flex'; // Use flex to maintain dashboard layout
    welcomeText.textContent = `Welcome, ${currentUser.fullname.split(' ')[0]}!`;
    welcomeText.style.display = 'block'; // Show welcome message in header
    
    // Set initial view to folders
    folderView.style.display = 'block';
    contentDetailView.style.display = 'none';
    contentArea.innerHTML = `<div class="placeholder"><h3><i class="fas fa-rocket"></i> Ready to Launch?</h3><p>Select a folder to start your reading adventure!</p></div>`;

    setupFolders(); // Initialize all folders now that the user is logged in
  });

  // Reset password submission logic (Kept from original)
  resetForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const newPass = document.getElementById('reset-password').value;
    const confirmPass = document.getElementById('reset-password-confirm').value;

    if (!username || !newPass || !confirmPass) {
      alert('⚠️ Please complete all fields.');
      return;
    }
    if (newPass.length < 8) {
      alert('⚠️ Password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('⚠️ Passwords do not match. Please try again.');
      return;
    }

    const storedRaw = localStorage.getItem(`user:${username}`);
    if (!storedRaw) {
      alert('⚠️ Username not found. Check the username or create an account.');
      return;
    }

    try {
      const userObj = JSON.parse(storedRaw);
      userObj.password = newPass;
      localStorage.setItem(`user:${username}`, JSON.stringify(userObj));
      alert('✅ Password successfully changed. Please log in with your new password.');
      resetForm.reset();
      resetForm.style.display = 'none';
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    } catch (err) {
      console.error('Error updating password:', err);
      alert('❌ An unexpected error occurred. Try again.');
    }
  });

  // Logout
  menuLogout.addEventListener('click', () => {
    currentUser = null;
    homepage.style.display = 'none';
    authCard.style.display = 'block';
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    resetForm.style.display = 'none';
    hamburgerMenu.style.display = 'none';
    welcomeText.style.display = 'none'; // Hide welcome message in header
    showCatchyLine(); // Show catchy line again on logout
  });

  // Hamburger and menu actions
  hamburger.addEventListener('click', () => {
    hamburgerMenu.style.display = hamburgerMenu.style.display === 'flex' ? 'none' : 'flex';
  });

  if (menuProfileBtn) {
    menuProfileBtn.addEventListener('click', () => {
      hamburgerMenu.style.display = 'none';
      showProfile();
    });
  }
  if (menuAboutBtn) {
    menuAboutBtn.addEventListener('click', () => {
      hamburgerMenu.style.display = 'none';
      aboutModal.classList.add('active');
      aboutModal.setAttribute('aria-hidden', 'false');
    });
  }

  const aboutClose = document.getElementById('close-about');
  if (aboutClose) aboutClose.addEventListener('click', () => { aboutModal.classList.remove('active'); aboutModal.setAttribute('aria-hidden', 'true'); });
  const aboutCloseBtn = document.getElementById('about-close-btn');
  if (aboutCloseBtn) aboutCloseBtn.addEventListener('click', () => { aboutModal.classList.remove('active'); aboutModal.setAttribute('aria-hidden', 'true'); });

  // Close menu/modal when clicking outside
  document.addEventListener('click', (e) => {
    if (aboutModal.classList.contains('active') && !aboutModal.querySelector('.modal-content').contains(e.target) && e.target !== menuAboutBtn) {
      aboutModal.classList.remove('active');
      aboutModal.setAttribute('aria-hidden', 'true');
    }
    if (!hamburger.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      hamburgerMenu.style.display = 'none';
    }
  });

  // Profile (Updated with new transition)
  function showProfile() {
    if (!currentUser) {
      alert('Please log in first.');
      return;
    }
    transitionContent(() => {
        const clone = profileTemplate.content.cloneNode(true);
        contentArea.innerHTML = '';
        contentArea.appendChild(clone);
        const nameEl = document.getElementById('profile-name');
        const genEl = document.getElementById('profile-gender');
        const userEl = document.getElementById('profile-username');
        const groupEl = document.getElementById('profile-group');
        const schoolEl = document.getElementById('profile-school-info');
        if (nameEl) nameEl.textContent = currentUser.fullname;
        if (genEl) genEl.textContent = currentUser.gender;
        if (userEl) userEl.textContent = currentUser.username;
        if (groupEl) groupEl.textContent = `${currentUser.grade}-${currentUser.section}`;
        if (schoolEl) schoolEl.textContent = currentUser.school;
        loadRecordsIntoTable(currentUser.username);
        const backBtn = document.getElementById('profile-back');
        if (backBtn) backBtn.addEventListener('click', () => {
          // Simulate clicking the back button to show folders
          if (backToFoldersBtn) backToFoldersBtn.click();
        });
    }, '👤 Profile & Records'); // <-- New Title Argument
  }
  
  // Back Button Logic - NEW
  if (backToFoldersBtn) {
    backToFoldersBtn.addEventListener('click', () => {
      contentDetailView.style.display = 'none';
      folderView.style.display = 'block';
      // Reset content area to the inner placeholder message
      contentArea.innerHTML = `<div class="placeholder"><h3><i class="fas fa-rocket"></i> Ready to Launch?</h3><p>Select a folder to start your reading adventure!</p></div>`;
    });
  }


  // Initial folder setup (in case of cached login state, though standard flow handles it after login)
  if (currentUser) {
      setupFolders();
  }
})();