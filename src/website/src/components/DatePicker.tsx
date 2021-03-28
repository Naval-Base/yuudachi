import ReactDatePicker from 'react-datepicker';

const DatePicker = ({
	selectedDate,
	onChange,
	filterDate,
	filterTime,
	showPopperArrow = true,
	isReadOnly = false,
	isDisabled = false,
}: {
	onChange: (...args: any) => any;
	filterDate: (...args: any) => any;
	filterTime: (...args: any) => any;
	selectedDate: Date | undefined;
	showPopperArrow?: boolean;
	isReadOnly?: boolean;
	isDisabled?: boolean;
}) => {
	return (
		<ReactDatePicker
			selected={selectedDate}
			onChange={onChange}
			filterDate={filterDate}
			// @ts-ignore
			filterTime={filterTime}
			showTimeSelect
			showPopperArrow={showPopperArrow}
			timeFormat="HH:mm"
			timeIntervals={5}
			dateFormat="yyyy/MM/dd HH:mm"
			readOnly={isReadOnly}
			disabled={isDisabled}
		/>
	);
};

export default DatePicker;
