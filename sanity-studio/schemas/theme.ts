import { defineType, defineField } from 'sanity';

export const theme = defineType({
  name: 'theme',
  title: 'Theme Settings',
  type: 'document',
  fields: [
    defineField({ name: 'colorAccent', title: 'Accent Color', type: 'string', description: 'Hex color, e.g. #6366f1' }),
    defineField({ name: 'colorBg', title: 'Background Color', type: 'string', description: 'Hex color' }),
    defineField({ name: 'colorSurface', title: 'Surface Color', type: 'string', description: 'Cards, navbar, code blocks' }),
    defineField({ name: 'colorText', title: 'Primary Text Color', type: 'string' }),
    defineField({ name: 'colorTextMuted', title: 'Muted Text Color', type: 'string' }),
    defineField({ name: 'fontHeading', title: 'Heading Font', type: 'string', description: 'Google Font name, e.g. Inter' }),
    defineField({ name: 'fontBody', title: 'Body Font', type: 'string', description: 'Google Font name, e.g. Inter' }),
    defineField({ name: 'fontMono', title: 'Mono Font', type: 'string', description: 'Google Font name, e.g. JetBrains Mono' }),
    defineField({
      name: 'defaultMode',
      title: 'Default Color Mode',
      type: 'string',
      options: { list: ['dark', 'light'], layout: 'radio' },
      initialValue: 'dark',
    }),
    defineField({
      name: 'borderRadius',
      title: 'Border Radius Style',
      type: 'string',
      options: { list: ['sharp', 'rounded', 'pill'], layout: 'radio' },
      initialValue: 'rounded',
    }),
    defineField({
      name: 'spacing',
      title: 'Spacing Density',
      type: 'string',
      options: { list: ['compact', 'comfortable', 'spacious'], layout: 'radio' },
      initialValue: 'comfortable',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Theme Settings' }),
  },
});
