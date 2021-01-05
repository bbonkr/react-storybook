import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import updateLocale from 'dayjs/plugin/updateLocale'
import localeDate from 'dayjs/plugin/localeData'
import isBetween from 'dayjs/plugin/isBetween'
import { DateType } from './DateType'
import { Box } from './Box';
import { DayItem } from './DayItem';
import './style.css';

dayjs.extend(weekOfYear);
dayjs.extend(updateLocale);
dayjs.extend(localeDate);
dayjs.extend(isBetween);

export interface CalendarProps {
    /**
     * 달력 기준일자; 입력된 값이 없으면 오늘을 기준으로 달력을 렌더링합니다.
     */
    selection?: DateType;
    /**
     * 선택된 날짜
     */
    selections?: DateType[];
    /**
     * 연단위 이동 사용
     */
    useMoveToYear?: boolean;
    /**
     * 월 단위 이동 사용
     */
    useMoveToMonth?: boolean;

    /** 선택 가능 날짜 제한 (최소값) */
    minDate?: DateType;
    /** 선택 가능 날짜 제한 (최대값) */
    maxDate?: DateType;

    /** 날짜 출력 */
    showDate?: boolean;
    /** 오늘 하이라이트 여부 */
    highlightToday?: boolean;
    /**
     * 선택 변경 처리기
     * - 처리기가 설정되지 않으면 사용자가 선택을 변경할 수 없습니다.
     *
     * @memberof CalendarProp
     */
    onChange?: (start: DateType | undefined, end: DateType | undefined) => void;
}

/**
 * 달력으로 기간을 선택합니다.
 *
 *
 * @param param0
 */
