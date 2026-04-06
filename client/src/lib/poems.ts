import poemsData from "@/data/poems.json";
import { withBaseUrl } from "@/lib/hashLocation";

export type Poem = {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  category: "节气" | "节日";
  season?: string;
  festival?: string;
  translation: string;
  background: string;
  imageUrl: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export const SEASON_MAP: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};

export const FESTIVAL_MAP: Record<string, string> = {
  "spring-festival": "春节",
  "lantern-festival": "元宵节",
  "cold-food": "寒食节",
  qingming: "清明节",
  "dragon-boat": "端午节",
  qixi: "七夕节",
  "mid-autumn": "中秋节",
  chongyang: "重阳节",
  "new-year-eve": "除夕",
};

export const ALL_POEMS = (poemsData as Poem[]).slice().sort((a, b) => a.id - b.id);

const poemMap = new Map(ALL_POEMS.map((poem) => [poem.id, poem]));
const authorPool = Array.from(new Set(ALL_POEMS.map((poem) => poem.author)));
const dynastyPool = Array.from(new Set(ALL_POEMS.map((poem) => poem.dynasty)));
const solarTermPool = Array.from(
  new Set(ALL_POEMS.filter((poem) => poem.category === "节气").map((poem) => poem.festival).filter(Boolean))
) as string[];
const festivalPool = Array.from(
  new Set(ALL_POEMS.filter((poem) => poem.category === "节日").map((poem) => poem.festival).filter(Boolean))
) as string[];

function hashSeed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function shuffleWithSeed(items: string[], seed: string) {
  return items
    .map((item, index) => ({
      item,
      order: hashSeed(`${seed}-${item}-${index}`),
    }))
    .sort((left, right) => left.order - right.order)
    .map(({ item }) => item);
}

function buildOptions(correctAnswer: string, pool: string[], seed: string) {
  const distractors = shuffleWithSeed(
    pool.filter((item) => item && item !== correctAnswer),
    `${seed}-distractors`
  ).slice(0, 3);

  return shuffleWithSeed([...distractors, correctAnswer], `${seed}-options`);
}

export function getPoemById(id: number) {
  return poemMap.get(id);
}

export function getPoemsByCategory(category: string) {
  const season = SEASON_MAP[category];
  if (season) {
    return ALL_POEMS.filter((poem) => poem.season === season);
  }

  const festival = FESTIVAL_MAP[category];
  if (festival) {
    return ALL_POEMS.filter((poem) => poem.festival === festival);
  }

  return [];
}

export function getCategoryDisplayName(category: string) {
  return SEASON_MAP[category] || FESTIVAL_MAP[category] || "诗词";
}

export function getPoemImageUrl(poem: Poem) {
  return withBaseUrl(poem.imageUrl);
}

export function getQuizQuestions(poem: Poem): QuizQuestion[] {
  const eventName = poem.festival || (poem.category === "节气" ? poem.season || "四季" : "传统节日");
  const eventPool = poem.category === "节气" ? solarTermPool : festivalPool;
  const eventQuestion = poem.category === "节气" ? "这首诗对应哪个节气？" : "这首诗和哪个传统节日有关？";

  return [
    {
      id: `${poem.id}-author`,
      question: "这首诗的作者是谁？",
      options: buildOptions(poem.author, authorPool, `${poem.id}-author`),
      correctAnswer: poem.author,
      explanation: `《${poem.title}》的作者是${poem.author}。`,
    },
    {
      id: `${poem.id}-dynasty`,
      question: "这首诗创作于哪个朝代？",
      options: buildOptions(poem.dynasty, dynastyPool, `${poem.id}-dynasty`),
      correctAnswer: poem.dynasty,
      explanation: `这首诗创作于${poem.dynasty}代。`,
    },
    {
      id: `${poem.id}-event`,
      question: eventQuestion,
      options: buildOptions(eventName, eventPool, `${poem.id}-event`),
      correctAnswer: eventName,
      explanation: `这首诗和${eventName}的文化意境紧密相关。`,
    },
  ];
}
