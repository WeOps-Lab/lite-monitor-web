'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/icon';
import { useTheme } from '@/context/theme';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const handleToggle = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div onClick={handleToggle} className='flex items-center cursor-pointer ml-4 text-xl'>
      {isDarkMode ? <Icon type='anse' /> : <Icon type='liangse' />}
    </div>
  );
}

export default ThemeSwitcher;