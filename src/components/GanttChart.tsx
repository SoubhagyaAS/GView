import React, { useState, useRef } from 'react';
import { FilterPanel } from './FilterPanel';
import { ProjectItem, TimelineConfig } from '../types';
import { FilterOptions } from '../types';
import { TimelineHeader } from './TimelineHeader';
import { ProjectItemRow } from './ProjectItemRow';
import { getDaysBetween } from '../utils/dateUtils';

interface GanttChartProps {
  items: ProjectItem[];
  onItemEdit: (item: ProjectItem) => void;
  onItemDelete: (id: string) => void;
  onItemAdd: (parentId?: string) => void;
  onProgressUpdate: (id: string, progress: number) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  assignees: string[];
}

export const GanttChart: React.FC<GanttChartProps> = ({
  items,
  onItemEdit,
  onItemDelete,
  onItemAdd,
  onProgressUpdate,
  filters,
  onFiltersChange,
  assignees
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [timelineConfig, setTimelineConfig] = useState<TimelineConfig>({
    startDate: new Date(Math.min(...items.map(item => item.startDate.getTime()))),
    endDate: new Date(Math.max(...items.map(item => item.endDate.getTime()))),
    scale: 'days',
    zoom: 1
  });

  const timelineWidth = Math.max(800, getDaysBetween(timelineConfig.startDate, timelineConfig.endDate) * 30 * timelineConfig.zoom);

  const handleZoomIn = () => {
    setTimelineConfig(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }));
  };

  const handleZoomOut = () => {
    setTimelineConfig(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.5) }));
  };

  const handleScaleChange = (scale: 'days' | 'weeks' | 'months') => {
    setTimelineConfig(prev => ({ ...prev, scale }));
  };

  // Group items by parent-child relationships
  const groupedItems = items.reduce((acc, item) => {
    if (!item.parentId) {
      acc[item.id] = {
        parent: item,
        children: items.filter(child => child.parentId === item.id)
      };
    }
    return acc;
  }, {} as Record<string, { parent: ProjectItem; children: ProjectItem[] }>);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        assignees={assignees}
        onAddItem={() => onItemAdd()}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        zoomLevel={timelineConfig.zoom}
        timelineScale={timelineConfig.scale}
        onScaleChange={handleScaleChange}
      />

      {/* Chart Container */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div className="min-w-full">
          {/* Timeline Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="flex">
              <div className="w-32 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                <div className="p-2 font-medium text-gray-900 text-xs">
                  Item Name
                </div>
              </div>
              <div className="flex-1 min-w-0 border-r border-gray-200">
                <div className="p-2 bg-gray-50 font-medium text-gray-900 text-xs">
                  Details
                </div>
              </div>
              <div className="flex-shrink-0">
                <TimelineHeader config={timelineConfig} width={timelineWidth} />
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div className="relative">
            {Object.values(groupedItems).map(({ parent, children }) => (
              <ProjectItemRow
                key={parent.id}
                item={parent}
                config={timelineConfig}
                timelineWidth={timelineWidth}
                children={children}
                level={0}
                onEdit={onItemEdit}
                onDelete={onItemDelete}
                onAddChild={onItemAdd}
                onProgressUpdate={onProgressUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};