import { defineType, defineField } from 'sanity';

export const theme = defineType({
  name: 'theme',
  title: 'Theme Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'accentHue',
      title: 'Accent Hue (0–360)',
      type: 'number',
      description: 'OKLCh hue: 0/360 = red, 120 = green, 240 = blue, 258 = purple (default)',
      initialValue: 258,
      validation: (Rule) => Rule.min(0).max(360),
    }),
    defineField({
      name: 'accentChroma',
      title: 'Accent Chroma (0.0–0.4)',
      type: 'number',
      description: 'Color vividness in OKLCh: 0 = grey, 0.22 = vivid (default)',
      initialValue: 0.22,
      validation: (Rule) => Rule.min(0).max(0.4),
    }),
    defineField({ name: 'fontHeading', title: 'Heading Font', type: 'string', description: 'Google Font name, e.g. Space Grotesk' }),
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
