// src/utils/reservationConstants.jsx

export const timeOptions = [
  '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
].map((time) => ({ value: time, label: time }));

export const peopleOptions = [
  '1 Person', '2 People', '3 People', '4 People',
  '5 People', '6 People', '7 People', '8 People',
  '9 People', '10 People', '11 People', '12 People'
].map((people) => ({ value: people, label: people }));

export const selectCustomStyles = {
  control: (provided) => ({
    ...provided,
    height: '100%',
    minHeight: '46px',
    border: 'none',
    boxShadow: 'none',
    borderRadius: '10px',
    backgroundColor: '#fff',
    fontSize: '14px',
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
    paddingLeft: '6px',
    outline: 'none',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#ec1d25' : '#666666',
    paddingRight: '15px',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#ec1d25',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#666666',
    fontSize: '14px',
    fontFamily: 'Montserrat, sans-serif',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    zIndex: 999,
    overflow: 'hidden',
    border: '1px solid #eeeeee',
    marginTop: '6px',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '6px',
    maxHeight: '220px',
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#ec1d25'
      : state.isFocused
      ? '#fff1f0'
      : 'transparent',
    color: state.isSelected
      ? '#ffffff'
      : state.isFocused
      ? '#ec1d25'
      : '#666666',
    fontWeight: state.isSelected ? '600' : '400',
    padding: '8px 12px',
    transition: 'all 0.15s ease',
    '&:active': {
      backgroundColor: '#ec1d25',
      color: '#ffffff',
    },
  }),
};

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear - 1 + i);

export const renderCustomDatePickerHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => (
  <div className="custom-datepicker-header d-flex justify-content-between align-items-center px-2 py-1">
    <button
      type="button"
      onClick={decreaseMonth}
      disabled={prevMonthButtonDisabled}
      className="btn-datepicker-nav"
      aria-label="Previous Month"
    >
      <i className="fa fa-chevron-left" />
    </button>

    <div className="d-flex align-items-center">
      <select
        value={months[date.getMonth()]}
        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
        className="custom-datepicker-select mr-2"
      >
        {months.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={date.getFullYear()}
        onChange={({ target: { value } }) => changeYear(Number(value))}
        className="custom-datepicker-select"
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>

    <button
      type="button"
      onClick={increaseMonth}
      disabled={nextMonthButtonDisabled}
      className="btn-datepicker-nav"
      aria-label="Next Month"
    >
      <i className="fa fa-chevron-right" />
    </button>
  </div>
);

