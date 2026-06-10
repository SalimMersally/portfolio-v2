export type BookStatus = 'reading' | 'read' | 'want-to-read';

export interface Book {
  _id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: BookStatus;
  rating?: number;
  order: number;
}

export function validateBook(b: Book): boolean {
  return !!(b?._id && b.title && b.author && b.coverUrl && b.status && b.order != null);
}
