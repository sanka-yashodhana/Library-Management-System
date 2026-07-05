import { useState, useEffect } from 'react';
import './BookForm.css';

const CATEGORIES = [
  'Computer Science', 'Literature', 'Physics', 'Mathematics',
  'History', 'Biology', 'Chemistry', 'Social Science', 'Business', 'Self-Help', 'Other'
];

const COVER_COLORS = [
  '#325FE8', '#EE582C', '#DCAD26', '#A551FF', '#2FD17A',
  '#33C6D7', '#FF9450', '#FF5B62', '#45E6AE', '#D471FF',
  '#4E9BFF', '#FFD152', '#96BDFF', '#BCABFF', '#B5FFC8'
];

const defaultForm = {
  title: '', author: '', isbn: '', category: 'Computer Science',
  totalCopies: 1, availableCopies: 1, coverColor: '#325FE8',
  description: '', year: new Date().getFullYear(), publisher: '',
  pages: '', language: 'English', rating: 4.0
};

export default function BookForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData || defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData || defaultForm);
    setErrors({});
  }, [initialData]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required';
    if (!form.publisher.trim()) e.publisher = 'Publisher is required';
    if (form.totalCopies < 1) e.totalCopies = 'Must have at least 1 copy';
    if (form.availableCopies < 0) e.availableCopies = 'Cannot be negative';
    if (form.availableCopies > form.totalCopies) e.availableCopies = 'Cannot exceed total copies';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...form,
        totalCopies: Number(form.totalCopies),
        availableCopies: Number(form.availableCopies),
        year: Number(form.year),
        pages: Number(form.pages),
        rating: Number(form.rating)
      });
    }
  };

  const Field = ({ label, error, children }) => (
    <div className="book-form-field">
      <label className="book-form-label">{label}</label>
      {children}
      {error && <p className="book-form-error">{error}</p>}
    </div>
  );

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <div className="book-form-grid">
        <Field label="Title *" error={errors.title}>
          <input className={`book-form-input ${errors.title ? 'error' : ''}`} value={form.title}
            onChange={e => set('title', e.target.value)} placeholder="Book title" />
        </Field>
        <Field label="Author *" error={errors.author}>
          <input className={`book-form-input ${errors.author ? 'error' : ''}`} value={form.author}
            onChange={e => set('author', e.target.value)} placeholder="Author name" />
        </Field>
        <Field label="ISBN *" error={errors.isbn}>
          <input className={`book-form-input ${errors.isbn ? 'error' : ''}`} value={form.isbn}
            onChange={e => set('isbn', e.target.value)} placeholder="978-..." />
        </Field>
        <Field label="Category">
          <select className="book-form-input" value={form.category}
            onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Publisher *" error={errors.publisher}>
          <input className={`book-form-input ${errors.publisher ? 'error' : ''}`} value={form.publisher}
            onChange={e => set('publisher', e.target.value)} placeholder="Publisher name" />
        </Field>
        <Field label="Year Published">
          <input type="number" className="book-form-input" value={form.year}
            onChange={e => set('year', e.target.value)} placeholder="2024" />
        </Field>
        <Field label="Total Copies *" error={errors.totalCopies}>
          <input type="number" min="1" className={`book-form-input ${errors.totalCopies ? 'error' : ''}`}
            value={form.totalCopies} onChange={e => set('totalCopies', e.target.value)} />
        </Field>
        <Field label="Available Copies *" error={errors.availableCopies}>
          <input type="number" min="0" className={`book-form-input ${errors.availableCopies ? 'error' : ''}`}
            value={form.availableCopies} onChange={e => set('availableCopies', e.target.value)} />
        </Field>
        <Field label="Pages">
          <input type="number" className="book-form-input" value={form.pages}
            onChange={e => set('pages', e.target.value)} placeholder="Number of pages" />
        </Field>
        <Field label="Rating">
          <input type="number" min="0" max="5" step="0.1" className="book-form-input"
            value={form.rating} onChange={e => set('rating', e.target.value)} />
        </Field>
      </div>

      <Field label="Description">
        <textarea className="book-form-input book-form-textarea" value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Brief description of the book..." rows={3} />
      </Field>

      <div className="book-form-field">
        <label className="book-form-label">Cover Color</label>
        <div className="book-form-colors">
          {COVER_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`book-form-color-btn ${form.coverColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => set('coverColor', color)}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="book-form-actions">
        <button type="button" className="book-form-btn cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="book-form-btn submit">
          {initialData ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}
