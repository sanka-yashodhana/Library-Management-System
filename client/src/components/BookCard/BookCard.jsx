import { useNavigate } from 'react-router-dom';
import './BookCard.css';

export default function BookCard({ book, onBorrow, showBorrowBtn = false }) {
  const navigate = useNavigate();
  const available = book.availableCopies > 0;

  return (
    <div className="book-card" onClick={() => navigate(`/student/books/${book.id}`)}>
      <div className="book-card-cover" style={{ backgroundColor: book.coverColor }}>
        <div className="book-card-cover-pattern"></div>
        <div className="book-card-cover-text">
          <span className="book-card-cover-title">{book.title}</span>
          <span className="book-card-cover-author">{book.author}</span>
        </div>
        <div className={`book-card-badge ${available ? 'available' : 'unavailable'}`}>
          {available ? `${book.availableCopies} Available` : 'Unavailable'}
        </div>
      </div>
      <div className="book-card-body">
        <p className="book-card-category">{book.category}</p>
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
        <div className="book-card-meta">
          <span className="book-card-year">{book.year > 0 ? book.year : `${Math.abs(book.year)} BC`}</span>
          <span className="book-card-rating">★ {book.rating}</span>
        </div>
        {showBorrowBtn && (
          <button
            className={`book-card-btn ${!available ? 'disabled' : ''}`}
            disabled={!available}
            onClick={(e) => {
              e.stopPropagation();
              if (available && onBorrow) onBorrow(book);
            }}
          >
            {available ? 'Borrow Book' : 'Not Available'}
          </button>
        )}
      </div>
    </div>
  );
}
