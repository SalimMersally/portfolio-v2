import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { codeInput } from "@sanity/code-input";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "salim-portfolio",
  title: "Salim Portfolio",

  projectId: "46kdlm0d",
  dataset: "production",

  plugins: [
    codeInput(),
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Profile")
              .id("profile")
              .child(S.document().schemaType("profile").documentId("profile")),
            S.listItem()
              .title("About")
              .id("about")
              .child(S.document().schemaType("about").documentId("about")),
            S.divider(),
            S.documentTypeListItem("experience").title("Experience"),
            S.documentTypeListItem("skill").title("Skills"),
            S.documentTypeListItem("education").title("Education"),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("book").title("Books"),
            S.divider(),
            S.documentTypeListItem("post").title("Blog Posts"),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
