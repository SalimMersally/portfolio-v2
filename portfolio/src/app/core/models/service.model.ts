export interface Service {
  _id: string;
  title: string;
  description: string;
  order: number;
}

export function validateService(s: Service): boolean {
  return !!(s?._id && s.title && s.description && s.order != null);
}
