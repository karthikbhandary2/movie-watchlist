import { useState } from 'react';

export default function RatingStars({ value = 0, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(null);
  const displayValue = hovered ?? value;

  return (
    <div style={{ display: 'flex', gap: 4, cursor: readOnly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <span
          key={star}
          style={{
            fontSize: 20,
            color: star <= displayValue ? '#f5c518' : '#ccc',
            transition: 'color 0.1s',
          }}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: 14, alignSelf: 'center', color: '#666' }}>
        {value ? `${value}/10` : ''}
      </span>
    </div>
  );
}