export interface SkillGroup {
  _id: string;
  category: string;
  items: string[];
  order: number;
}

export function validateSkillGroup(g: SkillGroup): boolean {
  return !!(
    g?._id &&
    g.category &&
    Array.isArray(g.items) &&
    g.items.length > 0 &&
    g.order != null
  );
}
