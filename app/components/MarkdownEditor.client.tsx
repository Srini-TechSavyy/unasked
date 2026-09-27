import { useRef } from "react";

const tools: { label: string; before: string; after?: string }[] = [
  { label: "H1", before: "# ", after: "" },
  { label: "H2", before: "## ", after: "" },
  { label: "H3", before: "### ", after: "" },
  { label: "Bold", before: "**", after: "**" },
  { label: "Italic", before: "_", after: "_" },
  { label: "Quote", before: "> ", after: "" },
  { label: "Link", before: "[", after: "](https://)" },
  { label: "Image", before: "![alt](", after: ")" },
  { label: "Code", before: "```\n", after: "\n```" },
];

export function MarkdownEditor({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: string;
  label?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyTool(before: string, after = "") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    const insertion = `${before}${selected}${after}`;
    const next =
      el.value.slice(0, start) + insertion + el.value.slice(end);
    el.value = next;
    const cursor = start + before.length + selected.length;
    el.focus();
    el.setSelectionRange(cursor, cursor);
  }

  return (
    <div className="editor-field">
      {label ? (
        <label className="field-label" htmlFor={name}>{label}</label>
      ) : null}
      <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            className="editor-tool"
            onClick={() => applyTool(tool.before, tool.after)}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="editor-textarea"
        rows={22}
        spellCheck
      />
    </div>
  );
}
