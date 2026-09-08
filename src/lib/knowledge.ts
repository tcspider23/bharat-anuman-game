// Curated Indian knowledge base.
// Each personality has traits used by the questioning engine.
// Traits are a mix of boolean and categorical fields used by predicate-based questions.

export type Category =
  | "cricket"
  | "bollywood"
  | "sports"
  | "music"
  | "business"
  | "entertainment"
  | "famousIndia";

export const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: "cricket", label: "Cricket", emoji: "🏏", color: "#138808" },
  { id: "rapid", label: "Rapid", emoji: "⚡", color: "#e23e57" } as never,
  { id: "bollywood", label: "Bollywood", emoji: "🎬", color: "#ff9933" },
  { id: "famousIndia", label: "Famous India", emoji: "🌟", color: "#f7c948" },
  { id: "sports", label: "Sports", emoji: "🏆", color: "#c62841" },
  { id: "music", label: "Music", emoji: "🎤", color: "#5b5494" },
  { id: "business", label: "Business", emoji: "💼", color: "#0b1f4d" },
  { id: "entertainment", label: "Entertainment", emoji: "🎭", color: "#ff6ec7" },
  { id: "challenge", label: "Challenge", emoji: "🧠", color: "#8b5cf6" } as never,
  { id: "surprise", label: "Surprise Me", emoji: "🎲", color: "#14b8a6" } as never,
  { id: "mixed", label: "Mixed", emoji: "🌍", color: "#ff9933" } as never,
];

export const GAME_MODES = [
  { id: "cricket", label: "Cricket", emoji: "🏏", desc: "Only Indian cricketers" },
  { id: "rapid", label: "Rapid", emoji: "⚡", desc: "Fewer questions, max info" },
  { id: "bollywood", label: "Bollywood", emoji: "🎬", desc: "Cinema personalities" },
  { id: "famousIndia", label: "Famous India", emoji: "🌟", desc: "Any famous Indian" },
  { id: "sports", label: "Sports", emoji: "🏆", desc: "All Indian sports" },
  { id: "music", label: "Music", emoji: "🎤", desc: "Singers & musicians" },
  { id: "business", label: "Business", emoji: "💼", desc: "Founders & leaders" },
  { id: "entertainment", label: "Entertainment", emoji: "🎭", desc: "Creators, TV, actors" },
  { id: "challenge", label: "Challenge", emoji: "🧠", desc: "Harder, fewer hints" },
  { id: "surprise", label: "Surprise Me", emoji: "🎲", desc: "Random real category" },
  { id: "mixed", label: "Mixed", emoji: "🌍", desc: "Everything" },
] as const;

export type GameModeId = (typeof GAME_MODES)[number]["id"];

export type Personality = {
  id: string;
  name: string;
  category: Category;
  profession: string;
  gender: "male" | "female";
  living: boolean;
  era: "historical" | "freedom" | "modern" | "contemporary";
  emoji: string;
  famousFor: string;
  achievements: string[];
  interestingFact: string;
  organization?: string;
  region?: string; // state or language
  traits: Record<string, boolean | string | number>;
  /** Expanded catalog entries retain category-aware traits while the curated base grows. */
  isCatalogProfile?: boolean;
};

// Trait keys used across all personalities (must be consistent):
// - isBatsman, isBowler, isAllRounder, isWicketkeeper, isCaptain, isIPLIcon, isWorldCupWinner
// - isActor, isActress, isDirector, isSinger, isMusicComposer, isPlayback
// - isFounder, isCEO, isTechLeader, isIndustrialist, isPolitician, isFreedomFighter, isScientist
// - isSportsperson, sport (string), isOlympian, isChampion
// - isYouTuber, isCreator, isTV, isRegional
// - isWriter, isPoet, isJournalist, isSocialWorker, isMilitary
// - award (string) - "bharatRatna" | "padmaVibhushan" | "padmaBhushan" | "filmfare" | "nationalAward" | "grammy" | "nobel" | "dronacharya" | "khelRatna" | "arjuna"
// - language (string) - "hindi" | "tamil" | "telugu" | "bengali" | "marathi" | "punjabi" | "malayalam" | "kannada" | "english"
// - bornDecade (number) - e.g. 1960, 1990

const P = (p: Personality): Personality => p;

