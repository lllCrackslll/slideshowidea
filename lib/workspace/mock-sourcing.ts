export type SourcingItem = {
  id: string;
  title: string;
  category: string;
  keyword: string;
  views: number;
  hoursAgo: number;
  ratio: number;
  slides: { text: string; imageHint: string }[];
  caption: string;
  hashtags: string[];
};

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
  "linear-gradient(160deg,#2d1b4e 0%,#1a1a2e 50%,#0d0d12 100%)",
  "linear-gradient(160deg,#1e3a5f 0%,#0f2027 50%,#203a43 100%)",
  "linear-gradient(160deg,#3d2b1f 0%,#1a1410 50%,#0d0d0d 100%)",
  "linear-gradient(160deg,#1a2332 0%,#243b55 50%,#141e30 100%)",
];

export function gradientForSlide(index: number): string {
  return PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
}

export const MOCK_SOURCING_FEED: SourcingItem[] = [
  {
    id: "src-1",
    title: "Study hack that actually works",
    category: "Études",
    keyword: "study hack",
    views: 842000,
    hoursAgo: 18,
    ratio: 12.4,
    slides: [
      { text: "I studied 4 hours.\nForgot everything in 3 days.", imageHint: "desk night study" },
      { text: "Re-reading was a lie.", imageHint: "notes scattered" },
      { text: "Spaced recall fixed it.", imageHint: "timeline dots" },
      { text: "This app automates my flashcards.", imageHint: "phone app screen" },
      { text: "Save this. Link in bio.", imageHint: "minimal desk" },
    ],
    caption: "Stop re-reading. Start recalling.\n\nSpaced repetition changed my grades.\n\nLink in bio if you want the shortcut.",
    hashtags: ["studytok", "productivity", "college", "studyhacks", "learning"],
  },
  {
    id: "src-2",
    title: "Morning routine for founders",
    category: "Productivité",
    keyword: "morning routine",
    views: 1200000,
    hoursAgo: 32,
    ratio: 9.8,
    slides: [
      { text: "5am club broke me.", imageHint: "alarm clock dark" },
      { text: "I needed 90 min not 5 hours.", imageHint: "sunrise window" },
      { text: "Move · Plan · Deep work.", imageHint: "notebook coffee" },
      { text: "My app tracks the 3 blocks.", imageHint: "habit tracker" },
      { text: "Try it free. Bio.", imageHint: "city morning" },
    ],
    caption: "You don't need a 5am club.\nYou need 90 focused minutes.\n\nWhat's your block 1?",
    hashtags: ["founder", "morningroutine", "productivity", "startup", "habits"],
  },
  {
    id: "src-3",
    title: "Budget app saved me $400",
    category: "Finance",
    keyword: "budget app",
    views: 560000,
    hoursAgo: 12,
    ratio: 15.2,
    slides: [
      { text: "$400 gone. No idea where.", imageHint: "bank notification" },
      { text: "Subscriptions were the leak.", imageHint: "phone subscriptions" },
      { text: "One dashboard. One rule.", imageHint: "charts minimal" },
      { text: "This app flagged 7 charges.", imageHint: "finance app ui" },
      { text: "Link in bio. No shame.", imageHint: "wallet desk" },
    ],
    caption: "I found $400/month in ghost subscriptions.\n\nOne app. One Sunday review.\n\nBio for the tool I use.",
    hashtags: ["moneytok", "budgeting", "personalfinance", "savemoney", "apps"],
  },
  {
    id: "src-4",
    title: "Fitness app accountability",
    category: "Fitness",
    keyword: "workout app",
    views: 980000,
    hoursAgo: 24,
    ratio: 11.1,
    slides: [
      { text: "Gym 3x then quit. Again.", imageHint: "gym bag floor" },
      { text: "Motivation isn't the problem.", imageHint: "empty gym mirror" },
      { text: "Streaks + tiny wins.", imageHint: "checklist phone" },
      { text: "This app never lets me skip.", imageHint: "fitness tracker" },
      { text: "30-day challenge. Bio.", imageHint: "running shoes" },
    ],
    caption: "Stop restarting Monday.\n\nStreaks beat motivation.\n\nApp in bio — 30 days free.",
    hashtags: ["fitness", "gymtok", "workout", "motivation", "health"],
  },
];

export function filterSourcingFeed(
  items: SourcingItem[],
  keyword: string,
  category: string,
  minRatio: number,
): SourcingItem[] {
  return items.filter((item) => {
    const kw = keyword.trim().toLowerCase();
    const matchKw =
      !kw ||
      item.keyword.toLowerCase().includes(kw) ||
      item.title.toLowerCase().includes(kw);
    const matchCat = category === "all" || item.category === category;
    const matchRatio = item.ratio >= minRatio;
    return matchKw && matchCat && matchRatio;
  });
}
