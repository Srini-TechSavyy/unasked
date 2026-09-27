import { Form } from "react-router";
import { MarkdownEditor } from "~/components/MarkdownEditor.client";
import { TOPICS } from "~/lib/topics";

export function ArticleEditorForm({
  title,
  error,
  defaultValues,
}: {
  title: string;
  error?: string;
  defaultValues?: {
    title?: string;
    subtitle?: string;
    excerpt?: string;
    content?: string;
    topic?: string;
    tags?: string;
    cover_image?: string;
    medium_url?: string;
    status?: string;
    slug?: string;
  };
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      {error ? (
        <p className="mt-4 text-sm text-red-800 bg-red-50 border border-red-100 px-3 py-2">
          {error}
        </p>
      ) : null}
      <Form method="post" className="mt-8 space-y-6">
        <Field label="Title" name="title" required defaultValue={defaultValues?.title} />
        <Field
          label="Slug"
          name="slug"
          hint="Leave blank to generate from the title. Must be unique."
          defaultValue={defaultValues?.slug}
        />
        <Field label="Subtitle" name="subtitle" defaultValue={defaultValues?.subtitle} />
        <Field label="Excerpt" name="excerpt" defaultValue={defaultValues?.excerpt} />
        <div>
          <label className="field-label" htmlFor="topic">Topic</label>
          <select
            id="topic"
            name="topic"
            defaultValue={defaultValues?.topic ?? ""}
            className="field-input"
          >
            <option value="">Select a topic</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
        <Field
          label="Tags"
          name="tags"
          hint="Comma-separated"
          defaultValue={defaultValues?.tags}
        />
        <Field
          label="Cover image URL"
          name="cover_image"
          defaultValue={defaultValues?.cover_image}
        />
        <Field
          label="Medium URL"
          name="medium_url"
          defaultValue={defaultValues?.medium_url}
        />
        <MarkdownEditor
          name="content"
          label="Content"
          defaultValue={defaultValues?.content}
        />
        <input type="hidden" name="status" value={defaultValues?.status ?? "draft"} />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" name="intent" value="draft" className="btn-secondary">
            Save Draft
          </button>
          <button type="submit" name="intent" value="publish" className="btn-primary">
            Publish
          </button>
        </div>
      </Form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      {hint ? <p className="field-hint">{hint}</p> : null}
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="field-input"
      />
    </div>
  );
}
