// Main application controller
class App {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing First Nations GP Training Project Management Tool...');
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    async startApp() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Initialize data
            await this.loadInitialData();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Hide loading state
            this.hideLoadingState();
            
            this.initialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Error starting application:', error);
            this.showError('Failed to load project data. Please check your connection and refresh.');
        }
    }
    
    showLoadingState() {
        // Add loading overlay if it doesn't exist
        if (!document.getElementById('loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50';
            overlay.innerHTML = `
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">Loading project data...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }
    
    hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    async loadInitialData() {
        try {
            // Load mindmap data
            await window.mindMapManager.loadNodes();
            
            // Load project metadata and update UI
            await this.updateProjectInfo();
            
            console.log('Initial data loaded successfully');
        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error;
        }
    }
    
    async updateProjectInfo() {
        try {
            const response = await fetch('tables/project_metadata/project_1');
            if (response.ok) {
                const projectData = await response.json();
                
                // Update overall progress
                const progressElement = document.getElementById('overall-progress');
                if (progressElement && projectData.overall_progress !== undefined) {
                    progressElement.textContent = `${projectData.overall_progress}%`;
                }
            }
        } catch (error) {
            console.error('Error updating project info:', error);
        }
    }
    
    setupGlobalEventListeners() {
        // Refresh data button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                try {
                    await this.refreshAllData();
                } finally {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R for refresh (prevent default browser refresh)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshAllData();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Click outside to deselect nodes
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.node') && !e.target.closest('#sidebar')) {
                this.deselectNode();
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            // Handle any state changes if needed
            console.log('Navigation state changed');
        });
        
        // Auto-save functionality (if user makes changes)
        this.setupAutoSave();
    }
    
    async refreshAllData() {
        try {
            console.log('Refreshing all data...');
            
            // Reload mindmap
            await window.mindMapManager.loadNodes();
            
            // Reload comments if a node is selected
            if (window.mindMapManager.selectedNode) {
                await window.commentsManager.loadComments(window.mindMapManager.selectedNode.id);
            }
            
            // Update project info
            await this.updateProjectInfo();
            
            // Show success message
            this.showNotification('Data refreshed successfully', 'success');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Error refreshing data', 'error');
        }
    }
    
    closeAllModals() {
        // Close comment modal
        const commentModal = document.getElementById('comment-modal');
        if (commentModal && commentModal.style.display !== 'none') {
            commentModal.style.display = 'none';
        }
        
        // Close progress modal
        const progressModal = document.getElementById('progress-modal');
        if (progressModal && progressModal.style.display !== 'none') {
            progressModal.style.display = 'none';
        }
    }
    
    deselectNode() {
        // Remove selection from all nodes
        document.querySelectorAll('.node').forEach(el => {
            el.classList.remove('ring-4', 'ring-blue-500');
        });
        
        // Clear selected node
        if (window.mindMapManager) {
            window.mindMapManager.selectedNode = null;
        }
        
        // Hide node details
        const nodeDetails = document.getElementById('node-details');
        if (nodeDetails) {
            nodeDetails.style.display = 'none';
        }
        
        // Clear comments
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">Select a node to view comments</div>';
        }
    }
    
    setupAutoSave() {
        // Track changes and periodically save
        let hasUnsavedChanges = false;
        let autoSaveTimer;
        
        // Listen for data changes
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const result = originalFetch.apply(this, args);
            
            // Mark as having changes if it's a POST, PUT, or PATCH request
            if (args[1] && ['POST', 'PUT', 'PATCH'].includes(args[1].method)) {
                hasUnsavedChanges = true;
                
                // Clear existing timer
                if (autoSaveTimer) {
                    clearTimeout(autoSaveTimer);
                }
                
                // Set new timer for auto-refresh
                autoSaveTimer = setTimeout(() => {
                    if (hasUnsavedChanges && window.app) {
                        window.app.refreshAllData();
                        hasUnsavedChanges = false;
                    }
                }, 2000); // Auto-refresh 2 seconds after last change
            }
            
            return result;
        };
        
        // Warn user about unsaved changes on page unload
        window.addEventListener('beforeunload', (e) => {
            if (hasUnsavedChanges) {
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                e.returnValue = message;
                return message;
            }
        });
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    showError(message) {
        console.error('Application Error:', message);
        
        // Show error modal or notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-600 bg-opacity-90 flex items-center justify-center z-50 text-white text-center p-4';
        errorDiv.innerHTML = `
            <div class="max-w-md">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Application Error</h3>
                <p class="mb-4">${message}</p>
                <button onclick="location.reload()" class="bg-white text-red-600 px-4 py-2 rounded font-medium hover:bg-gray-100">
                    Refresh Page
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }
    
    // Utility methods for other components
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            return date.toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid date';
        }
    }
    
    // Public methods for external access
    getSelectedNode() {
        return window.mindMapManager?.selectedNode || null;
    }
    
    getAllNodes() {
        return Array.from(window.mindMapManager?.nodes.values() || []);
    }
}

// Initialize the application
window.app = new App();

// Global utility functions
window.utils = {
    formatDate: (dateString) => window.app.formatDate(dateString),
    showNotification: (message, type, duration) => window.app.showNotification(message, type, duration),
    apiRequest: (endpoint, options) => window.app.apiRequest(endpoint, options)
};

console.log('First Nations GP Training Project Management Tool loaded successfully!');