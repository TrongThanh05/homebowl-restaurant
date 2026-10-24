// src/components/common/AnimatedLayer.jsx
import { useEffect, useState } from 'react';

export default function AnimatedLayer({
  as: Tag = 'div',
  appear,
  delay = 0,
  active,
  className = '',
  children,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [active, delay]);

  const isShown = active && visible;
  const state = isShown
    ? `animated ${appear} animate__animated animate__${appear} visible-true`
    : 'animated visible-false';

  return (
    <Tag className={`layer-slick1 ${className} ${state}`} {...rest}>
      {children}
    </Tag>
  );
}
