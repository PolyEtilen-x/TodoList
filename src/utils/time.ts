export const getRelativeTime = (dateString: string, language: string = 'en'): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isVi = language === 'vi';

  // If the server date is slightly in the future due to clock drift
  if (diffSecs < 0) {
    return isVi ? 'Vừa xong' : 'Just now';
  }

  if (diffSecs < 60) {
    return isVi ? 'Vừa xong' : 'Just now';
  }
  if (diffMins < 60) {
    return isVi ? `${diffMins} phút trước` : `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return isVi ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return isVi ? 'Hôm qua' : 'Yesterday';
  }
  if (diffDays < 7) {
    return isVi ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  }
  
  return date.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const formatExecutionTime = (
  startTimeString: string,
  endTimeString?: string,
  language: string = 'en'
): string => {
  const start = new Date(startTimeString);
  
  const formatDate = (date: Date) => {
    if (language === 'vi') {
      return `${date.getDate()} tháng ${date.getMonth() + 1}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  };

  const startFormatted = `${formatDate(start)} ${formatTime(start)}`;

  if (!endTimeString) {
    return startFormatted;
  }

  const end = new Date(endTimeString);
  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (isSameDay) {
    return `${startFormatted} - ${formatTime(end)}`;
  }

  return `${startFormatted} - ${formatDate(end)} ${formatTime(end)}`;
};
