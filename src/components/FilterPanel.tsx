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
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items by name, description, or assignee..."
            className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              start: e.target.value ? new Date(e.target.value) : null
            })}
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              end: e.target.value ? new Date(e.target.value) : null
            })}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300"></div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border border-gray-300 rounded-md bg-white">
          <button
            onClick={onZoomOut}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-l-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs text-gray-500 border-x border-gray-300 min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-r-md"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline Scale */}
        <select
          value={timelineScale}
          onChange={(e) => onScaleChange(e.target.value as 'days' | 'weeks' | 'months')}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
        </select>

        {/* Add Item Button */}
        <button
          onClick={onAddItem}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
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
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {type}
              <button
                onClick={() => handleArrayFilterChange('type', type)}
                className="ml-1 text-blue-600 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          ))}
          {filters.status.map(status => (
            <span
              key={status}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {status.replace('-', ' ')}
              <button
                onClick={() => handleArrayFilterChange('status', status)}
                className="ml-1 text-green-600 hover:text-green-700"
              >
                ×
              </button>
            </span>
          ))}
          {filters.priority.map(priority => (
            <span
              key={priority}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              {priority}
              <button
                onClick={() => handleArrayFilterChange('priority', priority)}
                className="ml-1 text-yellow-600 hover:text-yellow-700"
              >
                ×
              </button>
            </span>
          ))}
          {filters.assignee.map(assignee => (
            <span
              key={assignee}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              {assignee}
              <button
                onClick={() => handleArrayFilterChange('assignee', assignee)}
                className="ml-1 text-purple-600 hover:text-purple-700"
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