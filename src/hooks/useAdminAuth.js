import { useState } from 'react';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pwd = prompt('Enter admin password:');
      if (!pwd) return;

      const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      if (pwd === expectedPassword) {
        setIsAdmin(true);
      } else {
        alert('Incorrect password!');
      }
    }
  };

  return { isAdmin, handleAdminToggle };
}
