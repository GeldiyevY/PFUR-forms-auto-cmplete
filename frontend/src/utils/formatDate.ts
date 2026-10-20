export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const s = dateString.replace(/_/g, '').trim();
  if (s) {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const year = parseInt(m[3], 10);
      if (month >= 0 && month < 12 && year > 0) {
        const date = new Date(year, month, day);
        const months = [
          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}г.`;
      }
    }
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}г.`;
}
