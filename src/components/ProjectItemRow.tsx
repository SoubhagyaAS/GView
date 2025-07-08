import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Pause, 
  XCircle,
  Flag,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Link
} from 'lucide-react';
import { ProjectItem, TimelineConfig } from '../types';
import { formatDate, getDaysBetween } from '../utils/dateUtils';
import { statusColors, priorityColors, typeColors, approvalColors } from '../utils/colors';

interface ProjectItemRowProps {
  item: ProjectItem;
  config: TimelineConfig;
  timelineWidth: number;
  children?: ProjectItem[];
  level?: number;
  onEdit: (item: ProjectItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onProgressUpdate: (id: string, progress: number) => void;
}

export const ProjectItemRow: React.FC<ProjectItemRowProps> = ({
  item,
  config,
  timelineWidth,
  children = [],
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
  onProgressUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProgress, setEditProgress] = useState(item.progress);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'on-hold':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    const color = priorityColors[priority as keyof typeof priorityColors];
    return <Flag className="w-4 h-4" style={{ color }} />;
  };

  const calculateBarPosition = () => {
    const totalDays = getDaysBetween(config.startDate, config.endDate);
    const itemStartOffset = getDaysBetween(config.startDate, item.startDate);
    const itemDuration = getDaysBetween(item.startDate, item.endDate);
    
    const left = Math.max(0, (itemStartOffset / totalDays) * timelineWidth);
    const width = Math.max(20, (itemDuration / totalDays) * timelineWidth);
    
    return { left, width };
  };

  const { left, width } = calculateBarPosition();

  const handleProgressSave = () => {
    onProgressUpdate(item.id, editProgress);
    setIsEditing(false);
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'milestone':
        return { icon: '◆', label: 'Milestone', color: 'text-yellow-600 bg-yellow-50' };
      case 'phase':
        return { icon: '■', label: 'Phase', color: 'text-purple-600 bg-purple-50' };
      default:
        return { icon: '●', label: 'Task', color: 'text-blue-600 bg-blue-50' };
    }
  };

  const typeDisplay = getTypeDisplay(item.type);

  return (
    <>
      <div className="flex border-b border-gray-100 hover:bg-gray-50 group">
        {/* Item Name Column */}
        <div className="w-32 flex-shrink-0 p-2 border-r border-gray-200 bg-gray-50 flex items-center" style={{ paddingLeft: `${level * 12 + 8}px` }}>
          <div className="flex items-center space-x-1 w-full">
            {/* Expand/Collapse */}
            {children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
              >
                {isExpanded ? 
                  <ChevronDown className="w-3 h-3" /> : 
                  <ChevronRight className="w-3 h-3" />
                }
              </button>
            )}
            
            {/* Hierarchy connector for children */}
            {level > 0 && (
              <div className="flex items-center text-gray-400 flex-shrink-0">
                <Link className="w-2.5 h-2.5" />
              </div>
            )}
            
            <span className={`text-xs ${typeDisplay.color.split(' ')[0]} flex-shrink-0`}>
              {typeDisplay.icon}
            </span>
            <span className="text-xs font-medium text-gray-900 truncate" title={item.name}>
              {item.name}
            </span>
          </div>
        </div>

        {/* Item Details Column */}
        <div className="flex-1 min-w-0 p-2 flex items-center space-x-2">

          {/* Status & Priority */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="scale-75">
              {getStatusIcon(item.status)}
            </div>
            <div className="scale-75">
              {getPriorityIcon(item.priority)}
            </div>
          </div>

          {/* Assignee */}
          {item.assignee && (
            <div className="flex items-center space-x-1 text-xs text-gray-600 flex-shrink-0">
              <User className="w-2.5 h-2.5" />
              <span className="truncate max-w-16">{item.assignee}</span>
            </div>
          )}

          {/* Blockers */}
          {item.blockers.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-red-600 flex-shrink-0">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>{item.blockers.length}</span>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-12 px-1 py-0.5 text-xs border rounded"
                />
                <button
                  onClick={handleProgressSave}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <div className="w-10 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-7 text-right">{item.progress}%</span>
              </div>
            )}
          </div>

          {/* Approval Status */}
          {item.approval !== 'not-required' && (
            <div className="flex items-center flex-shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${
                item.approval === 'approved' ? 'bg-green-500' :
                item.approval === 'rejected' ? 'bg-red-500' :
                'bg-yellow-500'
              }`} />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center opacity-0 group-hover:opacity-100 flex-shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
              title="Edit item"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onAddChild(item.id)}
              className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Add child item"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete item"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Timeline Bar Column */}
        <div className="relative flex-shrink-0 border-l border-gray-200" style={{ width: `${timelineWidth}px` }}>
          {/* Timeline Bar */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 rounded-lg shadow-sm cursor-pointer group/bar transition-all duration-200 hover:shadow-md"
            style={{
              left: `${left}px`,
              width: `${width}px`,
              height: item.type === 'milestone' ? '12px' : '18px',
              backgroundColor: item.color,
              opacity: 0.9
            }}
            onClick={() => onEdit(item)}
          >
            {/* Progress overlay */}
            {item.type !== 'milestone' && (
              <div
                className="absolute top-0 left-0 h-full bg-white bg-opacity-40 rounded-lg transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            )}
            
            {/* Milestone diamond shape */}
            {item.type === 'milestone' && (
              <div className="absolute inset-0 transform rotate-45 rounded-sm" style={{ backgroundColor: item.color }} />
            )}

            {/* Hover tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-30 pointer-events-none">
              <div className="font-medium">{item.name}</div>
              <div className="text-gray-300 text-xs">
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </div>
              <div className="text-gray-300 text-xs">Progress: {item.progress}%</div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900" />
            </div>
          </div>

          {/* Dependency lines */}
          {item.dependencies.length > 0 && (
            <div className="absolute top-1/2 left-0 w-2 h-px bg-gray-400 transform -translate-y-1/2" />
          )}

          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {Array.from({ length: Math.ceil(timelineWidth / 50) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-200"
                style={{ left: `${i * 50}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && children.map(child => (
        <ProjectItemRow
          key={child.id}
          item={child}
          config={config}
          timelineWidth={timelineWidth}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onProgressUpdate={onProgressUpdate}
        />
      ))}
    </>
  );
};