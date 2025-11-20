export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * 聊天消息时间格式化：
 * - 当天：只显示 HH:mm
 * - 本周内非当天：显示 周几 HH:mm
 * - 非本周：显示 M月D号 HH:mm
 */
export const formatChatTime = (raw: string): string => {
  if (!raw) return '';

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    const match = raw.match(/(\d{1,2}:\d{2})/);
    return match ? match[1] : raw;
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const hhmm = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return hhmm;
  }

  const getWeekStart = (d: Date) => {
    const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = res.getDay() || 7; // 周一为一周开始
    res.setDate(res.getDate() - day + 1);
    res.setHours(0, 0, 0, 0);
    return res;
  };

  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  if (date >= weekStart && date < weekEnd) {
    const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const w = names[date.getDay()];
    return `${w} ${hhmm}`;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}号 ${hhmm}`;
};
