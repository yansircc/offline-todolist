import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  subTasks: SubTask[];
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

interface TodoStore {
  stages: Stage[];
  isAdmin: boolean;
  markdownContent: string;
  
  // Actions
  setIsAdmin: (isAdmin: boolean) => void;
  setMarkdownContent: (content: string) => void;
  addStage: (stage: Stage) => void;
  updateStage: (stageId: string, updates: Partial<Omit<Stage, 'id' | 'tasks'>>) => void;
  deleteStage: (stageId: string) => void;
  
  addTask: (stageId: string, task: Task) => void;
  updateTask: (stageId: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'subTasks'>>) => void;
  deleteTask: (stageId: string, taskId: string) => void;
  toggleTaskCompletion: (stageId: string, taskId: string) => void;
  
  addSubTask: (stageId: string, taskId: string, subTask: SubTask) => void;
  updateSubTask: (stageId: string, taskId: string, subTaskId: string, updates: Partial<Omit<SubTask, 'id'>>) => void;
  deleteSubTask: (stageId: string, taskId: string, subTaskId: string) => void;
  toggleSubTaskCompletion: (stageId: string, taskId: string, subTaskId: string) => void;
  
  // Parse markdown to update stages, tasks, and subtasks
  parseMarkdownContent: () => void;
}

