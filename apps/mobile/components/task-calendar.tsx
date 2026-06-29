import { useMemo } from 'react'
import { View } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import {
  buildTaskMarkedDates,
  toCalendarMonthKey,
  type TaskCalendarInput,
} from '@yksi/core'

LocaleConfig.locales['fi'] = {
  monthNames: [
    'Tammikuu',
    'Helmikuu',
    'Maaliskuu',
    'Huhtikuu',
    'Toukokuu',
    'Kesäkuu',
    'Heinäkuu',
    'Elokuu',
    'Syyskuu',
    'Lokakuu',
    'Marraskuu',
    'Joulukuu',
  ],
  monthNamesShort: [
    'Tammi',
    'Helmi',
    'Maalis',
    'Huhti',
    'Touko',
    'Kesä',
    'Heinä',
    'Elo',
    'Syys',
    'Loka',
    'Marras',
    'Joulu',
  ],
  dayNames: [
    'Sunnuntai',
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai',
    'Lauantai',
  ],
  dayNamesShort: ['SU', 'MA', 'TI', 'KE', 'TO', 'PE', 'LA'],
  today: 'Tänään',
}
LocaleConfig.defaultLocale = 'fi'

const CALENDAR_THEME = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#464555',
  textSectionTitleDisabledColor: '#c7c4d8',
  selectedDayBackgroundColor: '#3525cd',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#3525cd',
  dayTextColor: '#0b1c30',
  textDisabledColor: '#46455566',
  textInactiveColor: '#46455566',
  dotColor: '#3525cd',
  selectedDotColor: '#ffffff',
  arrowColor: '#3525cd',
  monthTextColor: '#0b1c30',
  textDayFontWeight: '500' as const,
  textMonthFontWeight: '700' as const,
  textDayHeaderFontWeight: '600' as const,
  textDayFontSize: 15,
  textDayHeaderFontSize: 11,
  'stylesheet.calendar.header': {
    week: {
      marginTop: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  },
  'stylesheet.calendar.main': {
    container: {
      paddingLeft: 4,
      paddingRight: 4,
    },
    week: {
      marginTop: 4,
      marginBottom: 4,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  },
}

interface TaskCalendarProps {
  viewDate: Date
  selectedDate: Date
  tasks: TaskCalendarInput[]
  onDayPress: (date: Date) => void
  onMonthChange: (date: Date) => void
}

export function TaskCalendar({
  viewDate,
  selectedDate,
  tasks,
  onDayPress,
  onMonthChange,
}: TaskCalendarProps) {
  const markedDates = useMemo(
    () => buildTaskMarkedDates(tasks, selectedDate),
    [tasks, selectedDate],
  )

  const current = toCalendarMonthKey(viewDate)

  return (
    <View className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <Calendar
        key={current}
        current={current}
        firstDay={1}
        enableSwipeMonths
        hideArrows
        markingType="dot"
        markedDates={markedDates}
        onDayPress={(day) => onDayPress(new Date(day.year, day.month - 1, day.day))}
        onMonthChange={(month) => onMonthChange(new Date(month.year, month.month - 1, 1))}
        renderHeader={() => null}
        theme={CALENDAR_THEME}
        style={{ width: '100%' }}
      />
    </View>
  )
}