export default function BooksLoading() {
  return (
    <main>
      <header className="page-header">
        <p className="eyebrow">Books</p>
        <h1>Book list</h1>
      </header>
      <section className="status" aria-live="polite">
        <h2>Loading</h2>
        <p>Loading books from the API.</p>
      </section>
    </main>
  );
}
