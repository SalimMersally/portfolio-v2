import { defineType, defineField } from "sanity";

export const profile = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Job Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", title: "Email", type: "string", validation: (r) => r.required() }),
    defineField({ name: "phone", title: "Phone", type: "string", validation: (r) => r.required() }),
    defineField({ name: "location", title: "Location", type: "string", validation: (r) => r.required() }),
    defineField({ name: "github", title: "GitHub URL", type: "url", validation: (r) => r.required() }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url", validation: (r) => r.required() }),
    defineField({ name: "cv", title: "CV / Resume", type: "file", validation: (r) => r.required() }),
    defineField({
      name: "contactIntro",
      title: "Contact Intro",
      type: "text",
      description: "Short paragraph shown above the contact form.",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "title" },
  },
});
