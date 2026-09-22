export function buildExternalCoverImageSpec(title: string): string {
  const subject = title.trim() || "your article";

  return [
    `Generate a cover image to illustrate an article titled "${subject}".`,
    "",
    "Requirements:",
    "- Dimensions: 1200x630 pixels (landscape), or as close as your tool allows.",
    "- Format: JPG or PNG.",
    "- Do not include any text, words, letters, or logos in the image.",
    "- A single clear focal subject, suitable as a website banner/header image.",
    "- Content must be safe for a general school-community audience.",
    "- Do not depict real, identifiable people, children, or families — use illustrative, abstract, or generic stock-style imagery instead.",
  ].join("\n");
}
