const formatDate = (date: Date) => date.toISOString().slice(0, 10);

type DateRange = {
  startDate: string;
  endDate: string;
};

const getDateRange = (type: '1m' | '3m'): DateRange => {
  const now = new Date();
  const start = new Date();

  if (type === '1m') {
    start.setMonth(now.getMonth() - 1);
  } else {
    start.setMonth(now.getMonth() - 3);
  }

  return {
    startDate: formatDate(start),
    endDate: formatDate(now),
  };
};

export { formatDate, getDateRange };
