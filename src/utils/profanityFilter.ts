// List of profane words in English and Indonesian
const profaneWords = [
  // English profanity
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "cunt",
  "dick",
  "pussy",
  "cock",
  "whore",
  "slut",
  "bastard",
  "motherfucker",
  "piss",
  "damn",
  "crap",
  "bullshit",
  "twat",

  // Indonesian profanity
  "anjing",
  "bangsat",
  "kontol",
  "memek",
  "ngentot",
  "jancok",
  "cok",
  "asu",
  "bajingan",
  "bego",
  "goblok",
  "tolol",
  "bodoh",
  "bejad",
  "setan",
  "keparat",
  "brengsek",
  "kampret",
  "sialan",
  "monyet",
];

/**
 * Checks if text contains any profane words
 * @param text Text to check for profanity
 * @returns Whether the text contains profane words
 */
export const containsProfanity = (text: string): boolean => {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check for whole words to avoid false positives
  return profaneWords.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lowerText);
  });
};

/**
 * Checks if a post should be removed based on profanity in its content or title
 * @param post Post object with title and content
 * @returns Whether the post should be removed
 */
export const shouldRemovePost = (post: {
  title: string;
  content: string;
}): boolean => {
  return containsProfanity(post.title) || containsProfanity(post.content);
};
