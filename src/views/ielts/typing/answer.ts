export const typingWords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

export const isTypingAnswerCorrect = (input: string, answer: string): boolean => {
  const expected = typingWords(answer).join(" ");
  return Boolean(expected) && typingWords(input).join(" ") === expected;
};
