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
