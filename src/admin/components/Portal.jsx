import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  const el = useRef(document.createElement('div'));

  useEffect(() => {
    const container = el.current;
    document.body.appendChild(container);
    return () => document.body.removeChild(container);
  }, []);

  return createPortal(children, el.current);
}