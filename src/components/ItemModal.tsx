import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, AlertTriangle, CheckCircle, Link, GitBranch } from 'lucide-react';
import { ProjectItem } from '../types';
import { generateItemColor } from '../utils/colors';

interface ItemModalProps {
  item?: ProjectItem;
  parentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ProjectItem>) => void;
  assignees: string[];
  availableItems: ProjectItem[];
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  parentId,
  isOpen,
  onClose,
  onSave,
  assignees,
  availableItems
}) => {
  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    name: '',
    type: 'task',
    status: 'not-started',
    progress: 0,
    startDate: new Date(),
    endDate: new Date(),
    description: '',
    assignee: '',
    priority: 'medium',
    blockers: [],
    approval: 'not-required',
    dependencies: [],
    parentId: parentId,
    color: generateItemColor('task')
  });

  const [newBlocker, setNewBlocker] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setSelectedDependencies(item.dependencies || []);
    } else {
      setFormData({
        name: '',
        type: 'task',
        status: 'not-started',
        progress: 0,
        startDate: new Date(),
        endDate: new Date(),
        description: '',
        assignee: '',
        priority: 'medium',
        blockers: [],
        approval: 'not-required',
        dependencies: [],
        parentId: parentId,
        color: generateItemColor('task')
      });
      setSelectedDependencies([]);
    }
  }, [item, parentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dependencies: selectedDependencies
    });
    onClose();
  };

  const handleInputChange = (field: keyof ProjectItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addBlocker = () => {
    if (newBlocker.trim()) {
      setFormData(prev => ({
        ...prev,
        blockers: [...(prev.blockers || []), newBlocker.trim()]
      }));
      setNewBlocker('');
    }
  };

  const removeBlocker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blockers: prev.blockers?.filter((_, i) => i !== index) || []
    }));
  };

  const handleDependencyChange = (dependencyId: string) => {
    setSelectedDependencies(prev => 
      prev.includes(dependencyId)
        ? prev.filter(id => id !== dependencyId)
        : [...prev, dependencyId]
    );
  };

  // Filter available items for parent selection (only open phases and milestones)
  const availableParents = availableItems.filter(availableItem => 
    availableItem.id !== item?.id && 
    !availableItem.parentId &&
    (availableItem.type === 'phase' || availableItem.type === 'milestone') &&
    availableItem.status !== 'completed' &&
    availableItem.status !== 'cancelled'
  );

  // Filter available items for dependencies (only open phases and milestones)
  const availableDependencies = availableItems.filter(availableItem => 
    availableItem.id !== item?.id &&
    (availableItem.type === 'phase' || availableItem.type === 'milestone') &&
    availableItem.status !== 'completed' &&
    availableItem.status !== 'cancelled'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-100 to-slate-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-200/50 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              >
                <option value="task">Task</option>
                <option value="milestone">Milestone</option>
                <option value="phase">Phase</option>
              </select>
            </div>
          </div>

          {/* Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleInputChange('progress', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate?.toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate?.toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Assignee and Approval */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Assignee
              </label>
              <select
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Select assignee</option>
                {assignees.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CheckCircle className="inline w-4 h-4 mr-1" />
                Approval Status
              </label>
              <select
                value={formData.approval}
                onChange={(e) => handleInputChange('approval', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              >
                <option value="not-required">Not Required</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Parent Item Selection */}
          {!parentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="inline w-4 h-4 mr-1" />
                Link to Parent Item
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => handleInputChange('parentId', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">No parent (top-level item)</option>
                {availableParents.map(availableItem => (
                  <option key={availableItem.id} value={availableItem.id}>
                    {availableItem.name} ({availableItem.type}) - {availableItem.status}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Link to open phases or milestones only. Completed and cancelled items are not shown.
              </p>
            </div>
          )}

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GitBranch className="inline w-4 h-4 mr-1" />
              Dependencies
            </label>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Select phases or milestones that must be completed before this item can start:
              </p>
              <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-lg bg-white/70 backdrop-blur-sm">
                {availableDependencies.length > 0 ? (
                  availableDependencies.map(availableItem => (
                    <label key={availableItem.id} className="flex items-center p-2 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDependencies.includes(availableItem.id)}
                        onChange={() => handleDependencyChange(availableItem.id)}
                        className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {availableItem.name} ({availableItem.type}) - {availableItem.status}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="p-2 text-sm text-gray-500">No open phases or milestones available</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              placeholder="Enter item description"
            />
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              Blockers
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newBlocker}
                onChange={(e) => setNewBlocker(e.target.value)}
                placeholder="Add a blocker"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBlocker())}
              />
              <button
                type="button"
                onClick={addBlocker}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
              >
                Add
              </button>
            </div>
            {formData.blockers && formData.blockers.length > 0 && (
              <div className="space-y-2">
                {formData.blockers.map((blocker, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                    <span className="text-sm text-red-800">{blocker}</span>
                    <button
                      type="button"
                      onClick={() => removeBlocker(index)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-200 rounded p-1 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-16 h-10 border border-slate-300 rounded-lg bg-white/70 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};