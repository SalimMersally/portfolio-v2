import { defineType, defineField } from 'sanity';

export const book = defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'author', title: 'Author', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'cover',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'rating', title: 'Rating (1–5)', type: 'number', validation: (r) => r.min(1).max(5) }),
    defineField({ name: 'note', title: 'Short Note / Takeaway', type: 'text', rows: 2 }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['reading', 'read', 'want-to-read'], layout: 'radio' },
      initialValue: 'read',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'finishedDate', title: 'Finished Date', type: 'date' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'author', media: 'cover' },
  },
});
