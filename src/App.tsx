import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, BarChart3, Filter, Settings } from 'lucide-react';
import { ProjectItem, FilterOptions } from './types';
import { FilterPanel } from './components/FilterPanel';
import { GanttChart } from './components/GanttChart';
import { ItemModal } from './components/ItemModal';
import { SettingsModal } from './components/SettingsModal';
import { supabase, testConnection } from './lib/supabase';

interface ProjectSettings {
  projectName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  defaultAssignees: string[];
  theme: string;
}

function App() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    projectName: 'Project Management Tool with Gantt Chart',
    description: 'A comprehensive project management solution with Gantt chart visualization',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    defaultAssignees: ['Sarah Johnson', 'Mike Chen', 'Alex Rodriguez', 'Jordan Smith', 'Taylor Wilson'],
    theme: 'default'
  });
  const [filters, setFilters] = useState<FilterOptions>({
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | undefined>();
  const [addingToParent, setAddingToParent] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch project items from Supabase
  const fetchProjectItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('project_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Convert date strings back to Date objects
      const itemsWithDates = data.map(item => ({
        ...item,
        startDate: new Date(item.start_date),
        endDate: new Date(item.end_date),
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        // Map database fields to component fields
        parentId: item.parent_id
      }));

      setItems(itemsWithDates);
      
      // Update project settings based on actual data
      if (itemsWithDates.length > 0) {
        const startDates = itemsWithDates.map(item => item.startDate.getTime());
        const endDates = itemsWithDates.map(item => item.endDate.getTime());
        
        setProjectSettings(prev => ({
          ...prev,
          startDate: new Date(Math.min(...startDates)),
          endDate: new Date(Math.max(...endDates))
        }));
      }
    } catch (error) {
      console.error('Error fetching project items:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch project items');
    } finally {
      setLoading(false);
    }
  };

  // Test connection and fetch data on component mount
  useEffect(() => {
    const initializeApp = async () => {
      const isConnected = await testConnection();
      if (isConnected) {
        await fetchProjectItems();
      } else {
        setError('Failed to connect to database');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower) &&
            !item.description?.toLowerCase().includes(searchLower) &&
            !item.assignee?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(item.type)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(item.priority)) {
        return false;
      }

      // Assignee filter
      if (filters.assignee.length > 0 && item.assignee && !filters.assignee.includes(item.assignee)) {
        return false;
      }

      // Approval filter
      if (filters.approval.length > 0 && !filters.approval.includes(item.approval)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && item.endDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && item.startDate > filters.dateRange.end) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    const itemAssignees = [...new Set(items.map(item => item.assignee).filter(Boolean))];
    const allAssignees = [...new Set([...projectSettings.defaultAssignees, ...itemAssignees])];
    return allAssignees.sort();
  }, [items]);

  const handleItemSave = async (itemData: Partial<ProjectItem>) => {
    try {
      setError(null);
      
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('project_items')
          .update({
            name: itemData.name,
            type: itemData.type,
            status: itemData.status,
            progress: itemData.progress,
            start_date: itemData.startDate?.toISOString(),
            end_date: itemData.endDate?.toISOString(),
            description: itemData.description,
            assignee: itemData.assignee,
            priority: itemData.priority,
            blockers: itemData.blockers,
            approval: itemData.approval,
            dependencies: itemData.dependencies,
            parent_id: itemData.parentId,
            color: itemData.color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const newItemData = {
          name: itemData.name || 'New Item',
          type: itemData.type || 'task',
          status: itemData.status || 'not-started',
          progress: itemData.progress || 0,
          start_date: (itemData.startDate || new Date()).toISOString(),
          end_date: (itemData.endDate || new Date()).toISOString(),
          description: itemData.description || '',
          assignee: itemData.assignee || '',
          priority: itemData.priority || 'medium',
          blockers: itemData.blockers || [],
          approval: itemData.approval || 'not-required',
          dependencies: itemData.dependencies || [],
          parent_id: itemData.parentId,
          color: itemData.color || '#3B82F6',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('project_items')
          .insert([newItemData]);

        if (error) throw error;
      }

      // Refresh data
      await fetchProjectItems();
    } catch (error) {
      console.error('Error saving item:', error);
      setError(error instanceof Error ? error.message : 'Failed to save item');
    }
    
    setEditingItem(undefined);
    setAddingToParent(undefined);
  };

  const handleItemDelete = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('project_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data
      await fetchProjectItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  const handleItemEdit = (item: ProjectItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleItemAdd = (parentId?: string) => {
    setAddingToParent(parentId);
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    try {
      setError(null);
      
      const normalizedProgress = Math.max(0, Math.min(100, progress));
      const newStatus = normalizedProgress === 100 ? 'completed' : 
                       normalizedProgress > 0 ? 'in-progress' : 'not-started';
      
      const { error } = await supabase
        .from('project_items')
        .update({
          progress: normalizedProgress,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data
      await fetchProjectItems();
    } catch (error) {
      console.error('Error updating progress:', error);
      setError(error instanceof Error ? error.message : 'Failed to update progress');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(undefined);
    setAddingToParent(undefined);
  };

  const handleSettingsSave = (settings: ProjectSettings) => {
    setProjectSettings(settings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{projectSettings.projectName}</h1>
                <p className="text-sm text-gray-500">{projectSettings.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{filteredItems.length} items</span>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Project Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <main className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project data...</p>
            </div>
          </div>
        ) : (
          <GanttChart
            items={filteredItems}
            onItemEdit={handleItemEdit}
            onItemDelete={handleItemDelete}
            onItemAdd={handleItemAdd}
            onProgressUpdate={handleProgressUpdate}
            filters={filters}
            onFiltersChange={setFilters}
            assignees={assignees}
          />
        )}
      </main>

      {/* Item Modal */}
      <ItemModal
        item={editingItem}
        parentId={addingToParent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleItemSave}
        assignees={assignees}
        availableItems={items}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
        currentSettings={projectSettings}
      />
    </div>
  );
}

export default App;