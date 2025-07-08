import React from 'react';
import { TimelineConfig } from '../types';
import { formatDateShort, getWeeksInRange, getMonthsInRange } from '../utils/dateUtils';

interface TimelineHeaderProps {
  config: TimelineConfig;
  width: number;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ config, width }) => {
  const { startDate, endDate, scale } = config;

  const renderDayHeaders = () => {
    const days = [];
    const currentDate = new Date(startDate);
    const dayWidth = width / ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    while (currentDate <= endDate) {
      days.push(
        <div
          key={currentDate.toISOString()}
          className="flex-shrink-0 border-r border-slate-200/50 px-2 py-1 text-xs text-gray-600 hover:bg-slate-100 transition-all duration-200"
          style={{ width: `${dayWidth}px` }}
        >
          {formatDateShort(currentDate)}
        </div>
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const renderWeekHeaders = () => {
    const weeks = getWeeksInRange(startDate, endDate);
    const weekWidth = width / weeks.length;

    return weeks.map((week, index) => (
      <div
        key={week.toISOString()}
        className="flex-shrink-0 border-r border-slate-200/50 px-2 py-1 text-xs text-gray-600 hover:bg-slate-100 transition-all duration-200"
        style={{ width: `${weekWidth}px` }}
      >
        Week {index + 1}
      </div>
    ));
  };

  const renderMonthHeaders = () => {
    const months = getMonthsInRange(startDate, endDate);
    const monthWidth = width / months.length;

    return months.map(month => (
      <div
        key={month.toISOString()}
        className="flex-shrink-0 border-r border-slate-200/50 px-2 py-1 text-xs text-gray-600 hover:bg-slate-100 transition-all duration-200"
        style={{ width: `${monthWidth}px` }}
      >
        {month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </div>
    ));
  };

  return (
    <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200/50 sticky top-0 z-10 shadow-sm">
      <div className="flex" style={{ width: `${width}px` }}>
        {scale === 'days' && renderDayHeaders()}
        {scale === 'weeks' && renderWeekHeaders()}
        {scale === 'months' && renderMonthHeaders()}
      </div>
    </div>
  );
};