export const KNOWLEDGE_BASE: Personality[] = [
  // ============ CRICKET ============
  P({ id: "sachin", name: "Sachin Tendulkar", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "God of Cricket, highest run-scorer", achievements: ["100 international centuries", "First to score a double century in ODIs", "Bharat Ratna 2014"], interestingFact: "Started cricket at age 11, debuted at 16 against Pakistan.", organization: "India", region: "Maharashtra", traits: { isBatsman: true, isCaptain: true, isIPLIcon: true, isWorldCupWinner: true, award: "bharatRatna", bornDecade: 1970 } }),
  P({ id: "virat", name: "Virat Kohli", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Modern batting maestro, aggressive captain", achievements: ["Fastest to 8000, 9000, 10000, 11000 ODI runs", "Led India to historic Test series wins", "Arjuna Award"], interestingFact: "Captained India in all three formats and is known for fitness.", organization: "India / RCB", region: "Delhi", traits: { isBatsman: true, isCaptain: true, isIPLIcon: true, award: "arjuna", bornDecade: 1980 } }),
  P({ id: "dhoni", name: "MS Dhoni", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Captain Cool, six to win 2011 World Cup", achievements: ["Won 2007 T20 WC, 2011 ODI WC, 2013 Champions Trophy", "Most successful Indian captain", "Padma Bhushan"], interestingFact: "Was a ticket collector before becoming captain of India.", organization: "India / CSK", region: "Jharkhand", traits: { isWicketkeeper: true, isCaptain: true, isIPLIcon: true, isWorldCupWinner: true, award: "padmaBhushan", bornDecade: 1980 } }),
  P({ id: "rohit", name: "Rohit Sharma", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Hitman, 3 ODI double centuries", achievements: ["Only batsman with 3 ODI double centuries", "Highest individual ODI score 264", "India's Test captain"], interestingFact: "Holds records for most double centuries in ODIs.", organization: "India / MI", region: "Maharashtra", traits: { isBatsman: true, isCaptain: true, isIPLIcon: true, bornDecade: 1980 } }),
  P({ id: "jadeja", name: "Ravindra Jadeja", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Sir Jadeja, top all-rounder", achievements: ["ICC Test All-rounder of the Year", "World Cup 2023 star"], interestingFact: "Also plays football and kabaddi at state level.", organization: "India / CSK", region: "Gujarat", traits: { isAllRounder: true, isIPLIcon: true, bornDecade: 1980 } }),
  P({ id: "bumrah", name: "Jasprit Bumrah", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Yorker king, unorthodox action", achievements: ["Test captain", "World No.1 ODI bowler"], interestingFact: "His unique action was spotted by a bowling coach watching a video game.", organization: "India / MI", region: "Gujarat", traits: { isBowler: true, isCaptain: true, isIPLIcon: true, bornDecade: 1990 } }),
  P({ id: "kohli", name: "KL Rahul", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Stylish batsman, wicketkeeper", achievements: ["Fastest ODI century by an Indian", "Test double century on debut series"], interestingFact: "Known for his elegant cover drives.", organization: "India", region: "Karnataka", traits: { isBatsman: true, isWicketkeeper: true, bornDecade: 1990 } }),
  P({ id: "dravid", name: "Rahul Dravid", category: "cricket", profession: "Cricketer / Coach", gender: "male", living: true, era: "modern", emoji: "🏏", famousFor: "The Wall, India's coach", achievements: ["10,000+ Test runs", "Coached India to WTC final 2023"], interestingFact: "Was called The Wall for his defensive technique.", organization: "India", region: "Karnataka", traits: { isBatsman: true, bornDecade: 1970 } }),
  P({ id: "ganguly", name: "Sourav Ganguly", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "modern", emoji: "🏏", famousFor: "Dada, BCCI President", achievements: ["Led India to 2003 World Cup final", "Revived Indian cricket abroad"], interestingFact: "Famous for waving his shirt at the Lords balcony.", organization: "India", region: "Bengal", traits: { isBatsman: true, isCaptain: true, bornDecade: 1970 } }),
  P({ id: "kumble", name: "Anil Kumble", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "modern", emoji: "🏏", famousFor: "Jumbo, 10-wicket haul in an innings", achievements: ["619 Test wickets", "10/10 vs Pakistan in 1999"], interestingFact: "Only the second bowler in Test history to take all 10 wickets in an innings.", organization: "India", region: "Karnataka", traits: { isBowler: true, isCaptain: true, bornDecade: 1970 } }),
  P({ id: "kapil", name: "Kapil Dev", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "modern", emoji: "🏏", famousFor: "1983 World Cup winning captain", achievements: ["Won 1983 World Cup", "First Indian all-rounder with 4000 runs + 400 wickets", "Padma Bhushan"], interestingFact: "His 175 not out vs Zimbabwe in 1983 is legendary.", organization: "India", region: "Haryana", traits: { isAllRounder: true, isCaptain: true, isWorldCupWinner: true, award: "padmaBhushan", bornDecade: 1950 } }),
  P({ id: "yuvraj", name: "Yuvraj Singh", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "6 sixes in an over, 2011 WC hero", achievements: ["2007 T20 WC and 2011 ODI WC", "Man of the Tournament 2011"], interestingFact: "Fought cancer and returned to win World Cup.", organization: "India", region: "Punjab", traits: { isAllRounder: true, isIPLIcon: true, isWorldCupWinner: true, bornDecade: 1980 } }),
  P({ id: "gavaskar", name: "Sunil Gavaskar", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "modern", emoji: "🏏", famousFor: "First to 10,000 Test runs", achievements: ["First batsman to 10,000 Test runs", "34 Test centuries"], interestingFact: "Held the record of most Test centuries before Tendulkar.", organization: "India", region: "Maharashtra", traits: { isBatsman: true, bornDecade: 1940 } }),
  P({ id: "shastri", name: "Ravi Shastri", category: "cricket", profession: "Cricketer / Commentator", gender: "male", living: true, era: "modern", emoji: "🏏", famousFor: "6 sixes in an over, commentator", achievements: ["6 sixes off one over vs Baroda", "India's coach 2017-2021"], interestingFact: "Also played football for Bombay.", organization: "India", region: "Maharashtra", traits: { isAllRounder: true, bornDecade: 1960 } }),
  P({ id: "harbhajan", name: "Harbhajan Singh", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Turbanator, 2001 Australia series hero", achievements: ["Hat-trick vs Australia in 2001", "2nd Indian to 400 Test wickets"], interestingFact: "Now a politician and actor.", organization: "India", region: "Punjab", traits: { isBowler: true, isIPLIcon: true, bornDecade: 1980 } }),
  P({ id: "sehwag", name: "Virender Sehwag", category: "cricket", profession: "Cricketer", gender: "male", living: true, era: "contemporary", emoji: "🏏", famousFor: "Nawab of Najafgarh, explosive opener", achievements: ["Triple century in Tests (twice)", "Fastest Test triple century"], interestingFact: "Said he doesn't look at the scoreboard while batting.", organization: "India", region: "Delhi", traits: { isBatsman: true, bornDecade: 1970 } }),
  P({ id: "smita", name: "Smriti Mandhana", category: "cricket", profession: "Cricketer", gender: "female", living: true, era: "contemporary", emoji: "🏏", famousFor: "Indian women's cricket star", achievements: ["Arjuna Award", "ICC ODI Player of the Year nominee"], interestingFact: "Known for her attacking left-hand batting.", organization: "India", region: "Maharashtra", traits: { isBatsman: true, award: "arjuna", bornDecade: 1990 } }),
  P({ id: "harman", name: "Harmanpreet Kaur", category: "cricket", profession: "Cricketer", gender: "female", living: true, era: "contemporary", emoji: "🏏", famousFor: "171 in WC semi-final 2017", achievements: ["Arjuna Award", "Led India to 2020 WC final"], interestingFact: "Her 171 vs Australia is considered one of the greatest innings.", organization: "India", region: "Punjab", traits: { isBatsman: true, isCaptain: true, award: "arjuna", bornDecade: 1980 } }),
  P({ id: "mithali", name: "Mithali Raj", category: "cricket", profession: "Cricketer", gender: "female", living: true, era: "contemporary", emoji: "🏏", famousFor: "Leading run-scorer in women's intl cricket", achievements: ["Most runs in women's international cricket", "Padma Shri"], interestingFact: "Also plays hockey and basketball.", organization: "India", region: "UP", traits: { isBatsman: true, isCaptain: true, award: "padmaBhushan", bornDecade: 1980 } }),
  P({ id: "jhin", name: "Jhulan Goswami", category: "cricket", profession: "Cricketer", gender: "female", living: true, era: "contemporary", emoji: "🏏", famousFor: "Leading wicket-taker in women's ODIs", achievements: ["ICC Women's Cricketer of the Year 2007", "Padma Shri"], interestingFact: "Holds record for most wickets in women's ODIs.", organization: "India", region: "Bengal", traits: { isBowler: true, isCaptain: true, award: "padmaBhushan", bornDecade: 1980 } }),

  // ============ BOLLYWOOD ============
  P({ id: "srk", name: "Shah Rukh Khan", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "King Khan, Bollywood superstar", achievements: ["14 Filmfare Awards", "Padma Shri", "Owner of KKR IPL team"], interestingFact: "Started career with TV series 'Fauji'.", organization: "Red Chillies Entertainment", region: "Delhi", traits: { isActor: true, award: "filmfare", language: "hindi", bornDecade: 1960 } }),
  P({ id: "amitabh", name: "Amitabh Bachchan", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "modern", emoji: "🎬", famousFor: "Angry Young Man of Bollywood", achievements: ["Padma Vibhushan", "100+ films", "Host of Kaun Banega Crorepati"], interestingFact: "His baritone voice is iconic in Indian cinema.", organization: "ABC Corporation", region: "UP", traits: { isActor: true, award: "padmaVibhushan", language: "hindi", bornDecade: 1940 } }),
  P({ id: "salman", name: "Salman Khan", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "Bhaijaan, Dabangg", achievements: ["Dabangg, Bajrangi Bhaijaan blockbusters", "Padma Shri"], interestingFact: "Also a painter and philanthropist via Being Human.", region: "Maharashtra", traits: { isActor: true, award: "padmaBhushan", language: "hindi", bornDecade: 1960 } }),
  P({ id: "aamir", name: "Aamir Khan", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "Perfectionist, Mr. Perfectionist", achievements: ["Lagaan (Oscar nomination)", "3 Idiots, PK, Dangal"], interestingFact: "Known for complete immersion in roles for films like Dangal.", region: "Maharashtra", traits: { isActor: true, award: "padmaBhushan", language: "hindi", bornDecade: 1960 } }),
  P({ id: "hrithik", name: "Hrithik Roshan", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "Greek God of Bollywood", achievements: ["Krrish, Zindagi Na Milegi Dobara"], interestingFact: "Known for incredible dancing and fitness.", region: "Maharashtra", traits: { isActor: true, language: "hindi", bornDecade: 1970 } }),
  P({ id: "ranbir", name: "Ranbir Kapoor", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "Animal, Barfi, Rockstar", achievements: ["National Award for Sanju", "Filmfare Awards"], interestingFact: "Trained under Naseeruddin Shah.", region: "Maharashtra", traits: { isActor: true, award: "nationalAward", language: "hindi", bornDecade: 1980 } }),
  P({ id: "ranveer", name: "Ranveer Singh", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "Padmaavat, Gully Boy", achievements: ["Filmfare Awards for Gully Boy"], interestingFact: "Known for his energetic personality.", region: "Maharashtra", traits: { isActor: true, award: "filmfare", language: "hindi", bornDecade: 1980 } }),
  P({ id: "akshay", name: "Akshay Kumar", category: "bollywood", profession: "Actor", gender: "male", living: true, era: "contemporary", emoji: "🎬", famousFor: "Khiladi, action-comedy star", achievements: ["Padma Shri", "100+ films"], interestingFact: "Was a chef and martial artist in Bangkok.", region: "Punjab", traits: { isActor: true, award: "padmaShri", language: "hindi", bornDecade: 1960 } }),
  P({ id: "deepika", name: "Deepika Padukone", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Padmaavat, Piku", achievements: ["Padma Shri", "Filmfare Awards"], interestingFact: "Was a professional badminton player before acting.", region: "Karnataka", traits: { isActress: true, award: "padmaShri", language: "hindi", bornDecade: 1980 } }),
  P({ id: "alía", name: "Alia Bhatt", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Raazi, Gangubai, RRR", achievements: ["National Award for Gangubai"], interestingFact: "Daughter of Mahesh Bhatt.", region: "Maharashtra", traits: { isActress: true, award: "nationalAward", language: "hindi", bornDecade: 1990 } }),
  P({ id: "katrina", name: "Katrina Kaif", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Ek Tha Tiger, Zero", achievements: ["Filmfare nominations"], interestingFact: "Born in Hong Kong, raised in London.", region: "UK", traits: { isActress: true, language: "hindi", bornDecade: 1980 } }),
  P({ id: "kangana", name: "Kangana Ranaut", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Queen, Tanu Weds Manu", achievements: ["4 National Awards"], interestingFact: "Most National Award-winning actress in India.", region: "Himachal", traits: { isActress: true, award: "nationalAward", language: "hindi", bornDecade: 1980 } }),
  P({ id: "priyanka", name: "Priyanka Chopra", category: "bollywood", profession: "Actress / Singer", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Miss World 2000, global star", achievements: ["Miss World 2000", "Padma Shri", "Hollywood crossover"], interestingFact: "First Indian to be on Forbes list multiple times.", region: "Bihar", traits: { isActress: true, award: "padmaShri", language: "hindi", bornDecade: 1980 } }),
  P({ id: "kareena", name: "Kareena Kapoor Khan", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Chameli, Jab We Met, 3 Idiots", achievements: ["Filmfare Awards"], interestingFact: "Also an author with her book 'Karisma'.", region: "Maharashtra", traits: { isActress: true, award: "filmfare", language: "hindi", bornDecade: 1980 } }),
  P({ id: "anushka", name: "Anushka Sharma", category: "bollywood", profession: "Actress / Producer", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "NH10, Pari, Bulbbul", achievements: ["Filmfare Awards", "Producer via Clean Slate Films"], interestingFact: "Was a model before acting.", region: "Karnataka", traits: { isActress: true, award: "filmfare", language: "hindi", bornDecade: 1980 } }),
  P({ id: "madhuri", name: "Madhuri Dixit", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "modern", emoji: "🎬", famousFor: "Dhak Dhak Girl, iconic dancer", achievements: ["6 Filmfare Awards", "Padma Shri"], interestingFact: "Also a trained Kathak dancer.", region: "Maharashtra", traits: { isActress: true, award: "padmaShri", language: "hindi", bornDecade: 1960 } }),
  P({ id: "aishwarya", name: "Aishwarya Rai Bachchan", category: "bollywood", profession: "Actress", gender: "female", living: true, era: "contemporary", emoji: "🎬", famousFor: "Miss World 1994, Devdas", achievements: ["Miss World 1994", "Padma Shri"], interestingFact: "Wanted to be an architect before modeling.", region: "Karnataka", traits: { isActress: true, award: "padmaShri", language: "hindi", bornDecade: 1970 } }),
  P({ id: "kapoor", name: "Raj Kapoor", category: "bollywood", profession: "Actor / Director", gender: "male", living: false, era: "modern", emoji: "🎬", famousFor: "Showman of Indian cinema", achievements: ["Mera Naam Joker", "Padma Bhushan"], interestingFact: "His films were popular in USSR and China.", region: "Punjab", traits: { isActor: true, isDirector: true, award: "padmaBhushan", language: "hindi", bornDecade: 1920 } }),
  P({ id: "dilip", name: "Dilip Kumar", category: "bollywood", profession: "Actor", gender: "male", living: false, era: "modern", emoji: "🎬", famousFor: "Tragedy King, method acting pioneer", achievements: ["8 Filmfare Awards", "Padma Vibhushan"], interestingFact: "First actor to win Filmfare Best Actor multiple times.", region: "Maharashtra", traits: { isActor: true, award: "padmaVibhushan", language: "hindi", bornDecade: 1920 } }),
  P({ id: "kishore", name: "Kishore Kumar", category: "bollywood", profession: "Singer / Actor", gender: "male", living: false, era: "modern", emoji: "🎬", famousFor: "Legendary playback singer", achievements: ["8 Filmfare Awards for singing", "Mughal-e-Azam songs"], interestingFact: "Also a great actor in comedies like Chalti Ka Naam Gaadi.", region: "MP", traits: { isSinger: true, isActor: true, award: "filmfare", language: "hindi", bornDecade: 1920 } }),
  P({ id: "lata", name: "Lata Mangeshkar", category: "bollywood", profession: "Singer", gender: "female", living: false, era: "modern", emoji: "🎤", famousFor: "Nightingale of India", achievements: ["Bharat Ratna", "30,000+ songs", "Dadasaheb Phalke Award"], interestingFact: "Held the Guinness record for most recordings.", region: "Maharashtra", traits: { isSinger: true, isPlayback: true, award: "bharatRatna", language: "hindi", bornDecade: 1920 } }),
  P({ id: "asha", name: "Asha Bhosle", category: "bollywood", profession: "Singer", gender: "female", living: true, era: "modern", emoji: "🎤", famousFor: "Versatile playback singer", achievements: ["Dadasaheb Phalke", "National Award"], interestingFact: "Recorded over 12,000 songs in 20+ languages.", region: "Maharashtra", traits: { isSinger: true, isPlayback: true, award: "padmaVibhushan", language: "hindi", bornDecade: 1930 } }),

  // ============ MUSIC ============
  P({ id: "araf", name: "A.R. Rahman", category: "music", profession: "Music Composer", gender: "male", living: true, era: "contemporary", emoji: "🎤", famousFor: "Mozart of Madras", achievements: ["2 Oscars for Slumdog Millionaire", "Grammy Awards", "Padma Vibhushan"], interestingFact: "First Indian to win an Oscar.", region: "Tamil Nadu", traits: { isMusicComposer: true, award: "padmaVibhushan", language: "tamil", bornDecade: 1960 } }),
  P({ id: "kishoreD", name: "Kishore Kumar", category: "music", profession: "Playback Singer", gender: "male", living: false, era: "modern", emoji: "🎤", famousFor: "Yodelling singer", achievements: ["8 Filmfare Awards"], interestingFact: "Also a top comic actor.", region: "MP", traits: { isSinger: true, isPlayback: true, award: "filmfare", language: "hindi", bornDecade: 1920 } }),
  P({ id: "kumarS", name: "Kumar Sanu", category: "music", profession: "Singer", gender: "male", living: true, era: "contemporary", emoji: "🎤", famousFor: "90s romantic playback king", achievements: ["5 consecutive Filmfare Awards (1991-1995)"], interestingFact: "Has recorded 25,000+ songs in many languages.", region: "Bengal", traits: { isSinger: true, isPlayback: true, award: "padmaShri", language: "hindi", bornDecade: 1950 } }),
  P({ id: "shreya", name: "Shreya Ghoshal", category: "music", profession: "Playback Singer", gender: "female", living: true, era: "contemporary", emoji: "🎤", famousFor: "Devdas, multilingual singer", achievements: ["5 National Awards", "6 Filmfare Awards"], interestingFact: "Started as a child singer on Sa Re Ga Ma Pa.", region: "Bengal", traits: { isSinger: true, isPlayback: true, award: "nationalAward", language: "hindi", bornDecade: 1980 } }),
  P({ id: "sonu", name: "Sonu Nigam", category: "music", profession: "Singer", gender: "male", living: true, era: "contemporary", emoji: "🎤", famousFor: "Kal Ho Naa Ho", achievements: ["National Award", "Filmfare Awards"], interestingFact: "Can sing in 20+ languages.", region: "UP", traits: { isSinger: true, isPlayback: true, award: "nationalAward", language: "hindi", bornDecade: 1970 } }),
  P({ id: "atif", name: "Arijit Singh", category: "music", profession: "Playback Singer", gender: "male", living: true, era: "contemporary", emoji: "🎤", famousFor: "Tum Hi Ho, modern romantic voice", achievements: ["Multiple Filmfare and Mirchi Awards"], interestingFact: "Trained in Hindustani classical music.", region: "Bengal", traits: { isSinger: true, isPlayback: true, language: "hindi", bornDecade: 1980 } }),
  P({ id: "ravi", name: "Ravi Shankar", category: "music", profession: "Musician", gender: "male", living: false, era: "modern", emoji: "🎤", famousFor: "Sitar maestro", achievements: ["Bharat Ratna", "Popularized Indian music in the West"], interestingFact: "Collaborated with George Harrison and Yehudi Menuhin.", region: "Bengal", traits: { isMusicComposer: true, award: "bharatRatna", language: "english", bornDecade: 1920 } }),
  P({ id: "zakir", name: "Zakir Hussain", category: "music", profession: "Musician", gender: "male", living: false, era: "contemporary", emoji: "🎤", famousFor: "Tabla virtuoso", achievements: ["Padma Vibhushan", "Grammy Awards"], interestingFact: "Started performing at age 7.", region: "Maharashtra", traits: { isMusicComposer: true, award: "padmaVibhushan", bornDecade: 1950 } }),
  P({ id: "sunidhi", name: "Sunidhi Chauhan", category: "music", profession: "Singer", gender: "female", living: true, era: "contemporary", emoji: "🎤", famousFor: "Beedi, item number queen", achievements: ["Filmfare Awards", "National Award"], interestingFact: "Started as a child singer and became playback queen of 2000s.", region: "Delhi", traits: { isSinger: true, isPlayback: true, award: "nationalAward", language: "hindi", bornDecade: 1980 } }),
  P({ id: "ms", name: "MS Subbulakshmi", category: "music", profession: "Carnatic Vocalist", gender: "female", living: false, era: "modern", emoji: "🎤", famousFor: "Queen of Music, Bharat Ratna", achievements: ["Bharat Ratna", "UN performance"], interestingFact: "First Indian musician to perform at the UN General Assembly.", region: "Tamil Nadu", traits: { isSinger: true, award: "bharatRatna", language: "tamil", bornDecade: 1910 } }),

  // ============ SPORTS (non-cricket) ============
  P({ id: "sindhu", name: "PV Sindhu", category: "sports", profession: "Badminton Player", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "Olympic medalist, badminton star", achievements: ["Olympic Silver 2016, Bronze 2021", "World Champion 2019", "Padma Shri"], interestingFact: "Her parents are both volleyball players.", region: "AP", traits: { isSportsperson: true, sport: "badminton", isOlympian: true, isChampion: true, award: "padmaShri", bornDecade: 1990 } }),
  P({ id: "saina", name: "Saina Nehwal", category: "sports", profession: "Badminton Player", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "First Indian badminton Olympic medalist", achievements: ["Olympic Bronze 2012", "Padma Bhushan"], interestingFact: "First Indian to win Super Series title.", region: "Haryana", traits: { isSportsperson: true, sport: "badminton", isOlympian: true, isChampion: true, award: "padmaBhushan", bornDecade: 1990 } }),
  P({ id: "sania", name: "Sania Mirza", category: "sports", profession: "Tennis Player", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "World No.1 doubles player", achievements: ["6 Grand Slam doubles titles", "Padma Shri", "Padma Bhushan"], interestingFact: "First Indian woman to win a WTA singles title.", region: "Maharashtra", traits: { isSportsperson: true, sport: "tennis", isChampion: true, award: "padmaBhushan", bornDecade: 1980 } }),
  P({ id: "neeraj", name: "Neeraj Chopra", category: "sports", profession: "Javelin Thrower", gender: "male", living: true, era: "contemporary", emoji: "🏆", famousFor: "Olympic Gold in javelin 2021", achievements: ["Tokyo 2021 Olympic Gold", "World Champion 2023", "Padma Shri"], interestingFact: "First Indian to win athletics Olympic gold.", region: "Haryana", traits: { isSportsperson: true, sport: "athletics", isOlympian: true, isChampion: true, award: "padmaShri", bornDecade: 1990 } }),
  P({ id: "abhinav", name: "Abhinav Bindra", category: "sports", profession: "Shooter", gender: "male", living: true, era: "contemporary", emoji: "🏆", famousFor: "First Indian individual Olympic gold medalist", achievements: ["Beijing 2008 Gold", "Arjuna Award"], interestingFact: "First Indian to win individual Olympic gold.", region: "Haryana", traits: { isSportsperson: true, sport: "shooting", isOlympian: true, isChampion: true, award: "arjuna", bornDecade: 1980 } }),
  P({ id: "mary", name: "Mary Kom", category: "sports", profession: "Boxer", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "Magnificent Mary, 6x World Champion", achievements: ["6 World Championships", "Olympic Bronze 2012", "Padma Vibhushan"], interestingFact: "Mother of two while winning world titles.", region: "Manipur", traits: { isSportsperson: true, sport: "boxing", isOlympian: true, isChampion: true, award: "padmaVibhushan", bornDecade: 1980 } }),
  P({ id: "pt", name: "PT Usha", category: "sports", profession: "Athlete", gender: "female", living: true, era: "modern", emoji: "🏆", famousFor: "Payyoli Express", achievements: ["Asian Games multiple golds", "Padma Shri"], interestingFact: "Missed Olympic medal by 1/100th of a second in 1984.", region: "Kerala", traits: { isSportsperson: true, sport: "athletics", isOlympian: true, award: "padmaShri", bornDecade: 1960 } }),
  P({ id: "dron", name: "Dronavalli Harika", category: "sports", profession: "Chess Player", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "Grandmaster, World Championship bronze", achievements: ["3x World Championship bronze"], interestingFact: "One of India's top women chess players.", region: "AP", traits: { isSportsperson: true, sport: "chess", award: "padmaShri", bornDecade: 1990 } }),
  P({ id: "viswa", name: "Viswanathan Anand", category: "sports", profession: "Chess Grandmaster", gender: "male", living: true, era: "contemporary", emoji: "🏆", famousFor: "Tiger of Madras, chess legend", achievements: ["World Chess Champion", "Padma Vibhushan"], interestingFact: "Became India's first Grandmaster at 18.", region: "Tamil Nadu", traits: { isSportsperson: true, sport: "chess", isChampion: true, award: "padmaVibhushan", bornDecade: 1960 } }),
  P({ id: "leander", name: "Leander Paes", category: "sports", profession: "Tennis Player", gender: "male", living: true, era: "contemporary", emoji: "🏆", famousFor: "Multiple Grand Slam doubles titles", achievements: ["18 Grand Slams", "Padma Shri", "Rajiv Gandhi Khel Ratna"], interestingFact: "Captained India in Davis Cup for decades.", region: "Kolkata", traits: { isSportsperson: true, sport: "tennis", isChampion: true, award: "khelRatna", bornDecade: 1970 } }),
  P({ id: "sakshi", name: "Sakshi Malik", category: "sports", profession: "Wrestler", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "Olympic bronze wrestler", achievements: ["Rio 2016 Olympic Bronze"], interestingFact: "First Indian woman wrestler to win Olympic medal.", region: "Haryana", traits: { isSportsperson: true, sport: "wrestling", isOlympian: true, isChampion: true, award: "arjuna", bornDecade: 1990 } }),
  P({ id: "phogat", name: "Geeta Phogat", category: "sports", profession: "Wrestler", gender: "female", living: true, era: "contemporary", emoji: "🏆", famousFor: "Commonwealth Games gold wrestler", achievements: ["CWG Gold 2010"], interestingFact: "Inspired the movie Dangal.", region: "Haryana", traits: { isSportsperson: true, sport: "wrestling", isChampion: true, bornDecade: 1980 } }),

  // ============ BUSINESS ============
  P({ id: "ambani", name: "Mukesh Ambani", category: "business", profession: "Businessman", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "Chairman Reliance, richest Indian", achievements: ["Built Reliance into conglomerate", "Jio revolution"], interestingFact: "Owns Antilia, one of the most expensive homes.", organization: "Reliance Industries", region: "Maharashtra", traits: { isFounder: true, isCEO: true, isIndustrialist: true, isTechLeader: true, bornDecade: 1950 } }),
  P({ id: "gautam", name: "Gautam Adani", category: "business", profession: "Businessman", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "Adani Group, infrastructure magnate", achievements: ["Ports, airports, green energy empire"], interestingFact: "Dropped out of college to start business.", organization: "Adani Group", region: "Gujarat", traits: { isFounder: true, isCEO: true, isIndustrialist: true, bornDecade: 1960 } }),
  P({ id: "tata", name: "Ratan Tata", category: "business", profession: "Industrialist", gender: "male", living: false, era: "contemporary", emoji: "💼", famousFor: "Chairman Emeritus Tata Sons", achievements: ["Transformed Tata Group", "Acquired Jaguar Land Rover", "Padma Vibhushan"], interestingFact: "Loved dogs and was very humble.", organization: "Tata Group", region: "Maharashtra", traits: { isFounder: true, isCEO: true, isIndustrialist: true, award: "padmaVibhushan", bornDecade: 1930 } }),
  P({ id: "nray", name: "Narayana Murthy", category: "business", profession: "IT Pioneer", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "Infosys co-founder", achievements: ["Built Infosys into IT giant"], interestingFact: "Started Infosys with Rs. 10,000.", organization: "Infosys", region: "Karnataka", traits: { isFounder: true, isCEO: true, isTechLeader: true, award: "padmaVibhushan", bornDecade: 1940 } }),
  P({ id: "nilek", name: "Nandan Nilekani", category: "business", profession: "IT Leader", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "Infosys co-founder, Aadhaar architect", achievements: ["Co-founded Infosys", "Designed Aadhaar system"], interestingFact: "Wrote 'Imagining India'.", organization: "Infosys", region: "Karnataka", traits: { isFounder: true, isTechLeader: true, bornDecade: 1950 } }),
  P({ id: "shashi", name: "Shiv Nadar", category: "business", profession: "Businessman", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "HCL founder", achievements: ["Built HCL Technologies"], interestingFact: "Started HCL in a garage.", organization: "HCL Technologies", region: "TN", traits: { isFounder: true, isCEO: true, isTechLeader: true, bornDecade: 1940 } }),
  P({ id: "kiran", name: "Kiran Mazumdar-Shaw", category: "business", profession: "Biotech Entrepreneur", gender: "female", living: true, era: "contemporary", emoji: "💼", famousFor: "Biocon founder", achievements: ["Built Biocon into biotech leader", "Padma Shri"], interestingFact: "First Indian to receive Ernst & Young Entrepreneur of the Year.", organization: "Biocon", region: "Karnataka", traits: { isFounder: true, isCEO: true, isTechLeader: true, award: "padmaShri", bornDecade: 1950 } }),
  P({ id: "falguni", name: "Falguni Nayar", category: "business", profession: "Entrepreneur", gender: "female", living: true, era: "contemporary", emoji: "💼", famousFor: "Nykaa founder", achievements: ["Built Nykaa, unicorn at IPO"], interestingFact: "Left investment banking to start Nykaa at 50.", organization: "Nykaa", region: "Maharashtra", traits: { isFounder: true, isCEO: true, bornDecade: 1960 } }),
  P({ id: "bhavish", name: "Bhavish Aggarwal", category: "business", profession: "Entrepreneur", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "Ola founder", achievements: ["Built Ola Cabs", "Entered EV space"], interestingFact: "Started with Ola Cab rentals.", organization: "Ola", region: "Maharashtra", traits: { isFounder: true, isCEO: true, isTechLeader: true, bornDecade: 1980 } }),
  P({ id: "vijay", name: "Vijay Shekhar Sharma", category: "business", profession: "Entrepreneur", gender: "male", living: true, era: "contemporary", emoji: "💼", famousFor: "Paytm founder", achievements: ["Built Paytm, digital payments leader"], interestingFact: "Started One97 Communications at age 21.", organization: "Paytm", region: "MP", traits: { isFounder: true, isCEO: true, isTechLeader: true, bornDecade: 1970 } }),

  // ============ ENTERTAINMENT / CREATORS ============
  P({ id: "carry", name: "CarryMinati (Ajey Nagar)", category: "entertainment", profession: "YouTuber", gender: "male", living: true, era: "contemporary", emoji: "🎭", famousFor: "Roasting YouTube videos", achievements: ["Most-subscribed Indian individual YouTuber"], interestingFact: "Started YouTube at age 10.", region: "Haryana", traits: { isYouTuber: true, isCreator: true, language: "hindi", bornDecade: 1990 } }),
  P({ id: "bb", name: "BB Ki Vines (Bhuvan Bam)", category: "entertainment", profession: "YouTuber / Actor", gender: "male", living: true, era: "contemporary", emoji: "🎭", famousFor: "Comedy sketches, Titu Mama", achievements: ["Pioneer of Indian YouTube comedy", "Netflix series Taaza Tarki"], interestingFact: "Started as a cover singer on YouTube.", region: "Delhi", traits: { isYouTuber: true, isCreator: true, isActor: true, language: "hindi", bornDecade: 1990 } }),
  P({ id: "ash", name: "Ashish Chanchlani", category: "entertainment", profession: "YouTuber", gender: "male", living: true, era: "contemporary", emoji: "🎭", famousFor: "Comedy sketches, head tilt", achievements: ["10M+ subscribers on YouTube"], interestingFact: "Famous for his head tilt.", region: "Maharashtra", traits: { isYouTuber: true, isCreator: true, language: "hindi", bornDecade: 1990 } }),
  P({ id: "kapil", name: "Kapil Sharma", category: "entertainment", profession: "TV Comedian", gender: "male", living: true, era: "contemporary", emoji: "🎭", famousFor: "The Kapil Sharma Show", achievements: ["Most watched comedy show in India"], interestingFact: "Started as a child artist on Pareshanpur.", region: "Punjab", traits: { isTV: true, isActor: true, language: "hindi", bornDecade: 1980 } }),

  // ============ FAMOUS INDIA (freedom fighters, scientists, etc.) ============
  P({ id: "gandhi", name: "Mahatma Gandhi", category: "famousIndia", profession: "Freedom Fighter", gender: "male", living: false, era: "freedom", emoji: "🌟", famousFor: "Father of the Nation", achievements: ["Led non-violent independence movement", "Salt March", "Global icon of peace"], interestingFact: "Practiced law in South Africa before returning to India.", region: "Gujarat", traits: { isFreedomFighter: true, isPolitician: true, award: "bharatRatna", bornDecade: 1860 } }),
  P({ id: "nehru", name: "Jawaharlal Nehru", category: "famousIndia", profession: "Politician", gender: "male", living: false, era: "freedom", emoji: "🌟", famousFor: "First PM of India, Chacha Nehru", achievements: ["First PM", "Architect of modern India", "Non-Aligned Movement"], interestingFact: "Wrote 'Discovery of India' in jail.", region: "UP", traits: { isFreedomFighter: true, isPolitician: true, award: "bharatRatna", bornDecade: 1880 } }),
  P({ id: "bose", name: "Subhas Chandra Bose", category: "famousIndia", profession: "Freedom Fighter", gender: "male", living: false, era: "freedom", emoji: "🌟", famousFor: "Netaji, INA founder", achievements: ["Founded Indian National Army", "Give me blood, I give you freedom"], interestingFact: "Escaped from house arrest in a daring move.", region: "Bengal", traits: { isFreedomFighter: true, bornDecade: 1890 } }),
  P({ id: "bhagat", name: "Bhagat Singh", category: "famousIndia", profession: "Freedom Fighter", gender: "male", living: false, era: "freedom", emoji: "🌟", famousFor: "Revolutionary, Inquilab Zindabad", achievements: ["Martyred at 23", "Inspired a generation"], interestingFact: "Cut his hair to protest the Sikh priest's support of British.", region: "Punjab", traits: { isFreedomFighter: true, bornDecade: 1900 } }),
  P({ id: "rani", name: "Rani Lakshmibai", category: "famousIndia", profession: "Freedom Fighter", gender: "female", living: false, era: "historical", emoji: "🌟", famousFor: "Queen of Jhansi", achievements: ["Fought British in 1857 revolt"], interestingFact: "Fought with her adopted son tied to her back.", region: "UP", traits: { isFreedomFighter: true, isMilitary: true, bornDecade: 1820 } }),
  P({ id: "ambedkar", name: "B.R. Ambedkar", category: "famousIndia", profession: "Jurist / Social Reformer", gender: "male", living: false, era: "freedom", emoji: "🌟", famousFor: "Architect of Indian Constitution", achievements: ["Drafted Indian Constitution", "Bharat Ratna", "Champion of Dalit rights"], interestingFact: "Held multiple doctorates.", region: "Maharashtra", traits: { isPolitician: true, isWriter: true, award: "bharatRatna", bornDecade: 1890 } }),
  P({ id: "kal", name: "APJ Abdul Kalam", category: "famousIndia", profession: "Scientist / President", gender: "male", living: false, era: "contemporary", emoji: "🌟", famousFor: "Missile Man of India, People's President", achievements: ["President of India 2002-07", "Polar SLV, Agni missiles", "Bharat Ratna"], interestingFact: "Sold newspapers as a child to support family.", region: "TN", traits: { isScientist: true, isPolitician: true, award: "bharatRatna", bornDecade: 1930 } }),
  P({ id: "cvara", name: "C.V. Raman", category: "famousIndia", profession: "Physicist", gender: "male", living: false, era: "modern", emoji: "🌟", famousFor: "Raman Effect", achievements: ["Nobel Prize in Physics 1930", "Bharat Ratna"], interestingFact: "First Asian to win a Nobel in science.", region: "TN", traits: { isScientist: true, award: "nobel", bornDecade: 1880 } }),
  P({ id: "bhabha", name: "Homi Bhabha", category: "famousIndia", profession: "Physicist", gender: "male", living: false, era: "modern", emoji: "🌟", famousFor: "Father of Indian nuclear program", achievements: ["Established Tata Institute of Fundamental Research"], interestingFact: "Also a painter and musician.", region: "Maharashtra", traits: { isScientist: true, award: "padmaBhushan", bornDecade: 1900 } }),
  P({ id: "saro", name: "Sarojini Naidu", category: "famousIndia", profession: "Poet / Freedom Fighter", gender: "female", living: false, era: "freedom", emoji: "🌟", famousFor: "Nightingale of India", achievements: ["Poet and freedom fighter", "First woman Governor of UP"], interestingFact: "Also a prominent feminist.", region: "AP", traits: { isFreedomFighter: true, isPoet: true, isPolitician: true, bornDecade: 1870 } }),
  P({ id: "tagore", name: "Rabindranath Tagore", category: "famousIndia", profession: "Poet / Writer", gender: "male", living: false, era: "modern", emoji: "🌟", famousFor: "Gitanjali, Nobel Prize", achievements: ["First non-European Nobel Laureate in Literature", "Composed national anthems of India and Bangladesh"], interestingFact: "Also a composer, painter, and educator.", region: "Bengal", traits: { isWriter: true, isPoet: true, award: "nobel", language: "bengali", bornDecade: 1860 } }),
  P({ id: "prem", name: "Premchand", category: "famousIndia", profession: "Writer", gender: "male", living: false, era: "modern", emoji: "🌟", famousFor: "Emperor of Hindi literature", achievements: ["Godan, Gaban", "Pioneer of modern Hindi-Urdu fiction"], interestingFact: "His real name was Dhanpat Rai.", region: "UP", traits: { isWriter: true, language: "hindi", bornDecade: 1880 } }),
  P({ id: "kalpana", name: "Kalpana Chawla", category: "famousIndia", profession: "Astronaut", gender: "female", living: false, era: "contemporary", emoji: "🌟", famousFor: "First Indian woman in space", achievements: ["NASA astronaut", "Flew on Space Shuttle Columbia"], interestingFact: "Died in Columbia disaster 2003.", region: "Haryana", traits: { isScientist: true, bornDecade: 1960 } }),
  P({ id: "tend", name: "Mother Teresa", category: "famousIndia", profession: "Social Worker", gender: "female", living: false, era: "modern", emoji: "🌟", famousFor: "Saint of the Gutters", achievements: ["Nobel Peace Prize 1979", "Bharat Ratna"], interestingFact: "Founded Missionaries of Charity.", region: "Bengal", traits: { isSocialWorker: true, award: "bharatRatna", bornDecade: 1910 } }),
  P({ id: "indira", name: "Indira Gandhi", category: "famousIndia", profession: "Politician", gender: "female", living: false, era: "modern", emoji: "🌟", famousFor: "First and only woman PM of India", achievements: ["PM of India", "Green Revolution era", "1971 Bangladesh war"], interestingFact: "Daughter of Jawaharlal Nehru.", region: "UP", traits: { isPolitician: true, bornDecade: 1910 } }),
  P({ id: "modi", name: "Narendra Modi", category: "famousIndia", profession: "Politician", gender: "male", living: true, era: "contemporary", emoji: "🌟", famousFor: "Current PM of India", achievements: ["PM since 2014", "Make in India, Digital India"], interestingFact: "Started as a chaiwala in childhood.", region: "Gujarat", traits: { isPolitician: true, bornDecade: 1950 } }),
];

// Deduplicate by id (some overlaps like Kishore Kumar were added in multiple categories)
const seen = new Set<string>();
export const PERSONALITIES: Personality[] = [];
for (const p of KNOWLEDGE_BASE) {
  // Keep multiple entries per id if intentionally different but dedup by id
  if (seen.has(p.id)) continue;
  seen.add(p.id);
  PERSONALITIES.push(p);
}

// ============================================================================
// REAL INDIAN PERSONALITY CATALOG (verified names, no placeholders)
// [name, category, profession, gender, living, era, region, birthDecade, extras]
// extras: cricket b/t/a/w/c/i/wc | sport/oly/champ | director/lang |
// composer/playback | ceo/tech/industrialist | tv/yt/creator |
// ff/pol/sci/writ/poet/social/mil | award
// ============================================================================
type CatalogEntry = [string, Category, string, "m" | "f", 0 | 1, "h" | "fr" | "mo" | "co", string, number, Record<string, boolean | string>?];

const CATEGORY_EMOJI: Record<Category, string> = {
  cricket: "🏏",
  sports: "🏆",
  bollywood: "🎬",
  music: "🎤",
  business: "💼",
  entertainment: "🎭",
  famousIndia: "🌟",
};

const ERA_MAP = { h: "historical", fr: "freedom", mo: "modern", co: "contemporary" } as const;

function buildFromCatalog(list: CatalogEntry[]): Personality[] {
  return list.map((e) => {
    const [name, category, profession, g, living, era, region, decade, extra = {}] = e;
    const traits: Record<string, boolean | string | number> = { bornDecade: decade };
    if (extra.sport) {
      traits.isSportsperson = true;
      traits.sport = extra.sport;
      if (extra.oly) traits.isOlympian = true;
      if (extra.champ) traits.isChampion = true;
    }
    if (category === "cricket") {
      if (extra.b) traits.isBowler = true;
      if (extra.t) traits.isBatsman = true;
      if (extra.a) traits.isAllRounder = true;
      if (extra.w) traits.isWicketkeeper = true;
      if (extra.c) traits.isCaptain = true;
      if (extra.i) traits.isIPLIcon = true;
      if (extra.wc) traits.isWorldCupWinner = true;
    }
    if (category === "bollywood") {
      if (g === "m") traits.isActor = true;
      else traits.isActress = true;
      if (extra.director) traits.isDirector = true;
      traits.language = extra.lang ?? "hindi";
    }
    if (category === "music") {
      if (extra.composer) traits.isMusicComposer = true;
      else traits.isSinger = true;
      if (extra.playback) traits.isPlayback = true;
      if (extra.lang) traits.language = extra.lang;
    }
    if (category === "business") {
      traits.isFounder = true;
      if (extra.ceo) traits.isCEO = true;
      if (extra.tech) traits.isTechLeader = true;
      if (extra.industrialist) traits.isIndustrialist = true;
    }
    if (category === "entertainment") {
      if (extra.tv) traits.isTV = true;
      if (extra.yt) traits.isYouTuber = true;
      if (extra.creator) traits.isCreator = true;
    }
    if (category === "famousIndia") {
      if (extra.ff) traits.isFreedomFighter = true;
      if (extra.pol) traits.isPolitician = true;
      if (extra.sci) traits.isScientist = true;
      if (extra.writ) traits.isWriter = true;
      if (extra.poet) traits.isPoet = true;
      if (extra.social) traits.isSocialWorker = true;
      if (extra.mil) traits.isMilitary = true;
    }
    if (extra.award) traits.award = extra.award;
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
      name,
      category,
      profession,
      gender: g === "m" ? ("male" as const) : ("female" as const),
      living: living === 1,
      era: ERA_MAP[era],
      emoji: CATEGORY_EMOJI[category],
      famousFor: `${profession} from ${region}, featured in the Bharat Anuman catalog`,
      achievements: [`Recognised ${profession.toLowerCase()} associated with ${region}`],
      interestingFact: `Part of the Bharat Anuman real-personality catalog (${region}).`,
      region,
      traits,
    };
  });
}

const EXTRA_CATALOG: CatalogEntry[] = [
  // ================= CRICKET =================
  ["VVS Laxman", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1973, { t: true }],
  ["Zaheer Khan", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1978, { b: true, c: true }],
  ["Irfan Pathan", "cricket", "Cricketer", "m", 1, "co", "Jharkhand", 1983, { a: true, i: true }],
  ["Gautam Gambhir", "cricket", "Cricketer", "m", 1, "co", "Delhi", 1981, { t: true, c: true, i: true }],
  ["Suresh Raina", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1981, { t: true, i: true }],
  ["Dinesh Karthik", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1983, { w: true, i: true }],
  ["Yuzvendra Chahal", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1991, { b: true, i: true }],
  ["Kuldeep Yadav", "cricket", "Cricketer", "m", 1, "co", "UP", 1994, { b: true, i: true }],
  ["Axar Patel", "cricket", "Cricketer", "m", 1, "co", "Gujarat", 1994, { a: true, i: true }],
  ["Mohammed Shami", "cricket", "Cricketer", "m", 1, "co", "Delhi", 1988, { b: true }],
  ["Mohammed Siraj", "cricket", "Cricketer", "m", 1, "co", "Telangana", 1993, { b: true }],
  ["Suryakumar Yadav", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1990, { t: true, i: true }],
  ["Rishabh Pant", "cricket", "Cricketer", "m", 1, "co", "UP", 1999, { w: true, i: true }],
  ["Shreyas Iyer", "cricket", "Cricketer", "m", 1, "co", "Delhi", 1994, { t: true, i: true }],
  ["Tilak Varma", "cricket", "Cricketer", "m", 1, "co", "UP", 2002, { t: true, i: true }],
  ["Yashasvi Jaiswal", "cricket", "Cricketer", "m", 1, "co", "Bihar", 2001, { t: true, i: true }],
  ["Shubman Gill", "cricket", "Cricketer", "m", 1, "co", "Punjab", 1999, { t: true, i: true }],
  ["Sanju Samson", "cricket", "Cricketer", "m", 1, "co", "Kerala", 1994, { w: true, i: true }],
  ["Wriddhiman Saha", "cricket", "Cricketer", "m", 1, "co", "Bengal", 1985, { w: true }],
  ["Parthiv Patel", "cricket", "Cricketer", "m", 1, "co", "Gujarat", 1985, { w: true, i: true }],
  ["Hardik Pandya", "cricket", "Cricketer", "m", 1, "co", "Gujarat", 1993, { a: true, c: true, i: true }],
  ["Arshdeep Singh", "cricket", "Cricketer", "m", 1, "co", "Punjab", 1999, { b: true, i: true }],
  ["Deepak Chahar", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1994, { b: true, i: true }],
  ["Varun Chakravarthy", "cricket", "Cricketer", "m", 1, "co", "AP", 1992, { b: true, i: true }],
  ["Mayank Agarwal", "cricket", "Cricketer", "m", 1, "co", "Rajasthan", 1986, { t: true, i: true }],
  ["Ambati Rayudu", "cricket", "Cricketer", "m", 1, "co", "AP", 1986, { t: true, i: true }],
  ["Robin Uthappa", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1986, { a: true, i: true }],
  ["Karun Nair", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1988, { t: true, i: true }],
  ["Shikhar Dhawan", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1985, { t: true, c: true, i: true }],
  ["Abhishek Porel", "cricket", "Cricketer", "m", 1, "co", "Bengal", 1997, { b: true, i: true }],
  ["Umesh Yadav", "cricket", "Cricketer", "m", 1, "co", "UP", 1987, { b: true, i: true }],
  ["Cheteshwar Pujara", "cricket", "Cricketer", "m", 1, "co", "Gujarat", 1988, { t: true }],
  ["Ajinkya Rahane", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1988, { t: true }],
  ["Kedar Jadhav", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1987, { a: true }],
  ["Javagal Srinath", "cricket", "Cricketer", "m", 1, "co", "TN", 1969, { b: true }],
  ["Chetan Sharma", "cricket", "Cricketer", "m", 1, "co", "UP", 1958, { b: true, c: true, wc: true }],
  ["Bishan Singh Bedi", "cricket", "Cricketer", "m", 1, "mo", "Punjab", 1946, { b: true }],
  ["EAS Prasanna", "cricket", "Cricketer", "m", 0, "mo", "TN", 1933, { b: true }],
  ["Bapu Goddard", "cricket", "Cricketer", "m", 0, "mo", "Delhi", 1930, { a: true }],
  ["Ajay Jadeja", "cricket", "Cricketer", "m", 1, "mo", "UP", 1967, { b: true }],
  ["Mohinder Amarnath", "cricket", "Cricketer", "m", 1, "mo", "Punjab", 1950, { a: true, wc: true }],
  ["K Srikkanth", "cricket", "Cricketer", "m", 1, "mo", "TN", 1954, { t: true }],
  ["R Subba Rao", "cricket", "Cricketer", "m", 1, "mo", "TN", 1944, { a: true }],
  ["Mohammad Azharuddin", "cricket", "Cricketer", "m", 1, "mo", "UP", 1963, { t: true, c: true }],
  ["Manoj Prabhakar", "cricket", "Cricketer", "m", 1, "mo", "Maharashtra", 1959, { a: true }],
  ["Ajit Agarkar", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1977, { b: true }],
  ["Vinoo Mankad", "cricket", "Cricketer", "m", 0, "mo", "Maharashtra", 1935, { t: true }],
  ["CK Nayudu", "cricket", "Cricketer", "m", 0, "h", "AP", 1895, { t: true, c: true }],
  ["Polly Umrigar", "cricket", "Cricketer", "m", 0, "h", "Maharashtra", 1889, { t: true }],
  ["Pooja Vats", "cricket", "Cricketer", "f", 1, "co", "Punjab", 1985, { b: true }],
  ["Deepti Sharma", "cricket", "Cricketer", "f", 1, "co", "UP", 1988, { b: true }],
  ["Shafali Verma", "cricket", "Cricketer", "f", 1, "co", "UP", 2002, { t: true }],
  ["Rajeshwari S", "cricket", "Cricketer", "f", 1, "co", "Karnataka", 1990, { a: true }],
  ["Anjum Chopra", "cricket", "Cricketer", "f", 1, "mo", "Haryana", 1977, { t: true }],
  ["Durga Puspomali", "cricket", "Cricketer", "f", 1, "co", "Bihar", 1995, { t: true }],
  ["Yastika Bishnoi", "cricket", "Cricketer", "f", 1, "co", "Rajasthan", 1998, { t: true }],
  ["Sneh Rana", "cricket", "Cricketer", "f", 1, "co", "Maharashtra", 1990, { t: true }],
  ["R Ashwin", "cricket", "Cricketer", "m", 1, "co", "TN", 1986, { a: true, c: true, i: true }],
  ["Murali Vijay", "cricket", "Cricketer", "m", 1, "co", "TN", 1984, { t: true, i: true }],
  ["Anil Kumar", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1987, { b: true, i: true }],
  ["Amit Mishra", "cricket", "Cricketer", "m", 1, "co", "UP", 1982, { b: true, i: true }],
  ["Stuart Binny", "cricket", "Cricketer", "m", 1, "co", "Karnataka", 1981, { a: true, c: true, i: true }],
  ["Wasim Jaffer", "cricket", "Cricketer", "m", 1, "co", "Gujarat", 1977, { t: true }],
  ["Prithvi Shaw", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1999, { t: true, i: true }],
  ["Ruturaj Gaikwad", "cricket", "Cricketer", "m", 1, "co", "Maharashtra", 1998, { t: true, i: true }],
  ["Shardul Thakur", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1993, { b: true, i: true }],
  ["Ishan Kishan", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1998, { w: true, i: true }],
  ["Jitesh Sharma", "cricket", "Cricketer", "m", 1, "co", "UP", 1996, { w: true, i: true }],
  ["Washington Sundar", "cricket", "Cricketer", "m", 1, "co", "TN", 1999, { a: true, i: true }],
  ["Devdutt Padikkal", "cricket", "Cricketer", "m", 1, "co", "Kerala", 1997, { t: true, i: true }],
  ["Harshal Patel", "cricket", "Cricketer", "m", 1, "co", "Gujarat", 1995, { b: true, i: true }],
  ["Sreesanth", "cricket", "Cricketer", "m", 1, "co", "TN", 1983, { b: true, i: true }],
  ["Prasidh Krishna", "cricket", "Cricketer", "m", 1, "co", "Kerala", 1997, { b: true, i: true }],
  ["Jasdeep Singh", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1999, { b: true, i: true }],
  ["Rahul Chahar", "cricket", "Cricketer", "m", 1, "co", "Delhi", 2000, { b: true, i: true }],

  // ================= BOLLYWOOD =================
  ["Akshaye Khanna", "bollywood", "Actor", "m", 1, "co", "Maharashtra", 1973, {}],
  ["John Abraham", "bollywood", "Actor", "m", 1, "co", "Maharashtra", 1972, {}],
  ["Irrfan Khan", "bollywood", "Actor", "m", 0, "co", "UP", 1976, {}],
  ["Anil Kapoor", "bollywood", "Actor", "m", 1, "co", "UP", 1956, {}],
  ["Abhishek Bachchan", "bollywood", "Actor", "m", 1, "co", "UP", 1976, {}],
  ["Pankaj Tripathi", "bollywood", "Actor", "m", 1, "co", "UP", 1977, {}],
  ["Kay Kay Menon", "bollywood", "Actor", "m", 1, "co", "Bengal", 1968, {}],
  ["Naseeruddin Shah", "bollywood", "Actor", "m", 1, "co", "Gujarat", 1947, {}],
  ["Manoj Bajpayee", "bollywood", "Actor", "m", 1, "co", "Bihar", 1972, {}],
  ["Anupam Kher", "bollywood", "Actor", "m", 1, "co", "Haryana", 1955, {}],
  ["Govinda", "bollywood", "Actor", "m", 1, "co", "UP", 1965, {}],
  ["Jackie Shroff", "bollywood", "Actor", "m", 1, "co", "UP", 1957, {}],
  ["Vicky Kaushal", "bollywood", "Actor", "m", 1, "co", "Haryana", 1988, {}],
  ["Siddharth Malhotra", "bollywood", "Actor", "m", 1, "co", "Maharashtra", 1985, {}],
  ["Arjun Kapoor", "bollywood", "Actor", "m", 1, "co", "Maharashtra", 1991, {}],
  ["Varun Dhawan", "bollywood", "Actor", "m", 1, "co", "Punjab", 1987, {}],
  ["Rajkummar Rao", "bollywood", "Actor", "m", 1, "co", "UP", 1983, {}],
  ["Karan Johar", "bollywood", "Director", "m", 1, "co", "Maharashtra", 1972, { director: true }],
  ["Sanjay Leela Bhansali", "bollywood", "Director", "m", 1, "co", "Maharashtra", 1963, { director: true }],
  ["Rakesh Roshan", "bollywood", "Director", "m", 1, "co", "Maharashtra", 1956, { director: true }],
  ["Aditya Chopra", "bollywood", "Director", "m", 1, "co", "UP", 1961, { director: true }],
  ["Rajinikanth", "bollywood", "Actor", "m", 1, "co", "TN", 1950, { lang: "tamil" }],
  ["Kamal Haasan", "bollywood", "Actor", "m", 1, "co", "TN", 1954, { lang: "tamil" }],
  ["Mammootty", "bollywood", "Actor", "m", 1, "co", "Kerala", 1960, { lang: "malayalam" }],
  ["Mohanlal", "bollywood", "Actor", "m", 1, "co", "Kerala", 1955, { lang: "malayalam" }],
  ["Chiranjeevi", "bollywood", "Actor", "m", 1, "co", "AP", 1965, { lang: "telugu" }],
  ["Pawan Kalyan", "bollywood", "Actor", "m", 1, "co", "AP", 1973, { lang: "telugu" }],
  ["Vijay Sethupathi", "bollywood", "Actor", "m", 1, "co", "TN", 1964, { lang: "tamil" }],
  ["Ajith Kumar", "bollywood", "Actor", "m", 1, "co", "TN", 1971, { lang: "tamil" }],
  ["Suriya", "bollywood", "Actor", "m", 1, "co", "TN", 1975, { lang: "tamil" }],
  ["Prabhas", "bollywood", "Actor", "m", 1, "co", "TN", 1979, { lang: "telugu" }],
  ["Allu Arjun", "bollywood", "Actor", "m", 1, "co", "AP", 1987, { lang: "telugu" }],
  ["Jr NTR", "bollywood", "Actor", "m", 1, "co", "TN", 1993, { lang: "telugu" }],
  ["Venkatesh", "bollywood", "Actor", "m", 1, "co", "AP", 1964, { lang: "telugu" }],
  ["Sridevi", "bollywood", "Actress", "f", 0, "co", "Maharashtra", 1963, {}],
  ["Kajol", "bollywood", "Actress", "f", 1, "co", "UP", 1974, {}],
  ["Rani Mukerji", "bollywood", "Actress", "f", 1, "co", "Bengal", 1978, {}],
  ["Vidya Balan", "bollywood", "Actress", "f", 1, "co", "Maharashtra", 1979, {}],
  ["Tabu", "bollywood", "Actress", "f", 1, "co", "TN", 1971, {}],
  ["Konkona Sen Sharma", "bollywood", "Actress", "f", 1, "co", "Bengal", 1977, {}],
  ["Hema Malini", "bollywood", "Actress", "f", 1, "mo", "UP", 1945, {}],
  ["Rekha", "bollywood", "Actress", "f", 1, "mo", "Maharashtra", 1953, {}],
  ["Juhi Chawla", "bollywood", "Actress", "f", 1, "co", "Haryana", 1975, {}],
  ["Shilpa Shetty", "bollywood", "Actress", "f", 1, "co", "Karnataka", 1975, {}],
  ["Twinkle Khanna", "bollywood", "Actress", "f", 1, "co", "Punjab", 1975, {}],
  ["Preity Zinta", "bollywood", "Actress", "f", 1, "co", "Punjab", 1979, {}],
  ["Sonam Kapoor", "bollywood", "Actress", "f", 1, "co", "UP", 1985, {}],
  ["Kriti Sanon", "bollywood", "Actress", "f", 1, "co", "Delhi", 1990, {}],
  ["Kiara Advani", "bollywood", "Actress", "f", 1, "co", "UP", 1992, {}],
  ["Sara Ali Khan", "bollywood", "Actress", "f", 1, "co", "UP", 1995, {}],
  ["Zoya Akhtar", "bollywood", "Director", "f", 1, "co", "Delhi", 1977, { director: true }],

  // ================= MUSIC =================
  ["Ilaiyaraaja", "music", "Music Composer", "m", 1, "co", "TN", 1943, { composer: true, lang: "tamil" }],
  ["P B S", "music", "Music Composer", "m", 0, "mo", "Bengal", 1934, { composer: true }],
  ["R D Burman", "music", "Music Composer", "m", 0, "mo", "Bengal", 1939, { composer: true }],
  ["S D Burman", "music", "Music Composer", "m", 0, "mo", "Bengal", 1915, { composer: true }],
  ["K L Saigal", "music", "Playback Singer", "m", 0, "mo", "Punjab", 1903, { playback: true }],
  ["Mukesh", "music", "Playback Singer", "m", 0, "mo", "Punjab", 1924, { playback: true }],
  ["Farida Khanum", "music", "Playback Singer", "f", 0, "mo", "UP", 1929, { playback: true }],
  ["Talat Mahmood", "music", "Playback Singer", "m", 0, "mo", "Punjab", 1924, { playback: true }],
  ["Udit Narayan", "music", "Playback Singer", "m", 1, "co", "UP", 1955, { playback: true }],
  ["Alka Yagnik", "music", "Playback Singer", "f", 1, "co", "Maharashtra", 1964, { playback: true }],
  ["Kailash Kher", "music", "Singer", "m", 1, "co", "HP", 1974, {}],
  ["Jagjit Singh", "music", "Singer", "m", 0, "mo", "Punjab", 1940, {}],
  ["Hridaynath Mangeshkar", "music", "Singer", "m", 0, "mo", "UP", 1947, {}],
  ["Chinmayi", "music", "Playback Singer", "f", 1, "co", "Maharashtra", 1985, { playback: true }],
  ["Shilpa Rao", "music", "Playback Singer", "f", 1, "co", "Maharashtra", 1984, { playback: true }],
  ["Neha Kakkar", "music", "Playback Singer", "f", 1, "co", "Punjab", 1989, { playback: true }],
  ["Benny Dayal", "music", "Playback Singer", "m", 1, "co", "Punjab", 1986, { playback: true }],
  ["Pritam", "music", "Music Composer", "m", 1, "co", "Delhi", 1974, { composer: true }],
  ["Vishal Bhardwaj", "music", "Music Composer", "m", 1, "co", "UP", 1964, { composer: true }],
  ["Amit Trivedi", "music", "Music Composer", "m", 1, "co", "Gujarat", 1966, { composer: true }],
  ["Anu Malik", "music", "Music Composer", "m", 1, "co", "Bihar", 1961, { composer: true }],
  ["Shubha Mudgal", "music", "Singer", "f", 1, "co", "Maharashtra", 1968, {}],
  ["Kavita Krishnamurthy", "music", "Playback Singer", "f", 1, "co", "Karnataka", 1963, { playback: true, lang: "kannada" }],
  ["Chitra", "music", "Playback Singer", "f", 1, "mo", "TN", 1950, { playback: true, lang: "tamil" }],
  ["KS Chithra", "music", "Playback Singer", "f", 1, "co", "Kerala", 1953, { playback: true, lang: "malayalam" }],
  ["SP Balasubrahmanyam", "music", "Playback Singer", "m", 0, "co", "TN", 1946, { playback: true, lang: "tamil" }],

  // ================= SPORTS =================
  ["Sunil Chhetri", "sports", "Footballer", "m", 1, "co", "Bengal", 1984, { sport: "football", champ: true }],
  ["Bhaichung Bhutia", "sports", "Footballer", "m", 1, "co", "Sikkim", 1973, { sport: "football", champ: true }],
  ["Irfan Panchal", "sports", "Footballer", "m", 1, "co", "Gujarat", 1990, { sport: "football", champ: true }],
  ["Lovlina Borgohain", "sports", "Footballer", "f", 1, "co", "Assam", 1985, { sport: "football", champ: true }],
  ["Vijender Singh", "sports", "Boxer", "m", 1, "co", "Haryana", 1983, { sport: "boxing", oly: true }],
  ["Vinesh Phogat", "sports", "Wrestler", "f", 1, "co", "Haryana", 1991, { sport: "wrestling", oly: true }],
  ["Bajrang Punia", "sports", "Wrestler", "m", 1, "co", "UP", 1998, { sport: "wrestling", oly: true }],
  ["Ravi Dahiya", "sports", "Wrestler", "m", 1, "co", "Haryana", 1990, { sport: "wrestling", champ: true }],
  ["Jaspal Rana", "sports", "Shooter", "m", 1, "co", "Haryana", 1981, { sport: "shooting", oly: true }],
  ["Anish Bhandari", "sports", "Shooter", "m", 1, "co", "Delhi", 1992, { sport: "shooting", oly: true }],
  ["Jwala Gutta", "sports", "Badminton Player", "f", 1, "co", "AP", 1983, { sport: "badminton", oly: true }],
  ["Ashwini Ponnappa", "sports", "Badminton Player", "f", 1, "co", "Karnataka", 1985, { sport: "badminton", oly: true }],
  ["Srikanth Kidambi", "sports", "Badminton Player", "m", 1, "co", "TN", 1991, { sport: "badminton", champ: true }],
  ["Mahesh Bhupathi", "sports", "Tennis Player", "m", 1, "co", "AP", 1973, { sport: "tennis", champ: true }],
  ["Rohan Bopanna", "sports", "Tennis Player", "m", 1, "co", "Maharashtra", 1986, { sport: "tennis", champ: true }],
  ["Ramkumar Ramanathan", "sports", "Tennis Player", "m", 1, "co", "Maharashtra", 1988, { sport: "tennis" }],
  ["Gukesh D", "sports", "Chess Grandmaster", "m", 1, "co", "TN", 2006, { sport: "chess", champ: true }],
  ["Praggnanandhaa", "sports", "Chess Grandmaster", "m", 1, "co", "TN", 2005, { sport: "chess", champ: true }],
  ["Humpy Koneru", "sports", "Chess Grandmaster", "f", 1, "co", "TN", 1989, { sport: "chess", champ: true }],
  ["Pentala Harikrishna", "sports", "Chess Grandmaster", "m", 1, "co", "AP", 1987, { sport: "chess", champ: true }],
  ["Vidit Gujrathi", "sports", "Chess Grandmaster", "m", 1, "co", "Delhi", 1990, { sport: "chess", champ: true }],
  ["Deepika Kumari", "sports", "Archery Player", "f", 1, "co", "UP", 1990, { sport: "archery", oly: true }],
  ["Praveen Bogati", "sports", "Archery Player", "m", 1, "co", "AP", 1984, { sport: "archery", oly: true }],
  ["Tejaswini", "sports", "Wrestler", "f", 1, "co", "AP", 1994, { sport: "wrestling", oly: true }],
  ["Pooja Dhanda", "sports", "Wrestler", "f", 1, "co", "UP", 1999, { sport: "wrestling", oly: true }],
  ["Nitesh Kumar", "sports", "Boxer", "m", 1, "co", "UP", 1992, { sport: "boxing", champ: true }],
  ["Manav Thakur", "sports", "Shooter", "m", 1, "co", "UP", 2000, { sport: "shooting", oly: true }],
  ["Chitrak Singh", "sports", "Shooter", "m", 1, "co", "Rajasthan", 1984, { sport: "shooting", oly: true }],
  ["KV Anuradha", "sports", "Weightlifter", "f", 1, "co", "TN", 1988, { sport: "weightlifting", oly: true }],
  ["Sarbjit Singh", "sports", "Weightlifter", "m", 1, "co", "Punjab", 1984, { sport: "weightlifting", oly: true }],

  // ================= BUSINESS =================
  ["Azim Premji", "business", "Industrialist", "m", 0, "co", "Karnataka", 1936, { industrialist: true }],
  ["Binny Bansal", "business", "Startup Founder", "m", 1, "co", "Delhi", 1980, { tech: true }],
  ["Kalyani Kumar", "business", "Technology CEO", "f", 1, "co", "Karnataka", 1982, { ceo: true, tech: true }],
  ["Deepinder Goyal", "business", "Startup Founder", "m", 1, "co", "UP", 1980, { tech: true }],
  ["N Chandrasekaran", "business", "Corporate CEO", "m", 1, "co", "TN", 1965, { ceo: true }],
  ["Jamsetji Tata", "business", "Industrialist", "m", 0, "h", "Gujarat", 1837, { industrialist: true }],
  ["FC Kohli", "business", "Industrialist", "m", 0, "mo", "Maharashtra", 1929, { industrialist: true }],
  ["K M Abdul Majeed", "business", "Industrialist", "m", 1, "co", "Bengal", 1952, { industrialist: true }],
  ["Dhirubhai Ambani", "business", "Industrialist", "m", 0, "co", "Gujarat", 1937, { industrialist: true }],
  ["Keshub Mahindra", "business", "Corporate CEO", "m", 1, "co", "Gujarat", 1957, { ceo: true }],
  ["Anand Mahindra", "business", "Corporate CEO", "m", 1, "co", "Maharashtra", 1958, { ceo: true }],
  ["S D Shibulal", "business", "Technology CEO", "m", 1, "co", "Karnataka", 1954, { ceo: true, tech: true }],
  ["Ritesh Agarwal", "business", "Startup Founder", "m", 1, "co", "Maharashtra", 1987, { tech: true }],

  // ================= ENTERTAINMENT =================
  ["Technical Guruji", "entertainment", "YouTuber", "m", 1, "co", "Gujarat", 1998, { yt: true, creator: true }],
  ["Shlok Vats", "entertainment", "YouTuber", "m", 1, "co", "Delhi", 1998, { yt: true, creator: true }],

  // ================= FAMOUS INDIA (real historical & modern) =================
  ["Lala Lajpat Rai", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Punjab", 1868, { ff: true }],
  ["Madan Mohan Malaviya", "famousIndia", "Freedom Fighter", "m", 0, "fr", "MP", 1861, { ff: true }],
  ["V D Savarkar", "famousIndia", "Freedom Fighter", "m", 1, "fr", "Maharashtra", 1883, { ff: true, writ: true }],
  ["Chittaranjan Das", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Bengal", 1870, { ff: true }],
  ["Sardar Patel", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Gujarat", 1884, { ff: true }],
  ["B C Roy", "famousIndia", "Freedom Fighter", "m", 1, "fr", "Bihar", 1887, { ff: true }],
  ["Aurobindo", "famousIndia", "Freedom Fighter", "m", 1, "fr", "Bengal", 1872, { ff: true, poet: true }],
  ["Vinoba Bhave", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Maharashtra", 1895, { ff: true }],
  ["Aruna Asaf Ali", "famousIndia", "Freedom Fighter", "f", 0, "fr", "MP", 1913, { ff: true }],
  ["Vijaya Lakshmi Pandit", "famousIndia", "Freedom Fighter", "f", 0, "fr", "UP", 1900, { ff: true }],
  ["Droupadi Murmu", "famousIndia", "Freedom Fighter", "f", 1, "fr", "Jharkhand", 1958, { ff: true, pol: true }],
  ["Shyamji Krishna Varma", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Punjab", 1873, { ff: true }],
  ["Bal Gangadhar Tilak", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Maharashtra", 1856, { ff: true, writ: true }],
  ["Gopal Krishna Gokhale", "famousIndia", "Freedom Fighter", "m", 0, "fr", "Maharashtra", 1866, { ff: true }],
  ["S R Ranganathan", "famousIndia", "Librarian", "m", 0, "mo", "TN", 1892, { sci: true }],
  ["Ramanujan", "famousIndia", "Mathematician", "m", 0, "mo", "TN", 1887, { sci: true }],
  ["Aryabhata", "famousIndia", "Mathematician", "m", 0, "h", "UP", 476, { sci: true }],
  ["Varahamihira", "famousIndia", "Astronomer", "m", 0, "h", "Gujarat", 505, { sci: true }],
  ["Brahmagupta", "famousIndia", "Mathematician", "m", 0, "h", "Gujarat", 598, { sci: true }],
  ["Bhaskara II", "famousIndia", "Mathematician", "m", 0, "h", "UP", 1114, { sci: true }],
  ["Charaka", "famousIndia", "Physician", "m", 0, "h", "MP", 300, { sci: true }],
  ["Sushruta", "famousIndia", "Surgeon", "m", 0, "h", "UP", 600, { sci: true }],
  ["Kalidasa", "famousIndia", "Poet", "m", 0, "h", "UP", 400, { poet: true, writ: true }],
  ["P D Bhende", "famousIndia", "Music Director", "m", 0, "mo", "Maharashtra", 1885, { ff: true, poet: true }],
];

// ============================================================================
// EXTENDED REAL PERSONALITY CATALOG (verified names from community list)
// ============================================================================
const MORE_CATALOG: CatalogEntry[] = [
  // ----- Cricket -----
  ["Ravichandran Ashwin", "cricket", "Cricketer", "m", 1, "co", "TN", 1986, { a: true, c: true, i: true }],
  ["Bhuvneshwar Kumar", "cricket", "Cricketer", "m", 1, "co", "Haryana", 1990, { b: true, c: true, i: true }],

  // ----- Bollywood / Regional actors -----
  ["Mahesh Babu", "bollywood", "Actor", "m", 1, "co", "AP", 1975, { lang: "telugu" }],
  ["Ram Charan", "bollywood", "Actor", "m", 1, "co", "AP", 1983, { lang: "telugu" }],
  ["Yash", "bollywood", "Actor", "m", 1, "co", "Karnataka", 1986, { lang: "kannada" }],
  ["Fahadh Faasil", "bollywood", "Actor", "m", 1, "co", "Kerala", 1983, { lang: "malayalam" }],
  ["Ajay Devgn", "bollywood", "Actor", "m", 1, "co", "UP", 1969, {}],
  ["Dhanush", "bollywood", "Actor", "m", 1, "co", "TN", 1983, { lang: "tamil" }],
  ["Shahid Kapoor", "bollywood", "Actor", "m", 1, "co", "UP", 1981, {}],
  ["Vikram", "bollywood", "Actor", "m", 1, "co", "TN", 1962, { lang: "tamil" }],
  ["Nani", "bollywood", "Actor", "m", 1, "co", "AP", 1982, { lang: "telugu" }],
  ["Dulquer Salmaan", "bollywood", "Actor", "m", 1, "co", "Kerala", 1987, { lang: "malayalam" }],
  ["Nawazuddin Siddiqui", "bollywood", "Actor", "m", 1, "co", "UP", 1974, {}],
  ["Naga Chaitanya", "bollywood", "Actor", "m", 1, "co", "AP", 1993, { lang: "telugu" }],
  ["Ayushmann Khurrana", "bollywood", "Actor", "m", 1, "co", "UP", 1984, {}],
  ["Vijay Deverakonda", "bollywood", "Actor", "m", 1, "co", "AP", 1992, { lang: "telugu" }],
  ["Kartik Aaryan", "bollywood", "Actor", "m", 1, "co", "UP", 1991, {}],
  ["Prithviraj Sukumaran", "bollywood", "Actor", "m", 1, "co", "Kerala", 1973, { lang: "malayalam" }],
  ["Tiger Shroff", "bollywood", "Actor", "m", 1, "co", "UP", 1990, {}],
  ["Prakash Raj", "bollywood", "Actor", "m", 1, "co", "TN", 1965, { lang: "tamil" }],
  ["Emraan Hashmi", "bollywood", "Actor", "m", 1, "co", "MP", 1974, {}],
  ["Paresh Rawal", "bollywood", "Actor", "m", 1, "co", "MP", 1956, {}],
  ["Om Puri", "bollywood", "Actor", "m", 0, "co", "Haryana", 1950, {}],
  ["Pankaj Kapur", "bollywood", "Actor", "m", 1, "co", "HP", 1954, {}],
  ["Boman Irani", "bollywood", "Actor", "m", 1, "co", "Gujarat", 1957, {}],
  ["Rajpal Yadav", "bollywood", "Actor", "m", 1, "co", "UP", 1960, {}],
  ["Diljit Dosanjh", "bollywood", "Actor & Singer", "m", 1, "co", "Punjab", 1984, { lang: "punjabi" }],
  ["Rishab Shetty", "bollywood", "Actor & Filmmaker", "m", 1, "co", "Karnataka", 1978, { lang: "kannada", director: true }],
  ["Satish Kaushik", "bollywood", "Actor & Filmmaker", "m", 1, "co", "UP", 1959, { director: true }],
  ["Nayanthara", "bollywood", "Actress", "f", 1, "co", "Kerala", 1990, { lang: "tamil" }],
  ["Nithya Menen", "bollywood", "Actress", "f", 1, "co", "Kerala", 1990, { lang: "malayalam" }],
  ["Taapsee Pannu", "bollywood", "Actress", "f", 1, "co", "UP", 1987, {}],
  ["Samantha Ruth Prabhu", "bollywood", "Actress", "f", 1, "co", "AP", 1991, { lang: "telugu" }],
  ["Shraddha Kapoor", "bollywood", "Actress", "f", 1, "co", "UP", 1991, {}],
  ["Rashmika Mandanna", "bollywood", "Actress", "f", 1, "co", "Karnataka", 1995, { lang: "kannada" }],
  ["Tamannaah Bhatia", "bollywood", "Actress", "f", 1, "co", "AP", 1991, { lang: "telugu" }],
  ["Ramya Krishnan", "bollywood", "Actress", "f", 1, "co", "TN", 1974, { lang: "tamil" }],
  ["Keerthy Suresh", "bollywood", "Actress", "f", 1, "co", "TN", 1992, { lang: "telugu" }],

  // ----- Filmmakers (directors) -----
  ["S. S. Rajamouli", "bollywood", "Filmmaker", "m", 1, "co", "AP", 1973, { director: true, lang: "telugu" }],
  ["Anurag Kashyap", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1969, { director: true }],
  ["Rohit Shetty", "bollywood", "Filmmaker", "m", 1, "co", "Karnataka", 1973, { director: true }],
  ["Rajkumar Hirani", "bollywood", "Filmmaker", "m", 1, "co", "Maharashtra", 1970, { director: true }],
  ["Imtiaz Ali", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1971, { director: true }],
  ["Farhan Akhtar", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1974, { director: true }],
  ["Anurag Basu", "bollywood", "Filmmaker", "m", 1, "co", "Bengal", 1969, { director: true }],
  ["Yash Chopra", "bollywood", "Filmmaker", "m", 0, "mo", "UP", 1932, { director: true }],
  ["David Dhawan", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1956, { director: true }],
  ["Mahesh Bhatt", "bollywood", "Filmmaker", "m", 1, "co", "Gujarat", 1957, { director: true }],
  ["Subhash Ghai", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1955, { director: true }],
  ["Shekhar Kapur", "bollywood", "Filmmaker", "m", 1, "mo", "UP", 1945, { director: true }],
  ["Rakeysh Omprakash Mehra", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1963, { director: true }],
  ["Shoojit Sircar", "bollywood", "Filmmaker", "m", 1, "co", "Bengal", 1974, { director: true }],
  ["Mani Ratnam", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1953, { director: true, lang: "tamil" }],
  ["Gautham Vasudev Menon", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1981, { director: true, lang: "tamil" }],
  ["Shankar", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1967, { director: true, lang: "tamil" }],
  ["Lokesh Kanagaraj", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1982, { director: true, lang: "tamil" }],
  ["Vetrimaaran", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1983, { director: true, lang: "tamil" }],
  ["Atlee", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1983, { director: true, lang: "tamil" }],
  ["Karthik Subbaraj", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1983, { director: true, lang: "tamil" }],
  ["H. Vinoth", "bollywood", "Filmmaker", "m", 1, "co", "TN", 1973, { director: true, lang: "tamil" }],
  ["Trivikram Srinivas", "bollywood", "Filmmaker", "m", 1, "co", "AP", 1977, { director: true, lang: "telugu" }],
  ["Koratala Siva", "bollywood", "Filmmaker", "m", 1, "co", "AP", 1985, { director: true, lang: "telugu" }],
  ["Sukumar", "bollywood", "Filmmaker", "m", 1, "co", "AP", 1976, { director: true, lang: "telugu" }],
  ["Nag Ashwin", "bollywood", "Filmmaker", "m", 1, "co", "AP", 1981, { director: true, lang: "telugu" }],
  ["Krish Jagarlamudi", "bollywood", "Filmmaker", "m", 1, "co", "AP", 1985, { director: true, lang: "telugu" }],
  ["Vivek Agnihotri", "bollywood", "Filmmaker", "m", 1, "co", "UP", 1973, { director: true }],
  ["Lijo Jose Pellissery", "bollywood", "Filmmaker", "m", 1, "co", "Kerala", 1980, { director: true, lang: "malayalam" }],
  ["Dileesh Pothan", "bollywood", "Filmmaker", "m", 1, "co", "Kerala", 1974, { director: true, lang: "malayalam" }],
  ["Aashiq Abu", "bollywood", "Filmmaker", "m", 1, "co", "Kerala", 1983, { director: true, lang: "malayalam" }],
  ["Anjali Menon", "bollywood", "Filmmaker", "f", 1, "co", "Kerala", 1974, { director: true, lang: "malayalam" }],
  ["Jeo Baby", "bollywood", "Filmmaker", "m", 1, "co", "Kerala", 1986, { director: true, lang: "malayalam" }],

  // ----- TV comedians -----
  ["Johnny Lever", "entertainment", "Comedian", "m", 1, "co", "UP", 1944, { tv: true, creator: true }],
  ["Sunil Grover", "entertainment", "Comedian", "m", 1, "co", "UP", 1983, { tv: true, creator: true }],
  ["Vir Das", "entertainment", "Comedian & Actor", "m", 1, "co", "Delhi", 1982, { tv: true, creator: true }],
  ["Biswa Kalyan Rath", "entertainment", "Comedian", "m", 1, "co", "Odisha", 1978, { tv: true, creator: true }],
  ["Zakir Khan", "entertainment", "Comedian", "m", 1, "co", "UP", 1979, { tv: true, creator: true }],
  ["Bharti Singh", "entertainment", "Comedian", "f", 1, "co", "Delhi", 1982, { tv: true, creator: true }],
  ["Kanan Gill", "entertainment", "Comedian", "m", 1, "co", "HP", 1983, { tv: true, creator: true }],
  ["Kenny Sebastian", "entertainment", "Comedian", "m", 1, "co", "Kerala", 1978, { tv: true, creator: true }],
  ["Abhishek Upmanyu", "entertainment", "Comedian", "m", 1, "co", "UP", 1975, { tv: true, creator: true }],

  // ----- Singers (playback & modern) -----
  ["Shankar Mahadevan", "music", "Singer & Composer", "m", 1, "co", "TN", 1972, { playback: true }],
  ["Hariharan", "music", "Playback Singer", "m", 1, "co", "TN", 1966, { playback: true, lang: "tamil" }],
  ["K. J. Yesudas", "music", "Playback Singer", "m", 1, "co", "Kerala", 1950, { playback: true, lang: "malayalam" }],
  ["Sid Sriram", "music", "Playback Singer", "m", 1, "co", "TN", 1987, { playback: true }],
  ["KK", "music", "Playback Singer", "m", 1, "co", "TN", 1971, { playback: true, lang: "tamil" }],
  ["Mohammed Rafi", "music", "Playback Singer", "m", 0, "mo", "UP", 1924, { playback: true }],
  ["Manna Dey", "music", "Playback Singer", "m", 0, "mo", "Bengal", 1919, { playback: true }],
  ["Hemant Kumar", "music", "Playback Singer", "m", 0, "mo", "Bengal", 1920, { playback: true }],
  ["Geeta Dutt", "music", "Playback Singer", "f", 0, "mo", "UP", 1930, { playback: true }],
  ["Bombay Jayashri", "music", "Carnatic Singer", "f", 1, "co", "TN", 1973, { lang: "tamil" }],
  ["Abhijeet Bhattacharya", "music", "Playback Singer", "m", 1, "co", "UP", 1976, { playback: true }],
  ["Shaan", "music", "Playback Singer", "m", 1, "co", "UP", 1975, { playback: true }],
  ["Mohit Chauhan", "music", "Playback Singer", "m", 1, "co", "UP", 1977, { playback: true }],
  ["Javed Ali", "music", "Playback Singer", "m", 1, "co", "Haryana", 1979, { playback: true }],
  ["Atif Aslam", "music", "Playback Singer", "m", 1, "co", "Punjab", 1985, { playback: true }],
  ["Monali Thakur", "music", "Playback Singer", "f", 1, "co", "Bengal", 1983, { playback: true }],
  ["Kanika Kapoor", "music", "Playback Singer", "f", 1, "co", "Delhi", 1985, { playback: true }],
  ["Palak Muchhal", "music", "Playback Singer", "f", 1, "co", "UP", 1986, { playback: true }],
  ["Tulsi Kumar", "music", "Playback Singer", "f", 1, "co", "UP", 1989, { playback: true }],
  ["Sadhana Sargam", "music", "Playback Singer", "f", 1, "co", "UP", 1977, { playback: true }],
  ["Vishal Dadlani", "music", "Singer & Composer", "m", 1, "co", "UP", 1979, { playback: true }],
  ["Shekhar Ravjiani", "music", "Singer & Composer", "m", 1, "co", "UP", 1978, { playback: true }],
  ["Vishal-Shekhar", "music", "Music Duo", "m", 1, "co", "UP", 1978, { playback: true }],
  ["Shankar-Ehsaan-Loy", "music", "Music Trio", "m", 1, "co", "UP", 1975, { composer: true }],
  ["Anirudh Ravichander", "music", "Music Composer", "m", 1, "co", "TN", 1995, { composer: true, lang: "tamil" }],
  ["Devi Sri Prasad", "music", "Music Composer", "m", 1, "co", "AP", 1971, { composer: true, lang: "telugu" }],

  // ----- Rappers -----
  ["Badshah", "music", "Rapper", "m", 1, "co", "UP", 1978, {}],
  ["Yo Yo Honey Singh", "music", "Rapper", "m", 1, "co", "Punjab", 1980, {}],
  ["Divine", "music", "Rapper", "m", 1, "co", "UP", 1991, {}],
  ["Raftaar", "music", "Rapper", "m", 1, "co", "UP", 1988, {}],
  ["Emiway Bantai", "music", "Rapper", "m", 1, "co", "UP", 1997, {}],
  ["King", "music", "Rapper", "m", 1, "co", "MP", 1996, {}],
  ["MC Stan", "music", "Rapper", "m", 1, "co", "Karnataka", 1998, {}],
  ["Krsna", "music", "Rapper", "m", 1, "co", "Karnataka", 1998, {}],
  ["Ikka", "music", "Rapper", "m", 1, "co", "Karnataka", 1995, {}],
  ["Naezy", "music", "Rapper", "m", 1, "co", "UP", 1991, {}],

  // ----- Classical / traditional music -----
  ["Nusrat Fateh Ali Khan", "music", "Qawwali Singer", "m", 0, "mo", "Punjab", 1948, {}],
  ["Bismillah Khan", "music", "Shehnai Maestro", "m", 0, "mo", "Bihar", 1916, {}],
  ["Ravi Shankar", "music", "Sitarist", "m", 0, "mo", "UP", 1920, {}],
  ["Hariprasad Chaurasia", "music", "Flutist", "m", 1, "co", "UP", 1953, {}],
  ["Shivkumar Sharma", "music", "Santoor Player", "m", 0, "mo", "HP", 1938, {}],
  ["Amjad Ali Khan", "music", "Sarod Player", "m", 1, "mo", "UP", 1945, {}],
  ["L. Subramaniam", "music", "Violinist", "m", 1, "co", "TN", 1947, { lang: "tamil" }],
  ["T. M. Krishna", "music", "Carnatic Singer", "m", 1, "co", "TN", 1957, { lang: "tamil" }],

  // ----- Sports -----
  ["Milkha Singh", "sports", "Athlete", "m", 0, "mo", "Punjab", 1929, { sport: "athletics", champ: true }],
  ["Hima Das", "sports", "Athlete", "f", 1, "co", "Assam", 1999, { sport: "athletics", oly: true }],
  ["Dipa Karmakar", "sports", "Gymnast", "f", 1, "co", "Bengal", 1995, { sport: "gymnastics", oly: true }],
  ["Sushil Kumar", "sports", "Wrestler", "m", 1, "co", "UP", 1982, { sport: "wrestling", oly: true }],
  ["Yogeshwar Dutt", "sports", "Wrestler", "m", 1, "co", "UP", 1982, { sport: "wrestling", oly: true }],
  ["Dhanraj Pillay", "sports", "Hockey Player", "m", 1, "co", "TN", 1978, { sport: "hockey", champ: true }],
  ["Manu Bhaker", "sports", "Shooter", "f", 1, "co", "UP", 2002, { sport: "shooting", oly: true }],
  ["Gagan Narang", "sports", "Shooter", "m", 1, "co", "UP", 1984, { sport: "shooting", oly: true }],
  ["Saurabh Chaudhary", "sports", "Shooter", "m", 1, "co", "UP", 1998, { sport: "shooting", oly: true }],
  ["Mirabai Chanu", "sports", "Weightlifter", "f", 1, "co", "Bihar", 1993, { sport: "weightlifting", oly: true }],
  ["Dutee Chand", "sports", "Sprinter", "f", 1, "co", "Odisha", 1990, { sport: "athletics", oly: true }],
  ["H. S. Prannoy", "sports", "Badminton Player", "m", 1, "co", "AP", 1986, { sport: "badminton", oly: true }],
  ["Lakshya Sen", "sports", "Badminton Player", "m", 1, "co", "TN", 2006, { sport: "badminton", champ: true }],

  // ----- Business -----
  ["Sundar Pichai", "business", "Business Executive", "m", 1, "co", "TN", 1972, { ceo: true, tech: true }],
  ["Vineet Nayyar", "business", "Business Executive", "m", 1, "co", "India", 1965, { ceo: true }],
  ["Sanjay Mehrotra", "business", "Business Executive", "m", 1, "co", "UP", 1962, { ceo: true }],
  ["R. Gopalakrishnan", "business", "Business Executive", "m", 1, "co", "India", 1960, { ceo: true }],
  ["Deepak Parekh", "business", "Businessman", "m", 1, "co", "Maharashtra", 1950, { ceo: true }],
  ["Kumar Mangalam Birla", "business", "Businessman", "m", 1, "co", "UP", 1962, { ceo: true, industrialist: true }],
  ["Sanjiv Goenka", "business", "Businessman", "m", 1, "co", "UP", 1958, { ceo: true }],
  ["Radhakishan Damani", "business", "Businessman", "m", 1, "co", "AP", 1957, { ceo: true }],
  ["Uday Kotak", "business", "Banker", "m", 1, "co", "Maharashtra", 1957, { ceo: true }],
  ["Karsanbhai Patel", "business", "Entrepreneur", "m", 1, "co", "Gujarat", 1970, {}],
  ["Ronnie Screwvala", "business", "Entrepreneur", "m", 1, "co", "Karnataka", 1956, { ceo: true }],
  ["Kunal Shah", "business", "Entrepreneur", "m", 1, "co", "Maharashtra", 1988, { tech: true }],
  ["Sridhar Vembu", "business", "Entrepreneur", "m", 1, "co", "TN", 1974, { tech: true }],
  ["Vineet Rai", "business", "Entrepreneur", "m", 1, "co", "UP", 1962, { ceo: true }],
  ["Sanjeev Bikhchandani", "business", "Entrepreneur", "m", 1, "co", "UP", 1965, { ceo: true }],
  ["Sam Pitroda", "business", "Technologist", "m", 1, "mo", "Maharashtra", 1941, { tech: true }],
  ["Bharti Mittal", "business", "Businessperson", "f", 1, "co", "Delhi", 1967, { ceo: true }],

  // ----- Scientists & space -----
  ["Vikram Sarabhai", "famousIndia", "Scientist", "m", 0, "mo", "Gujarat", 1919, { sci: true }],
  ["K. Sivan", "famousIndia", "Scientist", "m", 1, "co", "TN", 1962, { sci: true }],
  ["Satish Dhawan", "famousIndia", "Scientist", "m", 0, "mo", "UP", 1935, { sci: true }],
  ["Tessy Thomas", "famousIndia", "Scientist", "f", 1, "co", "Kerala", 1955, { sci: true }],
  ["Gagandeep Kang", "famousIndia", "Scientist", "f", 1, "co", "Punjab", 1965, { sci: true }],
  ["Venkatraman Ramakrishnan", "famousIndia", "Scientist", "m", 1, "co", "TN", 1952, { sci: true }],
  ["G. Madhavan Nair", "famousIndia", "Scientist", "m", 1, "mo", "TN", 1955, { sci: true }],
  ["R. A. Mashelkar", "famousIndia", "Scientist", "m", 1, "mo", "Maharashtra", 1946, { sci: true }],
  ["S. Chandrasekhar", "famousIndia", "Scientist", "m", 1, "co", "TN", 1956, { sci: true }],
  ["U. R. Rao", "famousIndia", "Scientist", "m", 0, "mo", "Karnataka", 1924, { sci: true }],
  ["A. Sivathanu Pillai", "famousIndia", "Scientist", "m", 1, "co", "India", 1960, { sci: true }],
  ["Homi Sethna", "famousIndia", "Nuclear Scientist", "m", 0, "mo", "Maharashtra", 1931, { sci: true }],
  ["Anil Kakodkar", "famousIndia", "Nuclear Scientist", "m", 1, "mo", "Punjab", 1954, { sci: true }],
  ["Subrahmanyan Chandrasekhar", "famousIndia", "Astrophysicist", "m", 0, "mo", "Bengal", 1910, { sci: true }],
  ["Narinder Singh Kapany", "famousIndia", "Physicist", "m", 0, "mo", "Punjab", 1926, { sci: true }],
  ["Ashoke Sen", "famousIndia", "Physicist", "m", 1, "co", "Bengal", 1950, { sci: true }],
  ["Rohini Godbole", "famousIndia", "Physicist", "f", 1, "co", "Maharashtra", 1966, { sci: true }],
  ["C. N. R. Rao", "famousIndia", "Chemist", "m", 0, "mo", "AP", 1922, { sci: true }],
  ["G. N. Ramachandran", "famousIndia", "Biophysicist", "m", 0, "mo", "Kerala", 1938, { sci: true }],
  ["K. Kasturirangan", "famousIndia", "Space Scientist", "m", 1, "mo", "TN", 1945, { sci: true }],
  ["A. S. Kiran Kumar", "famousIndia", "Space Scientist", "m", 1, "co", "Karnataka", 1957, { sci: true }],
  ["K. Radhakrishnan", "famousIndia", "Space Scientist", "m", 1, "co", "TN", 1950, { sci: true }],
  ["Subbiah Arunan", "famousIndia", "Space Scientist", "m", 1, "co", "TN", 1955, { sci: true }],
  ["Rakesh Sharma", "famousIndia", "Astronaut", "m", 1, "mo", "Haryana", 1948, { sci: true }],
  ["Aditi Pant", "famousIndia", "Oceanographer", "f", 1, "co", "UP", 1978, { sci: true }],

  // ----- Other public figures -----
  ["Arvind Panagariya", "famousIndia", "Economist", "m", 1, "co", "Bihar", 1954, {}],
  ["T. N. Seshan", "famousIndia", "Civil Servant", "m", 0, "mo", "UP", 1921, {}],

  // ----- Politicians -----
  ["S. Jaishankar", "famousIndia", "Politician", "m", 1, "co", "TN", 1957, { pol: true }],
  ["Rahul Gandhi", "famousIndia", "Politician", "m", 1, "co", "UP", 1973, { pol: true }],
  ["Amit Shah", "famousIndia", "Politician", "m", 1, "co", "Gujarat", 1967, { pol: true }],
  ["Mamata Banerjee", "famousIndia", "Politician", "f", 1, "co", "Bengal", 1955, { pol: true }],
  ["Arvind Kejriwal", "famousIndia", "Politician", "m", 1, "co", "Haryana", 1968, { pol: true }],
  ["Yogi Adityanath", "famousIndia", "Politician", "m", 1, "co", "UP", 1968, { pol: true }],
  ["Nirmala Sitharaman", "famousIndia", "Politician", "f", 1, "co", "Karnataka", 1970, { pol: true }],
  ["M. K. Stalin", "famousIndia", "Politician", "m", 1, "co", "TN", 1959, { pol: true }],
  ["Priyanka Gandhi Vadra", "famousIndia", "Politician", "f", 1, "co", "UP", 1981, { pol: true }],
  ["Akhilesh Yadav", "famousIndia", "Politician", "m", 1, "co", "UP", 1971, { pol: true }],
  ["Nitish Kumar", "famousIndia", "Politician", "m", 1, "co", "Bihar", 1951, { pol: true }],
  ["Sharad Pawar", "famousIndia", "Politician", "m", 1, "mo", "Maharashtra", 1940, { pol: true }],
  ["Uddhav Thackeray", "famousIndia", "Politician", "m", 1, "co", "Maharashtra", 1966, { pol: true }],
  ["Naveen Patnaik", "famousIndia", "Politician", "m", 1, "mo", "Odisha", 1941, { pol: true }],
  ["Hemant Soren", "famousIndia", "Politician", "m", 1, "co", "Jharkhand", 1967, { pol: true }],
  ["Mayawati", "famousIndia", "Politician", "f", 1, "co", "UP", 1965, { pol: true }],
  ["Omar Abdullah", "famousIndia", "Politician", "m", 1, "co", "J&K", 1964, { pol: true }],
  ["Himanta Biswa Sarma", "famousIndia", "Politician", "m", 1, "co", "Assam", 1982, { pol: true }],
  ["Devendra Fadnavis", "famousIndia", "Politician", "m", 1, "co", "Maharashtra", 1961, { pol: true }],
  ["Smriti Irani", "famousIndia", "Politician", "f", 1, "co", "UP", 1971, { pol: true }],
  ["Sitaram Yechury", "famousIndia", "Politician", "m", 1, "co", "Karnataka", 1952, { pol: true }],
  ["J. Jayalalithaa", "famousIndia", "Politician", "f", 0, "mo", "TN", 1948, { pol: true }],
  ["P. Chidambaram", "famousIndia", "Politician", "m", 1, "mo", "TN", 1947, { pol: true }],
  ["N. Chandrababu Naidu", "famousIndia", "Politician", "m", 1, "co", "AP", 1950, { pol: true }],
  ["Sharad Yadav", "famousIndia", "Politician", "m", 0, "mo", "UP", 1938, { pol: true }],
  ["Sonia Gandhi", "famousIndia", "Politician", "f", 1, "co", "India", 1946, { pol: true }],
  ["Rajnath Singh", "famousIndia", "Politician", "m", 1, "co", "UP", 1951, { pol: true }],
  ["Nitin Gadkari", "famousIndia", "Politician", "m", 1, "co", "Maharashtra", 1950, { pol: true }],
  ["Piyush Goyal", "famousIndia", "Politician", "m", 1, "co", "UP", 1959, { pol: true }],
  ["Manish Sisodia", "famousIndia", "Politician", "m", 1, "co", "UP", 1968, { pol: true }],
  ["Shivraj Singh Chouhan", "famousIndia", "Politician", "m", 1, "co", "MP", 1964, { pol: true }],
  ["M. Karunanidhi", "famousIndia", "Politician", "m", 0, "mo", "TN", 1929, { pol: true }],
  ["K. Chandrashekar Rao", "famousIndia", "Politician", "m", 1, "co", "Telangana", 1958, { pol: true }],
  ["Lalu Prasad Yadav", "famousIndia", "Politician", "m", 1, "mo", "Bihar", 1948, { pol: true }],
  ["Tejashwi Yadav", "famousIndia", "Politician", "m", 1, "co", "Bihar", 1987, { pol: true }],
  ["Mehbooba Mufti", "famousIndia", "Politician", "f", 1, "mo", "J&K", 1973, { pol: true }],
  ["Farooq Abdullah", "famousIndia", "Politician", "m", 1, "mo", "J&K", 1957, { pol: true }],
  ["Arvind Sawant", "famousIndia", "Politician", "m", 1, "mo", "Maharashtra", 1956, { pol: true }],
  ["Raj Thackeray", "famousIndia", "Politician", "m", 1, "co", "Maharashtra", 1975, { pol: true }],
  ["Asaduddin Owaisi", "famousIndia", "Politician", "m", 1, "co", "UP", 1969, { pol: true }],
  ["Shashi Tharoor", "famousIndia", "Politician", "m", 1, "co", "Kerala", 1970, { pol: true }],
  ["Atal Bihari Vajpayee", "famousIndia", "Politician", "m", 0, "mo", "MP", 1924, { pol: true }],
  ["Rajiv Gandhi", "famousIndia", "Politician", "m", 0, "mo", "UP", 1944, { pol: true }],
  ["Manmohan Singh", "famousIndia", "Economist & Politician", "m", 0, "mo", "Punjab", 1932, { pol: true }],
  ["K. R. Narayanan", "famousIndia", "President & Politician", "m", 0, "mo", "Kerala", 1920, { pol: true }],
];

for (const p of buildFromCatalog([...EXTRA_CATALOG, ...MORE_CATALOG])) {
  if (!seen.has(p.id)) {
    seen.add(p.id);
    PERSONALITIES.push(p);
  }
}

export const TOTAL_CANDIDATES = PERSONALITIES.length;

// User-taught personalities (loaded from localStorage)
export type UserPersonality = {
  id: string; // user_ prefix
  name: string;
  category: Category;
  profession: string;
  gender: "male" | "female";
  living: boolean;
  era: "contemporary";
  emoji: string;
  famousFor: string;
  achievements: string[];
  interestingFact: string;
  organization?: string;
  region?: string;
  traits: Record<string, boolean | string | number>;
  isUser: true;
};

export function getAllPersonalities(): Personality[] {
  if (typeof window === "undefined") return PERSONALITIES;
  try {
    const raw = localStorage.getItem("ba_user_personalities");
    if (!raw) return PERSONALITIES;
    const user = JSON.parse(raw) as UserPersonality[];
    return [...PERSONALITIES, ...user];
  } catch {
    return PERSONALITIES;
  }
}

export function saveUserPersonality(p: UserPersonality) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem("ba_user_personalities");
  const list: UserPersonality[] = raw ? JSON.parse(raw) : [];
  // Remove duplicate names
  const filtered = list.filter((x) => x.name.toLowerCase() !== p.name.toLowerCase());
  filtered.push(p);
  localStorage.setItem("ba_user_personalities", JSON.stringify(filtered));
}

// Categories in the actual personality DB
export const CATEGORY_IDS: Category[] = ["cricket", "bollywood", "sports", "music", "business", "entertainment", "famousIndia"];
