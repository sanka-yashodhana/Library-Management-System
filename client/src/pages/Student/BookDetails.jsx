import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBorrowings } from '../../context/BorrowingsContext';
import Modal from '../../components/Modal/Modal';
import { Library, BookOpen, CheckCircle2, AlertTriangle, BookMarked, ArrowLeft, ChevronRight } from 'lucide-react';
import './BookDetails.css';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { books, booksLoading, borrowBook, isBookBorrowed } = useBorrowings();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justBorrowed, setJustBorrowed] = useState(false);
  const [borrowError, setBorrowError] = useState('');

  const book = books.find(b => b._id === id);

  if (booksLoading) {
    return (
      <div className="book-not-found">
        <Library size={60} strokeWidth={1} />
        <h2>Loading...</h2>
        <p>Please wait while we fetch the book details.</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-not-found">
        <BookOpen size={60} strokeWidth={1} />
        <h2>Book Not Found</h2>
        <p>The book you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/student/books')}>
          <ArrowLeft size={14} strokeWidth={2} style={{display:'inline', marginRight:4, verticalAlign:'middle'}} />
          Back to Books
        </button>
      </div>
    );
  }

  const alreadyBorrowed = isBookBorrowed(book._id);
  const isAvailable = book.availableCopies > 0;

  const handleConfirmBorrow = async () => {
    const result = await borrowBook(book);
    setConfirmOpen(false);
    if (result.success) {
      setJustBorrowed(true);
      setBorrowError('');
    } else {
      setBorrowError(result.error);
    }
  };

  const relatedBooks = books
    .filter(b => b.category === book.category && b._id !== book._id)
    .slice(0, 3);

  return (
    <div className="book-details">
      <button className="back-btn" onClick={() => navigate('/student/books')}>
        <ArrowLeft size={14} strokeWidth={2.5} style={{display:'inline', marginRight:4, verticalAlign:'middle'}} />
        Back to Books
      </button>

      <div className="book-details-hero">
        <div className="book-details-cover" style={{ background: `linear-gradient(145deg, ${book.coverColor}, ${book.coverColor}99)` }}>
          <div className="cover-pattern" />
          <div className="cover-content">
            <h2>{book.title}</h2>
            <p>{book.author}</p>
          </div>
        </div>

        <div className="book-details-info">
          <div className="book-details-category">{book.category}</div>
          <h1 className="book-details-title">{book.title}</h1>
          <p className="book-details-author">by <strong>{book.author}</strong></p>

          <div className="book-details-rating">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={s <= Math.round(book.rating) ? 'star filled' : 'star'}>★</span>
            ))}
            <span className="rating-val">{book.rating}</span>
            <span className="rating-label">out of 5</span>
          </div>

          <div className="book-details-availability">
            <div className={`avail-badge ${isAvailable ? 'available' : 'unavailable'}`}>
              {isAvailable
                ? <><CheckCircle2 size={15} strokeWidth={2} style={{marginRight:6}} /> {book.availableCopies} of {book.totalCopies} copies available</>
                : <><AlertTriangle size={15} strokeWidth={2} style={{marginRight:6}} /> All {book.totalCopies} copies checked out</>}
            </div>
          </div>

          <div className="book-details-meta-grid">
            <div className="meta-item"><span>ISBN</span><strong>{book.isbn}</strong></div>
            <div className="meta-item"><span>Publisher</span><strong>{book.publisher}</strong></div>
            <div className="meta-item"><span>Year</span><strong>{book.year > 0 ? book.year : `${Math.abs(book.year)} BC`}</strong></div>
            <div className="meta-item"><span>Pages</span><strong>{book.pages}</strong></div>
            <div className="meta-item"><span>Language</span><strong>{book.language}</strong></div>
            <div className="meta-item"><span>Category</span><strong>{book.category}</strong></div>
          </div>

          <div className="book-details-description">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>

          {borrowError && (
            <div className="borrow-error-msg">
              <AlertTriangle size={14} strokeWidth={2} style={{display:'inline', marginRight:5, verticalAlign:'middle'}} />
              {borrowError}
            </div>
          )}

          {alreadyBorrowed ? (
            <div className="already-borrowed">
              <BookMarked size={15} strokeWidth={1.75} style={{display:'inline', marginRight:6, verticalAlign:'middle'}} />
              You currently have this book checked out.{' '}
              <button className="link-btn" onClick={() => navigate('/student/borrowings')}>
                View My Borrowings <ChevronRight size={13} strokeWidth={2.5} style={{display:'inline', verticalAlign:'middle'}} />
              </button>
            </div>
          ) : justBorrowed ? (
            <div className="borrow-success-msg">
              <CheckCircle2 size={15} strokeWidth={2} style={{display:'inline', marginRight:6, verticalAlign:'middle'}} />
              Successfully borrowed! Due in 14 days.{' '}
              <button className="link-btn" onClick={() => navigate('/student/borrowings')}>
                View My Borrowings <ChevronRight size={13} strokeWidth={2.5} style={{display:'inline', verticalAlign:'middle'}} />
              </button>
            </div>
          ) : (
            <button
              className={`borrow-btn ${!isAvailable ? 'disabled' : ''}`}
              disabled={!isAvailable}
              onClick={() => setConfirmOpen(true)}
            >
              {isAvailable
                ? <><BookOpen size={16} strokeWidth={2} style={{display:'inline', marginRight:7, verticalAlign:'middle'}} />Borrow This Book</>
                : 'Currently Unavailable'}
            </button>
          )}
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="related-books">
          <h3>More in {book.category}</h3>
          <div className="related-books-grid">
            {relatedBooks.map(rb => (
              <div
                key={rb._id}
                className="related-book-card"
                onClick={() => navigate(`/student/books/${rb._id}`)}
              >
                <div className="related-cover" style={{ background: `linear-gradient(135deg, ${rb.coverColor}, ${rb.coverColor}99)` }}>
                  <span>{rb.title.charAt(0)}</span>
                </div>
                <div className="related-info">
                  <p className="related-title">{rb.title}</p>
                  <p className="related-author">{rb.author}</p>
                  <span className={`related-avail ${rb.availableCopies > 0 ? 'yes' : 'no'}`}>
                    {rb.availableCopies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Borrow" size="small">
        <div className="confirm-borrow-modal">
          <p>Are you sure you want to borrow <strong>"{book.title}"</strong>?</p>
          <p className="confirm-due">
            Due date: <strong>{getDueDate()}</strong>
          </p>
          <div className="confirm-actions">
            <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleConfirmBorrow}>Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
