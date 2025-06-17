const profaneWords = [
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
];

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  return profaneWords.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lowerText);
  });
};

export const shouldRemovePost = (post: {
  title: string;
  content: string;
}): boolean => {
  return containsProfanity(post.title) || containsProfanity(post.content);
};
