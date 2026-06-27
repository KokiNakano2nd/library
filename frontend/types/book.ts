export type Book = {
  id: number;
  title: string;
  author: string;
  published_year: number | null;
  isbn: string | null;
  created_at: string;
  updated_at: string;
};

export type BookInput = {
  title: string;
  author: string;
  published_year: number | null;
  isbn: string | null;
};
