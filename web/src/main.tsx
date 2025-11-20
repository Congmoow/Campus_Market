import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 早期主题注入：在 React 渲染前应用 body/html 属性，避免初始闪烁或错误主题
try {
  const persisted = localStorage.getItem('theme-storage');
  if (persisted) {
    const parsed = JSON.parse(persisted);
    let theme = parsed?.state?.theme || 'light';
    // 一次性迁移：如果历史遗留为 dark，强制迁移到 light（只执行一次）
    if (theme === 'dark' && !localStorage.getItem('THEME_MIGRATED_TO_LIGHT')) {
      theme = 'light';
      localStorage.setItem('theme-storage', JSON.stringify({ ...parsed, state: { ...(parsed?.state || {}), theme: 'light' } }));
      localStorage.setItem('THEME_MIGRATED_TO_LIGHT', '1');
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.removeAttribute('arco-theme');
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