// Helper function to generate UUID
const generateId = () => {
  if (typeof window !== 'undefined') {
    return crypto.randomUUID();
  }
  // Fallback for server-side
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      stages: [],
      isAdmin: false,
      markdownContent: '',
      
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      
      setMarkdownContent: (content) => set({ markdownContent: content }),
      
      addStage: (stage) => set((state) => ({
        stages: [...state.stages, stage]
      })),
      
      updateStage: (stageId, updates) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId ? { ...stage, ...updates } : stage
        )
      })),
      
      deleteStage: (stageId) => set((state) => ({
        stages: state.stages.filter((stage) => stage.id !== stageId)
      })),
      
      addTask: (stageId, task) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId 
            ? { ...stage, tasks: [...stage.tasks, task] } 
            : stage
        )
      })),
      
      updateTask: (stageId, taskId, updates) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId 
            ? { 
                ...stage, 
                tasks: stage.tasks.map((task) => 
                  task.id === taskId ? { ...task, ...updates } : task
                ) 
              } 
            : stage
        )
      })),
      
      deleteTask: (stageId, taskId) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId 
            ? { 
                ...stage, 
                tasks: stage.tasks.filter((task) => task.id !== taskId) 
              } 
            : stage
        )
      })),
      
      toggleTaskCompletion: (stageId, taskId) => set((state) => {
        const stages = state.stages.map((stage) => {
          if (stage.id !== stageId) return stage;
          
          const tasks = stage.tasks.map((task) => {
            if (task.id !== taskId) return task;
            
            const completed = !task.completed;
            
            // If task is marked as completed, mark all subtasks as completed
            // If task is marked as not completed, leave subtasks as they are
            const subTasks = completed 
              ? task.subTasks.map(subTask => ({ ...subTask, completed }))
              : task.subTasks;
              
            return { ...task, completed, subTasks };
          });
          
          return { ...stage, tasks };
        });
        
        return { stages };
      }),
      
      addSubTask: (stageId, taskId, subTask) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId 
            ? { 
                ...stage, 
                tasks: stage.tasks.map((task) => 
                  task.id === taskId 
                    ? { ...task, subTasks: [...task.subTasks, subTask] } 
                    : task
                ) 
              } 
            : stage
        )
      })),
      
      updateSubTask: (stageId, taskId, subTaskId, updates) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId 
            ? { 
                ...stage, 
                tasks: stage.tasks.map((task) => 
                  task.id === taskId 
                    ? { 
                        ...task, 
                        subTasks: task.subTasks.map((subTask) => 
                          subTask.id === subTaskId ? { ...subTask, ...updates } : subTask
                        ) 
                      } 
                    : task
                ) 
              } 
            : stage
        )
      })),
      
      deleteSubTask: (stageId, taskId, subTaskId) => set((state) => ({
        stages: state.stages.map((stage) => 
          stage.id === stageId 
            ? { 
                ...stage, 
                tasks: stage.tasks.map((task) => 
                  task.id === taskId 
                    ? { 
                        ...task, 
                        subTasks: task.subTasks.filter((subTask) => subTask.id !== subTaskId) 
                      } 
                    : task
                ) 
              } 
            : stage
        )
      })),
      
      toggleSubTaskCompletion: (stageId, taskId, subTaskId) => set((state) => {
        const stages = state.stages.map((stage) => {
          if (stage.id !== stageId) return stage;
          
          const tasks = stage.tasks.map((task) => {
            if (task.id !== taskId) return task;
            
            const subTasks = task.subTasks.map((subTask) => {
              if (subTask.id !== subTaskId) return subTask;
              return { ...subTask, completed: !subTask.completed };
            });
            
            // Check if all subtasks are completed
            const allSubTasksCompleted = subTasks.every(subTask => subTask.completed);
            // If all subtasks are completed, mark the task as completed
            // If not all subtasks are completed, mark the task as not completed
            const completed = subTasks.length > 0 ? allSubTasksCompleted : task.completed;
            
            return { ...task, subTasks, completed };
          });
          
          return { ...stage, tasks };
        });
        
        return { stages };
      }),
      
      parseMarkdownContent: () => {
        const { markdownContent } = get();
        if (!markdownContent.trim()) return;
        
        const lines = markdownContent.split('\n');
        const stages: Stage[] = [];
        
        let currentStage: Stage | null = null;
        let currentTask: Task | null = null;
        let currentSubTask: SubTask | null = null;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (!trimmedLine) continue;
          
          // Stage (H1)
          if (trimmedLine.startsWith('# ')) {
            // Save previous stage if exists
            if (currentStage) {
              stages.push(currentStage);
            }
            
            // Create new stage
            currentStage = {
              id: generateId(),
              title: trimmedLine.substring(2).trim(),
              description: '',
              tasks: []
            };
            
            currentTask = null;
            currentSubTask = null;
          }
          // Task (H2)
          else if (trimmedLine.startsWith('## ') && currentStage) {
            // Save previous task if exists
            if (currentTask) {
              currentStage.tasks.push(currentTask);
            }
            
            // Create new task
            currentTask = {
              id: generateId(),
              title: trimmedLine.substring(3).trim(),
              description: '',
              completed: false,
              subTasks: []
            };
            
            currentSubTask = null;
          }
          // SubTask (H3)
          else if (trimmedLine.startsWith('### ') && currentStage && currentTask) {
            // Save previous subtask if exists
            if (currentSubTask) {
              currentTask.subTasks.push(currentSubTask);
            }
            
            // Create new subtask
            currentSubTask = {
              id: generateId(),
              title: trimmedLine.substring(4).trim(),
              description: '',
              completed: false
            };
          }
          // Description (normal text)
          else {
            if (currentSubTask) {
              currentSubTask.description += (currentSubTask.description ? '\n' : '') + trimmedLine;
            } else if (currentTask) {
              currentTask.description += (currentTask.description ? '\n' : '') + trimmedLine;
            } else if (currentStage) {
              currentStage.description += (currentStage.description ? '\n' : '') + trimmedLine;
            }
          }
        }
        
        // Save the last items
        if (currentSubTask && currentTask) {
          currentTask.subTasks.push(currentSubTask);
        }
        
        if (currentTask && currentStage) {
          currentStage.tasks.push(currentTask);
        }
        
        if (currentStage) {
          stages.push(currentStage);
        }
        
        set({ stages });
      }
    }),
    {
      name: 'todo-storage',
      // Only persist the stages and isAdmin state
      partialize: (state) => ({ stages: state.stages, isAdmin: state.isAdmin }),
    }
  )
); 