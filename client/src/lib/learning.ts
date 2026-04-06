import { useEffect, useState } from "react";

export type LearningRecord = {
  poemId: number;
  isLearned: boolean;
  isFavorite: boolean;
  correctCount: number;
  totalAttempts: number;
  lastLearnedAt: string | null;
  updatedAt: string;
};

type LearningRecordMap = Record<number, LearningRecord>;

const STORAGE_KEY = "poetry-learning-records";
const UPDATE_EVENT = "poetry-learning-records-updated";

const createEmptyRecord = (poemId: number): LearningRecord => ({
  poemId,
  isLearned: false,
  isFavorite: false,
  correctCount: 0,
  totalAttempts: 0,
  lastLearnedAt: null,
  updatedAt: new Date(0).toISOString(),
});

function readRecordMap(): LearningRecordMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LearningRecordMap;
  } catch {
    return {};
  }
}

function writeRecordMap(recordMap: LearningRecordMap) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recordMap));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function updateRecord(poemId: number, updater: (record: LearningRecord) => LearningRecord) {
  const recordMap = readRecordMap();
  const currentRecord = recordMap[poemId] ?? createEmptyRecord(poemId);
  const nextRecord = updater(currentRecord);

  recordMap[poemId] = {
    ...nextRecord,
    poemId,
    updatedAt: new Date().toISOString(),
  };

  writeRecordMap(recordMap);
  return recordMap[poemId];
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => onChange();
  window.addEventListener(UPDATE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(UPDATE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function getLearningRecords() {
  return Object.values(readRecordMap()).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function useLearningRecords() {
  const [records, setRecords] = useState<LearningRecord[]>(() => getLearningRecords());

  useEffect(() => {
    return subscribe(() => {
      setRecords(getLearningRecords());
    });
  }, []);

  return records;
}

export function useLearningRecord(poemId: number) {
  const records = useLearningRecords();
  return records.find((record) => record.poemId === poemId) ?? createEmptyRecord(poemId);
}

export function toggleFavorite(poemId: number) {
  return updateRecord(poemId, (record) => ({
    ...record,
    isFavorite: !record.isFavorite,
  }));
}

export function recordQuestionAttempt(poemId: number, isCorrect: boolean) {
  return updateRecord(poemId, (record) => ({
    ...record,
    totalAttempts: record.totalAttempts + 1,
    correctCount: record.correctCount + (isCorrect ? 1 : 0),
  }));
}

export function markPoemLearned(poemId: number) {
  return updateRecord(poemId, (record) => ({
    ...record,
    isLearned: true,
    lastLearnedAt: new Date().toISOString(),
  }));
}
