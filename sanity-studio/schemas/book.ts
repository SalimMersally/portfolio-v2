import { defineType, defineField } from "sanity";

export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cover",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["reading", "read", "want-to-read"], layout: "radio" },
      initialValue: "read",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "cover" },
  },
});
