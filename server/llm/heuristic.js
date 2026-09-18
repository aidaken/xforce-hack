/** Offline remake so the chat UI can be built before the OpenRouter key lands. */
export function heuristicRemake(learner, document, message) {
  const sentences = document.text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 8);

  const rationale = `I chose a ${learner === "adhd" ? "checklist" : "flowchart"} because this looks like a ${document.conceptType.replace("_", " ")} and the ${learner} profile asked for ${learner === "adhd" ? "one step at a time" : "short spatial labels"}.`;

  if (learner === "dyslexia") {
    const nodes = sentences.slice(0, 5).map((s, i) => {
      const label = s
        .replace(/^(the|a|an)\s+/i, "")
        .split(/\s+/)
        .slice(0, 5)
        .join(" ");
      return `${i + 1}. ${label}`;
    });
    return {
      rationale,
      format: "flowchart",
      text: [rationale, "", nodes.join("\n"), "", `You asked: ${message}`].join(
        "\n",
      ),
    };
  }

  const steps = sentences.map((s, i) => {
    const clipped = s.split(/\s+/).slice(0, 12).join(" ").replace(/\.$/, "");
    return `${i + 1}. ${clipped}.`;
  });
  return {
    rationale,
    format: "checklist",
    text: [rationale, "", "Do this next:", ...steps].join("\n"),
  };
}
