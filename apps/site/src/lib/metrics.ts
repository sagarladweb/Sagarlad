// Single source of truth for every headline number/claim on the site.
// Edit here once — it propagates to the homepage, about, books, speaking
// and newsletter surfaces. Keep every number honest and easy to grow.

export const METRICS = {
  // Profile
  booksPublished: "6",
  yearsExperience: "15",
  countriesWorked: "9",
  communityReached: "10K+",

  // Speaking
  keynotes: "25+",
  speakingAudience: "25K+",

  // Books
  booksSold: "10,000+",
  bookReaders: "1M+",
} as const;