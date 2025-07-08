import React from 'react';
import { Search, Filter, Calendar, User, AlertCircle, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  assignees: string[];
  onAddItem: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  timelineScale: string;
  onScaleChange: (scale: 'days' | 'weeks' | 'months') => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange, 
  assignees,
  onAddItem,
  onZoomIn,
  onZoomOut,
  zoomLevel,
  timelineScale,
  onScaleChange
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayFilterChange = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: [],
      status: [],
      priority: [],
      assignee: [],
      approval: [],
      dateRange: {
        start: null,
        end: null
      }
    });
  };

  const hasActiveFilters = filters.search || 
    filters.type.length > 0 || 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.assignee.length > 0 || 
    filters.approval.length > 0 ||
    filters.dateRange.start || 
    filters.dateRange.end;

  return (
    <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200/50 p-3 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items by name, description, or assignee..."
            className="w-full pl-10 pr-4 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            value=""
            onChange={(e) => e.target.value && handleArrayFilterChange('type', e.target.value)}
          >
            <option value="">Type</option>
            <option value="phase">Phase</option>
            <option value="milestone">Milestone</option>
            <option value="task">Task</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
          value=""
          onChange={(e) => e.target.value && handleArrayFilterChange('status', e.target.value)}
        >
          <option value="">Status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Priority Filter */}
        <select
          className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
          value=""
          onChange={(e) => e.target.value && handleArrayFilterChange('priority', e.target.value)}
        >
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        {/* Assignee Filter */}
        <div className="flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-gray-500" />
          <select
            className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            value=""
            onChange={(e) => e.target.value && handleArrayFilterChange('assignee', e.target.value)}
          >
            <option value="">Assignee</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="date"
            className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              start: e.target.value ? new Date(e.target.value) : null
            })}
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              end: e.target.value ? new Date(e.target.value) : null
            })}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-300"></div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border border-slate-300 rounded-md bg-white/70 backdrop-blur-sm shadow-sm">
          <button
            onClick={onZoomOut}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-slate-100 rounded-l-md transition-all duration-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs text-gray-500 border-x border-slate-300 min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-slate-100 rounded-r-md transition-all duration-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline Scale */}
        <select
          value={timelineScale}
          onChange={(e) => onScaleChange(e.target.value as 'days' | 'weeks' | 'months')}
          className="px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
        >
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
        </select>

        {/* Add Item Button */}
        <button
          onClick={onAddItem}
          className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm shadow-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-all duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.type.map(type => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm"
            >
              {type}
              <button
                onClick={() => handleArrayFilterChange('type', type)}
                className="ml-1 text-blue-600 hover:text-blue-700 hover:bg-blue-300 rounded-full p-0.5 transition-all duration-200"
              >
                ×
              </button>
            </span>
          ))}
          {filters.status.map(status => (
            <span
              key={status}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm"
            >
              {status.replace('-', ' ')}
              <button
                onClick={() => handleArrayFilterChange('status', status)}
                className="ml-1 text-green-600 hover:text-green-700 hover:bg-green-300 rounded-full p-0.5 transition-all duration-200"
              >
                ×
              </button>
            </span>
          ))}
          {filters.priority.map(priority => (
            <span
              key={priority}
             className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm"
            >
              {priority}
              <button
                onClick={() => handleArrayFilterChange('priority', priority)}
               className="ml-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-300 rounded-full p-0.5 transition-all duration-200"
              >
                ×
              </button>
            </span>
          ))}
          {filters.assignee.map(assignee => (
            <span
              key={assignee}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-sm"
            >
              {assignee}
              <button
                onClick={() => handleArrayFilterChange('assignee', assignee)}
                className="ml-1 text-purple-600 hover:text-purple-700 hover:bg-purple-300 rounded-full p-0.5 transition-all duration-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};