export const Calendar = ({
    selection,
    selections,
    useMoveToYear,
    useMoveToMonth,
    minDate,
    maxDate,
    showDate,
    highlightToday,
    onChange,
}: CalendarProps) => {
    const [date, setDate] = useState<string>(
        selection || dayjs().format('YYYY-MM-DD HH:mm:ss'),
    );
    const [selectedDates, setSelectedDates] = useState<string[]>(
        selections || [],
    );
    const [records, setRecords] = useState<DayItem[][]>([]);
    const today = dayjs();

    const updateRecords = (basisDate: DateType, sDates: DateType[]) => {
        setRecords((prevState) => {
            const basis = dayjs(basisDate);
            const startWeek = basis.clone().startOf('month').week();
            const newRecords: DayItem[][] = [];
            for (let week = startWeek; true; week++) {
                const items: DayItem[] = Array(7)
                    .fill(0)
                    .map<DayItem>((i, index) => {
                        const current = dayjs(basisDate)
                            .clone()                  
                            .week(week)
                            .startOf('week')
                            .add(i + index, 'day');

                        const item: DayItem = {
                            date: current.format('YYYY-MM-DD'),
                            text: current.date().toString(),
                            isHoliday: 0 === current.day(),
                            isPreviousMonth:
                                current.month() !== basis.month() &&
                                week === startWeek,
                            isNextMonth:
                                current.month() !== basis.month() &&
                                week !== startWeek,
                            isToday:
                                current.format('YYYY-MM-DD') ===
                                dayjs().format('YYYY-MM-DD'),
                            isSelected:
                                sDates &&
                                sDates.length > 0 &&
                                current.isBetween(
                                    dayjs(sDates[0]),
                                    dayjs(
                                        sDates.length === 1
                                            ? sDates[0]
                                            : sDates[1],
                                    ),
                                    'day',
                                    '[]',
                                ),
                            isSelectedStart:
                                sDates &&
                                sDates.length > 0 &&
                                current.format('YYYY-MM-DD') ===
                                    dayjs(sDates[0]).format('YYYY-MM-DD'),
                            isSelectedEnd:
                                sDates &&
                                sDates.length > 0 &&
                                current.format('YYYY-MM-DD') ===
                                    dayjs(
                                        sDates.length === 1
                                            ? sDates[0]
                                            : sDates[1],
                                    ).format('YYYY-MM-DD'),
                            canSelect:
                                (!minDate ||
                                    (!!minDate &&
                                        dayjs(minDate).format('YYYY-MM-DD') <=
                                            current.format('YYYY-MM-DD'))) &&
                                (!maxDate ||
                                    (!!maxDate &&
                                        dayjs(maxDate).format('YYYY-MM-DD') >=
                                            current.format('YYYY-MM-DD'))),
                        };

                        return item;
                    });

                newRecords.push(items);
                if (basis.month() !== dayjs(items[6].date).month()) {
                    break;
                }
            }

            return [...newRecords];
        });
    };

    const getButtonTitle = (
        date: DateType,
        value: number,
        interval: 'year' | 'month',
    ): string => {
        const d = dayjs(date).add(value, interval);

        return `Move to ${d.format('YYYY-MM')}`;
    };

    const handleClickPrevYear = () => {
        setDate((prevState) =>
            dayjs(prevState)
                .add(-1, 'year')
                // .toDate()
                .format('YYYY-MM-DD'),
        );
    };

    const handleClickPrevMonth = () => {
        setDate((prevState) =>
            dayjs(prevState)
                .add(-1, 'month')
                // .toDate()
                .format('YYYY-MM-DD'),
        );
    };
    const handleClickNextMonth = () => {
        setDate((prevState) =>
            dayjs(prevState)
                .add(1, 'month')
                // .toDate()
                .format('YYYY-MM-DD'),
        );
    };
    const handleClickNextYear = () => {
        setDate((prevState) =>
            dayjs(prevState)
                .add(1, 'year')
                // .toDate()
                .format('YYYY-MM-DD'),
        );
    };

    const handleClickToday = () => {
        setDate(
            today
                // .toDate()
                .format('YYYY-MM-DD'),
        );
    };

    const handleClickBox = (date: DateType) => {
        setSelectedDates((prevState) => {
            if (prevState.length === 1) {
                // prevState.push(date);
                // return [...prevState.sort((a, b) => (a > b ? 1 : -1))];
                return [...prevState, date].sort((a, b) => (a > b ? 1 : -1));
            } else {
                return [date];
            }
        });
    };

    // useEffect(() => {
    //     console.info('selectedDates', selectedDates);
    // }, [selectedDates]);

    useEffect(() => {
        updateRecords(date, selectedDates);
    }, [date, selections, selectedDates, selection, minDate, maxDate]);

    useEffect(() => {
        if (onChange) {
            let start: DateType | undefined;
            let end: DateType | undefined;

            if (selectedDates.length === 0) {
                start = undefined;
                end = undefined;
            } else if (selectedDates.length === 1) {
                start = selectedDates[0];
                // end = selectedDates[0];
            } else {
                start = selectedDates[0];
                end = selectedDates[1];
            }
            // console.info('onChange', start, end);
            onChange(start, end);
        }
    }, [onChange, selectedDates]);

    return (
        <div className="calendar-container">
            <div className="calendar-title">
                {useMoveToYear && (
                    <button
                        className="calendar-button"
                        onClick={handleClickPrevYear}
                        title={getButtonTitle(date, -1, 'year')}
                    >
                        {/* <i className="fa fa-angle-left" aria-hidden="true"></i> */}
                        {/* <i className="fa fa-angle-left" aria-hidden="true"></i> */}
                        {`◀◀`}
                    </button>
                )}
                {useMoveToMonth && (
                    <button
                        className="calendar-button"
                        onClick={handleClickPrevMonth}
                        title={getButtonTitle(date, -1, 'month')}
                    >
                        {/* <i className="fa fa-angle-left" aria-hidden="true"></i> */}
                        {`◀`}
                    </button>
                )}
                <div>{dayjs(date).format('YYYY년 M월')}</div>
                {useMoveToMonth && (
                    <button
                        className="calendar-button"
                        onClick={handleClickNextMonth}
                        title={getButtonTitle(date, 1, 'month')}
                    >
                        {/* <i className="fa fa-angle-right" aria-hidden="true"></i> */}
                        {`▶`}
                    </button>
                )}
                {useMoveToYear && (
                    <button
                        className="calendar-button"
                        onClick={handleClickNextYear}
                        title={getButtonTitle(date, 1, 'year')}
                    >
                        {/* <i className="fa fa-angle-right" aria-hidden="true"></i>
                        <i className="fa fa-angle-right" aria-hidden="true"></i> */}
                        {`▶▶`}
                    </button>
                )}
            </div>
            <div className="calendar-week-container">
                {dayjs.weekdaysMin(true).map((item, index) => {
                    const weekdayNames = [
                        '일',
                        '월',
                        '화',
                        '수',
                        '목',
                        '금',
                        '토',
                    ];
                    const text = weekdayNames[index];
                    return (
                        <Box
                            key={item}
                            text={item}
                            canSelect={true}
                            isHoliday={index === 0}
                        />
                    );
                })}
            </div>
            {records.map((a, index) => (
                <div
                    key={(+new Date() + index).toString()}
                    className="calendar-week-container"
                >
                    {a.map((b) => (
                        <Box
                            key={`${b.date}`}
                            {...b}
                            highlightToday={highlightToday}
                            onClick={handleClickBox}
                        />
                    ))}
                </div>
            ))}
            {showDate && (
                <div className="calendar-bottom-container">
                    <button onClick={handleClickToday}>
                        Today: {today.format('YYYY-MM-DD')}
                    </button>
                </div>
            )}
        </div>
    );
};
