import { defineField, defineType } from 'sanity';

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      description: 'Your headshot — shown in the About section.',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'A short paragraph about yourself (2–4 sentences).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      description: 'Key stats shown as large numbers (e.g. "4+" / "Years Experience").',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "4+"' }),
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Years Experience"' }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'bio' },
    prepare({ title }) {
      return { title: 'About', subtitle: title?.slice(0, 60) };
    },
  },
});
