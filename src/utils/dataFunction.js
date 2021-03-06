const getMonthsByquater = (quater) => {
  switch (quater) {
    case 1:
      return [0, 1, 2];
    case 2:
      return [3, 4, 5];
    case 3:
      return [6, 7, 8];
    case 4:
      return [9, 10, 11];
    default:
      break;
  }
};
const getDaysByMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};
const getQuaterByMonth = (month) => {
  if (month < 4) return 1;
  if (month < 7) return 2;
  if (month < 10) return 3;
  return 4;
};
const getWeekByDate = (currentdate) => {
  var oneJan = new Date(currentdate.getFullYear(), 0, 1);
  var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
};

const getDateInWeek = (today) => {
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const first = new Date(today.setDate(diff));
  const last = new Date(today.setDate(diff + 6));
  return [first, last];
};
export const dateFunction = {
  getMonthsByquater,
  getDaysByMonth,
  getQuaterByMonth,
  getDateInWeek,
};
