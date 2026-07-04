import { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ onSearch, onCategory, categories = [], placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onSearch(v);
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    onCategory(cat);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-input-wrapper">
        <Search className="search-bar-icon" size={16} strokeWidth={2.5} />
        <input
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button
            className="search-bar-clear"
            onClick={() => { setQuery(''); onSearch(''); }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {categories.length > 0 && (
        <div className="search-bar-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`search-bar-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
