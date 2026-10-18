import { describe, expect, it } from "vitest";
import { lessons } from "./catalog";
import { filterLessons, getLesson, neighboringLessons, readingMinutes } from "./queries";

describe("catalogue queries", () => {
  it("estimates a reading time from the lesson text", () => {
    const lesson = getLesson("cybersecurity-fundamentals");
    expect(lesson).toBeDefined();
    expect(readingMinutes(lesson!)).toBeGreaterThan(0);
  });

  it("filters by topic, difficulty, and text", () => {
    const cryptography = filterLessons({
      query: "ML-KEM",
      topicId: "cryptography",
      difficulty: "Intermediate",
    });
    expect(cryptography.matches.map((lesson) => lesson.slug)).toEqual(["post-quantum-cryptography"]);

    const none = filterLessons({ query: "zzzz-not-a-lesson", topicId: "all", difficulty: "all" });
    expect(none.matches).toHaveLength(0);
    expect(none.unknownTopic).toBe(false);
  });

  it("rejects an unknown topic instead of showing every lesson", () => {
    const result = filterLessons({ query: "", topicId: "not-a-topic", difficulty: "all" });
    expect(result.unknownTopic).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it("finds the previous and next sample lessons", () => {
    const neighbors = neighboringLessons("quantum-computing-and-cryptography");
    expect(neighbors.previous?.slug).toBe("quantum-computing-fundamentals");
    expect(neighbors.next?.slug).toBe("post-quantum-cryptography");
    expect(lessons).toHaveLength(6);
  });
});
