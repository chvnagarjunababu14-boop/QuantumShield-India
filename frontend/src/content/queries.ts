import { learningPaths, lessons, topics } from "./catalog";
import type { Difficulty, LearningPath, Lesson, LessonBlock, Topic } from "./types";

const WORDS_PER_MINUTE = 200;

export type LessonFilters = {
  query: string;
  topicId: string;
  difficulty: Difficulty | "all";
};

export type FilterResult = {
  matches: Lesson[];
  unknownTopic: boolean;
};

export function getTopic(topicId: string): Topic | undefined {
  return topics.find((topic) => topic.id === topicId);
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getPathForLesson(slug: string): LearningPath | undefined {
  return learningPaths.find((path) => path.lessonSlugs.includes(slug));
}

export function lessonHeadings(lesson: Lesson): { id: string; text: string }[] {
  return lesson.blocks.flatMap((block) =>
    block.type === "heading" ? [{ id: block.id, text: block.text }] : [],
  );
}

export function neighboringLessons(slug: string): {
  previous?: Lesson;
  next?: Lesson;
} {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) {
    return {};
  }
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

export function readingMinutes(lesson: Lesson): number {
  const words = lessonText(lesson).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function getLessonsForTopic(topicId: string): Lesson[] {
  const topic = getTopic(topicId);
  if (!topic) return [];
  if (topic.lessonSlugs && topic.lessonSlugs.length > 0) {
    return lessons.filter((lesson) => topic.lessonSlugs!.includes(lesson.slug));
  }
  return lessons.filter((lesson) => lesson.topicId === topicId);
}

export function filterLessons(filters: LessonFilters): FilterResult {
  const topicKnown = filters.topicId === "all" || topics.some((topic) => topic.id === filters.topicId);
  const needle = filters.query.trim().toLowerCase();
  const selectedTopic = filters.topicId !== "all" ? getTopic(filters.topicId) : undefined;

  const matches = lessons.filter((lesson) => {
    if (!topicKnown) {
      return false;
    }
    if (filters.topicId !== "all") {
      const matchesTopic =
        lesson.topicId === filters.topicId ||
        (selectedTopic?.lessonSlugs?.includes(lesson.slug) ?? false);
      if (!matchesTopic) {
        return false;
      }
    }
    if (filters.difficulty !== "all" && lesson.difficulty !== filters.difficulty) {
      return false;
    }
    if (needle === "") {
      return true;
    }
    return lessonSearchText(lesson).includes(needle);
  });

  return { matches, unknownTopic: !topicKnown };
}

export function featuredLessons(): Lesson[] {
  return lessons.filter((lesson) => lesson.featured);
}

function lessonSearchText(lesson: Lesson): string {
  const matchingTopics = topics.filter(
    (t) => t.id === lesson.topicId || (t.lessonSlugs?.includes(lesson.slug) ?? false),
  );
  const topicTitles = matchingTopics.map((t) => t.title).join(" ");
  return [lesson.title, lesson.summary, topicTitles, lesson.difficulty, lessonText(lesson)]
    .join(" ")
    .toLowerCase();
}

function lessonText(lesson: Lesson): string {
  return lesson.blocks.map(blockText).join(" ");
}

function blockText(block: LessonBlock): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return block.text;
    case "list":
      return block.items.join(" ");
    case "callout":
    case "concept":
      return `${block.title} ${block.text}`;
    case "code":
      return `${block.label} ${block.code}`;
    case "link":
      return block.label;
    case "illustration":
      return block.caption;
    case "quiz":
      return block.questions
        .map(
          (question) =>
            `${question.prompt} ${question.explanation} ${question.choices.map((choice) => choice.label).join(" ")}`,
        )
        .join(" ");
  }
}
