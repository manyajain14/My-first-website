/* ============================================================
   The Midnight Library — the life engine
   Matches whatever you wished to be with a borrowed life,
   then writes it as a small journal: four chapters + a whisper.
   Plain data + functions; no DOM here, so it also runs in Node.
   ============================================================ */
var LivesEngine = (function () {
  "use strict";

  var CHAPTER_HEADINGS = [
    "Chapter I — The Door Opens",
    "Chapter II — The Life Itself",
    "Chapter III — The Small Cracks",
    "What the Library Whispered"
  ];

  var ROMAN_VOLUMES = ["I", "II", "III"];

  /* ----------------------------------------------------------
     Each archetype: keywords matched against your wish,
     neighbouring shelves to browse when this one is taken,
     and four chapters written around {name}, {age} and {wish}.
     ---------------------------------------------------------- */
  var ARCHETYPES = [
    {
      id: "idol",
      role: "a pop idol with your face on every billboard",
      title: "The Spotlight Life",
      tagline: "Twenty thousand lightsticks, humming your name.",
      colors: ["#7c3aed", "#db2777"],
      keywords: ["k-pop", "kpop", "k pop", "pop idol", "idol", "singer", "sing", "musician", "rockstar", "rock star", "band", "songwriter", "rapper", "dancer-singer"],
      neighbors: ["creator", "actor", "dancer"],
      chapters: [
        function (c) { return "The practice room smells of cold coffee and floor polish. Somewhere above you, twenty thousand lightsticks are already humming, and the choreographer is counting you in — five, six, seven, eight. In this life, " + c.name + ", your voice is the song strangers cry to at two in the morning. Tonight, for the first time, you let yourself hear it."; },
        function (c) { return "Debut comes like weather — sudden, enormous, beyond appeal. Music shows, fan signs, a face on a billboard you once walked beneath on your way to somewhere ordinary. At " + c.age + ", in the other ledger of your life, you hummed in the shower and told no one. Here, the whole country knows the bridge by heart, and teenagers ink your name into notebook margins. There is a version of fame that feels like being hugged by an entire city."; },
        function (c) { return "But the schedule is a contract written in sleeplessness. Four hours of sleep, then cameras; a song you wrote shelved for one focus groups liked more; your mother aging on a phone screen. The comment section knows your waistline, your dating life, your grief. Some nights the applause stops, and the silence is so loud you can hear the practice room again, asking why you started."; },
        function (c) { return "Applause is real, and so is the silence after it. The library does not ask you to stop singing. It asks whether you sang because the song was yours — or because the dark needed proof. Bring the answer home with you; it is worth more than any trophy on this shelf."; }
      ]
    },

    {
      id: "doctor",
      role: "a doctor whose white coat fits like destiny",
      title: "The White-Coat Life",
      tagline: "The envelope opened differently here.",
      colors: ["#0ea5e9", "#10b981"],
      keywords: ["doctor", "neet", "mbbs", "physician", "surgeon", "medical", "medic", "nurse", "psychiatrist", "dentist", "vet"],
      neighbors: ["scientist", "teacher", "marine"],
      chapters: [
        function (c) { return "The corridor is longer than memory, and it smells of antiseptic and rain. White coat, stethoscope, a name badge spelled correctly on the first try. In this life, the envelope opened differently. In this life, the rank existed — and it was enough."; },
        function (c) { return "MBBS first: anatomy labs at midnight, the first suture you ever placed — trembling, and perfect. Then the wards: rounds at dawn, charts at midnight, the senior who tosses you the keys to your first solo emergency. At " + c.age + ", in the life you know, you measured your worth in marks out of seven hundred and twenty. Here you are measured in heartbeats returned. The first patient who calls you “doctor” is sixty years old and crying. So are you."; },
        function (c) { return "Yet the night shifts accumulate like snow. A patient you could not save sits behind your eyes for years. Festivals happen in the cafeteria between codes. And sometimes, washing your hands for the hundredth time, you wonder whose dream this was — yours, or everyone else’s idea of one."; },
        function (c) { return "A rank is a door, not a verdict. The same hands that held the pen hold everything else you love. The library whispers: heal boldly — and leave the doorway open behind you, so the child who first dreamed this can walk through as herself."; }
      ]
    },

    {
      id: "engineer",
      role: "an engineer from the institute everyone dreams of",
      title: "The Rank-List Life",
      tagline: "The exam went your way the first time.",
      colors: ["#1d4ed8", "#06b6d4"],
      keywords: ["engineer", "engineering", "iit", "jee", "nit", "coder", "programmer", "software", "tech", "computer", "developer", "data scientist", "ai"],
      neighbors: ["scientist", "creator", "pilot"],
      chapters: [
        function (c) { return "The hostel room smells of solder, instant noodles and ambition. On the notice board hangs a rank list — and somewhere near the top, your name. In this life, the exam went your way. The letter arrived, and the whole house wept with pride."; },
        function (c) { return "The campus is banyan trees and all-nighters. You learn to debug at three in the morning, to present to rooms full of people cleverer than you, and to fail a test and survive it. Placement season arrives; the offer letter carries a number that makes your father’s shoulders drop with relief. Years later your code runs quietly in places you will never visit, moving money, medicine and messages — like very good plumbing."; },
        function (c) { return "But impostor syndrome is a roommate who never moves out. Batchmates seem born knowing things you had to bleed for. Some evenings you scroll the profiles of school friends — the ones who never went to coaching — and wonder whether the rank bought you a ladder or a cage. The question follows you like a shadow: did you choose this, or did it choose you?"; },
        function (c) { return "The library knows every rank list ends at the same address. Nothing here can rank the patience you show, the problems you untangle for friends at midnight, the way you keep learning when nobody grades you. Doors open by ranks; lives open by character."; }
      ]
    },

    {
      id: "scientist",
      role: "a scientist chasing one beautiful question",
      title: "The Whiteboard Life",
      tagline: "The graph matches the theory on a Tuesday.",
      colors: ["#4338ca", "#8b5cf6"],
      keywords: ["scientist", "science", "research", "researcher", "physicist", "chemist", "biologist", "mathematician", "professor", "astrophysics", "quantum", "nasa", "isro"],
      neighbors: ["doctor", "astronaut", "engineer"],
      chapters: [
        function (c) { return "The lab hums at two in the morning, the freezer’s small compressor counting time like a metronome. The whiteboard is dense with symbols only three people on Earth read for pleasure. In this life, " + c.name + ", you are one of them."; },
        function (c) { return "Grants, journals, conferences in cities you half-sightsee. Then the Tuesday everything turns: the graph matches the theory, the cells do exactly what the model said, and you sit alone in the glow of a result no one else has ever seen. It is a small thing, honest and enormous. Decades of wrong guesses collapse into one clean line. At " + c.age + ", in the other ledger of your life, you had begun to believe curiosity was a luxury. Here it is your salary."; },
        function (c) { return "But science pays in delayed answers. Papers rejected, experiments that simply refuse, funding that evaporates between fiscal years. Colleagues leave for industries that glitter. Some winters you defend the value of knowing a little more about almost nothing, and your voice shakes while you do it."; },
        function (c) { return "Curiosity is the one career that never fires you — it only waits. The library asks nothing grand: keep one question alive in your ordinary life, and feed it ten minutes a day. Discovery is a habit long before it is a headline."; }
      ]
    },

    {
      id: "actor",
      role: "an actor or model the cameras adore",
      title: "The Flashbulb Life",
      tagline: "“Again — but sadder.”",
      colors: ["#be185d", "#f59e0b"],
      keywords: ["actor", "actress", "model", "film", "bollywood", "hollywood", "cinema", "movie", "movies", "drama", "theatre", "theater", "influencer-model", "star"],
      neighbors: ["idol", "creator", "artist"],
      chapters: [
        function (c) { return "The casting director looks over the top of her glasses. “Again,” she says, “but sadder.” In this life, " + c.name + ", the camera loves you the way weather loves a field — completely, and for a season."; },
        function (c) { return "Auditions turn to callbacks, callbacks to a debut, a debut to a billboard over the highway you used to walk beneath. The shutter clicks like a metronome; stylists, premieres, flashbulbs stitching your name into the skyline. Fans draw you in the margins of their notebooks. Strangers feel they know you, which is flattering and faintly false."; },
        function (c) { return "There is a binder somewhere labeled only with a date — every “no” you ever heard. Roles you took to pay rent. Friends who loved the poster, not the person. And always the quiet arithmetic of a face that changes on schedule. Some mornings you pass a mirror and negotiate with it."; },
        function (c) { return "Cameras adored you here. Notice how few of them asked how you were. The library’s whisper: you were interesting long before you were visible — and you will remain so long after the last flash. Carry the person off-set; the image can stay."; }
      ]
    },

    {
      id: "athlete",
      role: "an athlete the stadium chants for",
      title: "The Starting-Block Life",
      tagline: "Forty thousand throats shape your name.",
      colors: ["#b45309", "#dc2626"],
      keywords: ["athlete", "sport", "cricket", "cricketer", "football", "footballer", "olympic", "runner", "player", "chess", "badminton", "tennis", "boxer", "swimmer", "gymnast", "archer", "kabaddi", "hockey"],
      neighbors: ["dancer", "idol", "pilot"],
      chapters: [
        function (c) { return "The stadium holds its breath. Forty thousand throats shape your name, and in this life it does not crack. The starting blocks are cold. You have never been more awake."; },
        function (c) { return "Training at dawn, ice baths, the coach’s whistle like a second heartbeat. Season after season the numbers bend upward until the record board carries your surname. The medal hangs heavy and right. At " + c.age + ", in the ledger you know, you watched finals on a small screen and imagined the roar. Here, you are the reason for it."; },
        function (c) { return "Then the knee goes in the quarter-final, quietly, like a door closing. Rehab is a religion without miracles. You return slower; younger bodies orbit you; the crowd still claps, but it is saying goodbye in advance. The day you retire, the stadium is full — and you are not sure which of you is the one being celebrated."; },
        function (c) { return "Your body keeps the score of every life you refused to live inside it. The library whispers: strength is not the absence of fracture — it is what you build around it. Rest is training too."; }
      ]
    },

    {
      id: "writer",
      role: "a writer whose sentences strangers underline",
      title: "The Manuscript Life",
      tagline: "The rejection letters stopped. One said yes.",
      colors: ["#92400e", "#d97706"],
      keywords: ["writer", "author", "poet", "poetry", "novel", "novelist", "book", "books", "story", "stories", "blogger", "journalist", "screenwriter"],
      neighbors: ["teacher", "creator", "artist"],
      chapters: [
        function (c) { return "A desk, a window, a manuscript thick as a brick. The rejection letters stop; the acceptance letter has a stamp on it. In this life, " + c.name + ", the world agreed to read what you had to say."; },
        function (c) { return "Publication at twenty-six. Launch events with wine you cannot afford; letters from strangers saying your sentences kept them company on night trains. You learn the monk’s discipline of the empty page and the strange immortality of seeing your name on a spine. Reviews are mixed, sales are decent, and one reader writes that she rereads you “like weather.” At " + c.age + ", in the ordinary ledger, your notebooks stayed private. Here, they paid the rent."; },
        function (c) { return "But the second book terrifies you — every sentence auditions for its predecessor. Deadlines eat whole seasons. Sometimes you write what sells and find your real question buried at the bottom of a drawer. Success, you discover, has its own blank page."; },
        function (c) { return "You have already survived a thousand endings on paper. The one life that genuinely needs your unfinished drafts is your own. The library whispers: keep a notebook — for nobody. That is where the truth lives."; }
      ]
    },

    {
      id: "entrepreneur",
      role: "the founder whose napkin sketch became a skyline",
      title: "The Corner-Office Life",
      tagline: "A garage, one chair, infinite ambition.",
      colors: ["#0f766e", "#ca8a04"],
      keywords: ["business", "entrepreneur", "startup", "ceo", "founder", "millionaire", "billionaire", "richest", "rich", "money", "tycoon", "brand", "company", "owner"],
      neighbors: ["chef", "artist", "engineer"],
      chapters: [
        function (c) { return "The garage has one chair, a secondhand server, and ambition enough for a skyline. In this life, the pitch lands, the money flows, and the logo you sketched on a napkin learns to fly."; },
        function (c) { return "Growth like weather: offices, offshore teams, magazine covers, a number with commas. The magazine calls you “visionary,” which means nobody can explain what you do. You buy the car, then the building; you give your parents the house with the garden. People say you made it, and for a while you agree."; },
        function (c) { return "But birthdays happen on conference calls. Friends become employees, then memories. The penthouse at midnight is very quiet, and wealth, you discover, is excellent at keeping score and useless at keeping company. You begin to wonder which version of yourself got left behind in the garage."; },
        function (c) { return "Wealth is a key, not a room. The library asks only that you remember which doors you would rather unlock — and that some of them never required money. A napkin dream is still a dream; do not move out of it entirely."; }
      ]
    },

    {
      id: "chef",
      role: "a chef whose kitchen feeds a whole city’s heart",
      title: "The Brigade Life",
      tagline: "Ninety degrees, and perfectly calm.",
      colors: ["#c2410c", "#eab308"],
      keywords: ["chef", "cook", "cooking", "baker", "bakery", "food", "restaurant", "culinary", "barista", "hotel management"],
      neighbors: ["artist", "entrepreneur", "marine"],
      chapters: [
        function (c) { return "The kitchen is ninety degrees and perfectly calm. In this life, " + c.name + ", your hands feed people — and someone, eventually, wrote a star next to your name."; },
        function (c) { return "Stations first: garde manger, poissonnier, the brigade shouting in a language you learned like love. Then your own kitchen, your own menu, the critic’s quiet nod, the star. The signature dish — the one with your grandmother’s spice ratio — becomes the reservation people make for anniversaries, proposals, forgiven grudges."; },
        function (c) { return "But burns map your forearms; holidays vanish into dinner service; the staff meal is the only family dinner left. One night you plate forty covers and realize you have not sat at a table in weeks — eating slowly, in the company of someone you love."; },
        function (c) { return "Feeding people is holy work; the library insists you are allowed to be fed as well. Set a place for yourself at your own table. Some recipes only work shared."; }
      ]
    },

    {
      id: "artist",
      role: "an artist whose work outlives the market",
      title: "The North-Light Life",
      tagline: "The gallery called first.",
      colors: ["#a21caf", "#ec4899"],
      keywords: ["artist", "art", "painter", "painting", "designer", "design", "fashion", "illustrator", "sculptor", "architecture", "architect", "photographer", "photography", "makeup", "interior"],
      neighbors: ["actor", "writer", "creator"],
      chapters: [
        function (c) { return "The studio has north light and the smell of turpentine. In this life, the gallery called first. Your canvases hang in rooms where people instinctively lower their voices."; },
        function (c) { return "Years of sketchbooks finally resolve into a voice — yours, unmistakable. The dress you draped on a Friday is photographed on a Saturday, and by Sunday it exists in a hundred languages. Commissions arrive; your style is imitated, argued about, credited. At " + c.age + ", in the ledger you know, you were told art is a hobby. Here it is your address."; },
        function (c) { return "Yet commercial work crowds out the canvas nobody buys. Deadlines flatten your questions into deliverables. Some months you catch yourself making for the market what you once made for the mirror. A mural gets painted over for a billboard. The billboard is for a bank."; },
        function (c) { return "Everything beautiful you made still exists somewhere, permanently. So do you — and both need daylight. The library’s whisper: protect one uncommissioned hour a week. That is the studio the market cannot gentrify."; }
      ]
    },

    {
      id: "astronaut",
      role: "an astronaut holding the whole world in attention",
      title: "The Blue-Marble Life",
      tagline: "Thirty kilograms of suit, and it feels like a hug.",
      colors: ["#1e3a8a", "#0ea5e9"],
      keywords: ["astronaut", "space", "mars", "moon", "cosmos", "galaxy", "star", "stars", "orbit", "rocket", "spacex", "alien"],
      neighbors: ["scientist", "pilot", "engineer"],
      chapters: [
        function (c) { return "The suit weighs thirty kilograms and feels, strangely, like a hug. Through the small window, the Earth is doing that impossible thing it does — glowing, defenseless, whole. In this life, " + c.name + ", humanity lent you its eyes."; },
        function (c) { return "Training: centrifuge spins, underwater rigs, exams in three languages. Then the ride up — eight minutes of controlled thunder — and suddenly your coffee floats. From orbit, borders vanish; wars look like weather. The first spacewalk lasts six hours and quietly reorders your atoms. Back home, children write to ask what it is like to hold the Moon in your attention."; },
        function (c) { return "But the years are simulations and goodbyes. Family milestones arrive through a delay-lagged screen. Gravity returns heavier than before — literally, and otherwise. Some nights you dream of the blue marble and wake guilty for having left it at all."; },
        function (c) { return "From far enough away, every border disappears; from close enough, so does every grudge. The library asks you to carry one of those distances home. Perspective, luckily, is a reusable rocket."; }
      ]
    },

    {
      id: "dancer",
      role: "a dancer whose body speaks in fluent music",
      title: "The Barre Life",
      tagline: "The program prints your name beside the lead.",
      colors: ["#9d174d", "#c084fc"],
      keywords: ["dance", "dancer", "ballet", "choreographer", "choreography"],
      neighbors: ["athlete", "idol", "actor"],
      chapters: [
        function (c) { return "The barre is worn smooth by generations of hands. In this life, your body is fluent — and the program with your name beside the lead role is printed in four languages."; },
        function (c) { return "Years of six-in-the-morning stretches, of counting music like prayer, resolve into the principal role. Curtain calls stack like offerings; your turnout gets mentioned in reviews; a girl in the corps watches you the way you once watched someone. At " + c.age + ", in the ledger you know, dance was the thing behind the door you closed. Here, the door never shut."; },
        function (c) { return "But ankles negotiate their own contracts. Mirrors grow candid with age; the body retires its chairs earlier than the heart. The farewell performance sells out, and halfway through you understand they are applauding your past tense."; },
        function (c) { return "Dance has no alphabet and no retirement. The library whispers: move where you are — kitchen, hallway, monsoon. The music does not check your credentials."; }
      ]
    },

    {
      id: "teacher",
      role: "a teacher remembered decades later",
      title: "The Chalk-Dust Life",
      tagline: "They remember you in rooms you’ll never enter.",
      colors: ["#166534", "#84cc16"],
      keywords: ["teacher", "teach", "teaching", "professor", "school", "coach", "mentor", "tuition"],
      neighbors: ["writer", "doctor", "scientist"],
      chapters: [
        function (c) { return "Chalk dust in the afternoon light, thirty-two chairs, one bell. In this life, " + c.name + ", they remember you — decades later, in rooms you will never enter."; },
        function (c) { return "Not fame, but frequency: the lesson that catches a student at the exact angle of her doubt; the boy who returns at twenty-five to say you were the first person who believed he could. You teach long enough to teach the children of your students. Your name ends up in speeches you were never invited to hear."; },
        function (c) { return "Yet the salary is modest and the paperwork mountainous. The poems you meant to write become lesson plans. Some years the system makes you feel like a clerk of other people’s potential, and one evening you wonder aloud whether anyone will ever remember yours."; },
        function (c) { return "Most legacies are quiet, and the loudest ones never know them. The library whispers: you planted in soil you will not see harvested. That is not a loss — that is exactly how orchards work."; }
      ]
    },

    {
      id: "creator",
      role: "a creator the internet invites into its pockets",
      title: "The Ring-Light Life",
      tagline: "Upload complete. A million people are watching.",
      colors: ["#dc2626", "#7c3aed"],
      keywords: ["youtuber", "youtube", "streamer", "twitch", "gamer", "gaming", "esports", "influencer", "vlogger", "podcast", "content", "tiktok", "reels", "video", "anchor", "rj ", "radio"],
      neighbors: ["idol", "actor", "writer"],
      chapters: [
        function (c) { return "Ring light on, thumbnail ready, the upload bar filling like a thermometer. In this life, the internet knows your face before your neighborhood does."; },
        function (c) { return "The first video breaks; the channel compounds. A million subscribers, brand deals, fan art, convention panels where people queue for your hand. You turn the hobby that lived in your bedroom into a livelihood, then something like an empire — employees, a studio, a flag on the lawn. At " + c.age + ", in the ledger you know, you were told to log off and study. Here, the screen studied you back."; },
        function (c) { return "But the algorithm is a landlord who can evict overnight. The comments section glows like a city at three in the morning; privacy becomes a premium subscription. Friends get measured in collaborations. One day you realize you have performed your life for so long that the unrecorded moments feel somehow less real."; },
        function (c) { return "Attention is rented, never owned. The library asks you to build something no one can unsubscribe from: your own regard. Log off and touch grass — the world uploads nothing, yet keeps everything."; }
      ]
    },

    {
      id: "marine",
      role: "a marine biologist with salt on your sleeves",
      title: "The Tidal Life",
      tagline: "Your patients have scales, shells, or silence.",
      colors: ["#155e75", "#2dd4bf"],
      keywords: ["marine biologist", "marine", "ocean", "animal", "animals", "veterinary", "vet ", "wildlife", "zoo", "zookeeper", "dolphin", "whale", "turtle", "shark", "dog", "cats", "pet", "bird"],
      neighbors: ["scientist", "chef", "astronaut"],
      chapters: [
        function (c) { return "Salt on your sleeves, diesel in the wind, the research vessel doing its slow drumbeat against the swell. In this life, " + c.name + ", your patients have scales, shells, or silence."; },
        function (c) { return "Tagging the turtle who outswims empires; the rescue calf that nurses at your hand; the reef census that proves, against all lobbying, that the ocean is warming. Grants are scarce; the work is wet; the data outlives the funding. Every spring you migrate like the animals you study, and the calendar is written in currents."; },
        function (c) { return "Storms cancel whole seasons; politics cancels studies; some species you counted in your twenties exist now only in your spreadsheets. There are nights on deck when the size of the problem and the smallness of your boat negotiate a rough, tender peace."; },
        function (c) { return "The ocean does not hurry, and neither does healing. The library whispers: depth over speed. You are allowed to be a creature who takes her time."; }
      ]
    },

    {
      id: "pilot",
      role: "a pilot for whom sunrise happens above the clouds",
      title: "The Cockpit Life",
      tagline: "Runway lights, like a sentence you get to finish.",
      colors: ["#334155", "#38bdf8"],
      keywords: ["pilot", "aviation", "fly", "flying", "airline", "air hostess", "airport", "captain"],
      neighbors: ["astronaut", "entrepreneur", "engineer"],
      chapters: [
        function (c) { return "The cockpit glows amber in the pre-dawn dark. Runway lights unspool ahead like a sentence you get to finish. In this life, " + c.name + ", the sky is your workplace — and you are very good at it."; },
        function (c) { return "First solo while the world was still in bed. Thousands of landings across monsoons and clear winter dawns; sunrises above the cloud layer that photographs have never once captured honestly. The uniform carries a quiet respect; strangers go still at parties when you mention what you fly."; },
        function (c) { return "But hotels blur into one another; birthdays happen over the intercom; the bed at home is a frequent-guest room you visit between sectors. Some arrivals, the city below is so beautiful it aches — and you will be asleep there in four hours."; },
        function (c) { return "Every landing is a small decision to come back. The library asks: keep deciding — and put down roots deep enough to land in. A life aloft needs gravity too."; }
      ]
    }
  ];

  /* The shelf always holds one special volume:
     the life in which everything simply… went right. */
  var UNBROKEN = {
    id: "unbroken",
    role: "the version of you that everything went right for",
    title: "The Life That Never Doubted",
    tagline: "One book has no author photograph.",
    colors: ["#713f12", "#fbbf24"],
    keywords: [],
    neighbors: [],
    chapters: [
      function (c) { return "One book on this shelf has no author photograph. It is the life in which the letter said yes at eighteen, the door opened early, and doubt — that small grey roommate — never moved in. The librarian slides it toward you without a word."; },
      function (c) { return "Read it luxuriously. The exam went your way the first time. The love stayed. The career climbed like a staircase with good lighting. Applause, comfort, the respect of everyone whose opinion you were raised to fear. For a while it gleams like a harbor."; },
      function (c) { return "Then, around the fifth chapter, a quiet strangeness: a museum feeling. Success without resistance has no grip; comfort without contrast is a room with no echoes. You realize, with a chill, that you have begun to miss the old grey roommate — doubt, whose nagging used to push you toward everything real. Perfection, it turns out, grows bored of itself."; },
      function (c) { return "Even perfection grows tired of being perfect. A life without resistance is a violin string with nothing to pluck. You do not need a flawless life; you need your life — the one with the beautiful fractures. Close this book gently. The librarian is already holding the door to what comes next."; }
    ]
  };

  /* When the library cannot name your wish, it writes it verbatim
     into the journal anyway — every wanting deserves a door. */
  var GENERIC = {
    id: "generic",
    role: "the life you described, in your own words",
    title: "The Life You Named",
    tagline: "Whatever you asked for, this is its door.",
    colors: ["#3730a3", "#7c3aed"],
    keywords: [],
    neighbors: [],
    chapters: [
      function (c) { return "You told the library, plainly, what you wanted: “" + c.wish + ".” The librarian wrote it down in a hand older than ink, then led you to a door you had somehow walked past every single day of your life."; },
      function (c) { return "On the other side, it is all true. The mornings belong to it; the skills are settled in your hands; the people who matter recognize you for it. " + c.name + ", at " + c.age + ", you carried the wanting so long it became furniture. Here, the wanting is the architecture. Notice how natural competence feels after a decade of practice — like breathing with the windows open."; },
      function (c) { return "And yet — every life has its own small weather. There are evenings when the dream asks more of you than you planned to give, when you miss the strange mercy of wanting something you cannot have. Even answered prayers grow mouths."; },
      function (c) { return "The library never promised a flawless life; it only lends lives, like books. This one is yours for a while — read it gently, take what is useful, dog-ear nothing. The shelf is patient, and so are you."; }
    ]
  };

  /* ------------------------- matching ------------------------- */

  function scoreKeywords(keywords, text) {
    var t = (" " + text.toLowerCase() + " ");
    var score = 0;
    for (var i = 0; i < keywords.length; i++) {
      var k = keywords[i].toLowerCase();
      if (t.indexOf(k) !== -1) {
        score += k.length >= 5 ? 2 : 1;
      }
    }
    return score;
  }

  function byId(id) {
    for (var i = 0; i < ARCHETYPES.length; i++) {
      if (ARCHETYPES[i].id === id) return ARCHETYPES[i];
    }
    return null;
  }

  function pickSecondary(primary, wish) {
    // Best neighbour by wish relevance; else the top-scoring stranger.
    if (primary && primary.neighbors && primary.neighbors.length) {
      var best = null, bestScore = 0;
      for (var i = 0; i < primary.neighbors.length; i++) {
        var cand = byId(primary.neighbors[i]);
        if (!cand || cand.id === primary.id) continue;
        var s = scoreKeywords(cand.keywords, wish);
        if (s > bestScore) { bestScore = s; best = cand; }
      }
      if (best) return best;
      return byId(primary.neighbors[0]);
    }
    // Generic primary: choose by the letters of the wish, deterministically.
    var idx = (wish.length * 7 + 3) % ARCHETYPES.length;
    return ARCHETYPES[idx];
  }

  function build(name, age, wish) {
    var ctx = { name: name, age: age, wish: wish };

    var scored = ARCHETYPES.map(function (a) {
      return { a: a, s: scoreKeywords(a.keywords, wish) };
    }).sort(function (x, y) { return y.s - x.s; });

    var primary = scored[0].s > 0 ? scored[0].a : GENERIC;
    var secondary = pickSecondary(primary, wish);

    // Never show the same shelf twice.
    if (secondary.id === primary.id) {
      secondary = ARCHETYPES[(scored[0].s + 5) % ARCHETYPES.length];
    }

    var picks = [primary, secondary, UNBROKEN];

    return picks.map(function (life, i) {
      return {
        id: life.id,
        volume: ROMAN_VOLUMES[i],
        role: life.role,
        title: life.title,
        tagline: life.tagline,
        colors: life.colors,
        chapters: life.chapters.map(function (fn) { return fn(ctx); })
      };
    });
  }

  /* ------------------------- epilogue ------------------------- */

  function epilogue(name, age) {
    return [
      name + ". You were " + age + " years old when you stepped into the midnight of your own becoming. Three lives you borrowed, and each of them handed you something: the spotlight’s truth, another road’s weather, and a perfect life’s small emptiness.",
      "The books are closing now. The stars are going back to being stars. Somewhere behind you, all those doors are shutting softly — not in refusal, but in recognition.",
      "The library was never trying to sell you another life. It was trying to hand you back your own. However ordinary it seems, however interrupted — this is the one life in which your presence is irreplaceable. The most perfect role you will ever play, in any library in any universe, is you.",
      "Take it."
    ];
  }

  return {
    build: build,
    chapterHeadings: CHAPTER_HEADINGS,
    epilogue: epilogue
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = LivesEngine;
}
