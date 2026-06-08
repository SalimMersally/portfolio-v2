import { defineType, defineField } from 'sanity';

export const education = defineType({
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: [
    defineField({ name: 'degree', title: 'Degree', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'field', title: 'Field of Study', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'institution', title: 'Institution', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({
      name: 'logo',
      title: 'Institution Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'gpa', title: 'GPA', type: 'string', description: 'e.g. 3.8/4.0' }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'endDate', title: 'End Date', type: 'date' }),
    defineField({
      name: 'highlights',
      title: 'Highlights / Activities',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'order', title: 'Display Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'degree', subtitle: 'institution', media: 'logo' },
  },
});
