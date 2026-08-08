import { defineType, defineField } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Web App Development"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "What a client gets — plain, specific, 1–2 sentences.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Display Order", type: "number", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
