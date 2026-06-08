export type BookStatus = 'reading' | 'read' | 'want-to-read';

export interface Book {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  note?: string;
  status: BookStatus;
  finishedDate?: string;
  order?: number;
}
