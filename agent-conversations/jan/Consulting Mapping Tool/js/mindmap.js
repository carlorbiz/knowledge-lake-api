// Mindmap functionality
class MindMapManager {
    constructor() {
        this.nodes = new Map();
        this.selectedNode = null;
        this.nodesContainer = document.getElementById('nodes-container');
        this.connectionsContainer = document.getElementById('connections');
        this.nodeDetailsPanel = document.getElementById('node-details');
        this.nodeInfoPanel = document.getElementById('node-info');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle window resize for connection lines
        window.addEventListener('resize', () => {
            setTimeout(() => this.drawConnections(), 100);
        });
    }
    
    async loadNodes() {
        try {
            const response = await fetch('tables/mindmap_nodes');
            const result = await response.json();
            
            if (result.data) {
                this.nodes.clear();
                result.data.forEach(node => {
                    this.nodes.set(node.id, node);
                });
                
                this.renderNodes();
                setTimeout(() => this.drawConnections(), 100);
            }
        } catch (error) {
            console.error('Error loading nodes:', error);
        }
    }
    
    renderNodes() {
        this.nodesContainer.innerHTML = '';
        
        // Calculate positions for nodes
        const positions = this.calculateNodePositions();
        
        this.nodes.forEach((node, nodeId) => {
            const position = positions[nodeId] || { x: 300, y: 300 }; // Default position if not calculated
            const nodeElement = this.createNodeElement(node, position);
            this.nodesContainer.appendChild(nodeElement);
        });
    }
    
    calculateNodePositions() {
        const positions = {};
        const centerX = 600;
        const centerY = 400;
        const rootRadius = 250;
        const levelRadius = 350;
        
        // Position root node
        const rootNode = Array.from(this.nodes.values()).find(n => n.parent_id === null);
        if (rootNode) {
            positions[rootNode.id] = { x: centerX, y: centerY };
        }
        
        // Position level 1 nodes (main branches)
        const level1Nodes = Array.from(this.nodes.values()).filter(n => n.level === 1);
        level1Nodes.forEach((node, index) => {
            const angle = (index / level1Nodes.length) * 2 * Math.PI;
            positions[node.id] = {
                x: centerX + Math.cos(angle) * rootRadius,
                y: centerY + Math.sin(angle) * rootRadius
            };
        });
        
        // Position level 2+ nodes around their parents
        Array.from(this.nodes.values())
            .filter(n => n.level >= 2)
            .forEach(node => {
                if (positions[node.parent_id]) {
                    const siblings = Array.from(this.nodes.values())
                        .filter(n => n.parent_id === node.parent_id);
                    const siblingIndex = siblings.findIndex(n => n.id === node.id);
                    
                    const parentPos = positions[node.parent_id];
                    const angleOffset = (siblingIndex - (siblings.length - 1) / 2) * 0.8;
                    const distance = levelRadius / (node.level * 0.8);
                    
                    positions[node.id] = {
                        x: parentPos.x + Math.cos(angleOffset) * distance,
                        y: parentPos.y + Math.sin(angleOffset) * distance
                    };
                } else {
                    // Fallback position if parent not found
                    positions[node.id] = {
                        x: centerX + (Math.random() - 0.5) * 400,
                        y: centerY + (Math.random() - 0.5) * 400
                    };
                }
            });
        
        return positions;
    }
    
    createNodeElement(node, position) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `node absolute p-4 min-w-64 max-w-80 ${this.getNodeClass(node)} ${this.getStatusClass(node)} ${this.getPriorityClass(node)}`;
        nodeDiv.style.left = `${position.x - 120}px`;
        nodeDiv.style.top = `${position.y - 60}px`;
        nodeDiv.dataset.nodeId = node.id;
        
        // Progress bar
        const progressBar = `
            <div class="progress-bar mb-2">
                <div class="progress-fill" style="width: ${node.completion_percentage || 0}%"></div>
            </div>
        `;
        
        // Status and priority indicators
        const indicators = `
            <div class="flex items-center justify-between text-xs mb-2">
                <span class="px-2 py-1 rounded text-white bg-opacity-80 ${this.getStatusBadgeClass(node)}">
                    ${node.status?.replace('_', ' ').toUpperCase() || 'NOT SET'}
                </span>
                <span class="px-2 py-1 rounded text-white bg-opacity-80 ${this.getPriorityBadgeClass(node)}">
                    ${node.priority?.toUpperCase() || 'MEDIUM'}
                </span>
            </div>
        `;
        
        // Main content
        const content = `
            ${progressBar}
            ${indicators}
            <h3 class="font-semibold mb-2 text-sm leading-tight">${node.title}</h3>
            <div class="text-xs opacity-90 mb-2">
                ${node.description ? node.description.substring(0, 100) + '...' : ''}
            </div>
            <div class="flex items-center justify-between text-xs">
                <span><i class="fas fa-book mr-1"></i>${node.source_count || 0} sources</span>
                <span><i class="fas fa-user mr-1"></i>${node.assigned_to || 'Unassigned'}</span>
            </div>
        `;
        
        nodeDiv.innerHTML = content;
        
        // Add click handler
        nodeDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNode(node);
        });
        
        return nodeDiv;
    }
    
    getNodeClass(node) {
        if (node.parent_id === null) return 'node-root';
        if (node.category?.includes('support')) return 'node-support';
        if (node.category?.includes('challenge') || node.category?.includes('barrier')) return 'node-challenges';
        if (node.category?.includes('experience')) return 'node-experience';
        return 'node-sub';
    }
    
    getStatusClass(node) {
        return `status-${node.status?.replace(' ', '-') || 'not-started'}`;
    }
    
    getPriorityClass(node) {
        return `priority-${node.priority || 'medium'}`;
    }
    
    getStatusBadgeClass(node) {
        const status = node.status || 'not_started';
        const classes = {
            'not_started': 'bg-gray-600',
            'in_progress': 'bg-yellow-600',
            'completed': 'bg-green-600',
            'blocked': 'bg-red-600',
            'deferred': 'bg-purple-600'
        };
        return classes[status] || 'bg-gray-600';
    }
    
    getPriorityBadgeClass(node) {
        const priority = node.priority || 'medium';
        const classes = {
            'high': 'bg-red-600',
            'medium': 'bg-yellow-600',
            'low': 'bg-gray-600'
        };
        return classes[priority] || 'bg-yellow-600';
    }
    
    selectNode(node) {
        // Remove previous selection
        document.querySelectorAll('.node').forEach(el => {
            el.classList.remove('ring-4', 'ring-blue-500');
        });
        
        // Add selection to current node
        const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
        if (nodeElement) {
            nodeElement.classList.add('ring-4', 'ring-blue-500');
        }
        
        this.selectedNode = node;
        this.showNodeDetails(node);
        
        // Load comments for this node
        if (window.commentsManager) {
            window.commentsManager.loadComments(node.id);
        }
    }
    
    showNodeDetails(node) {
        this.nodeDetailsPanel.style.display = 'block';
        
        const detailsHTML = `
            <div class="space-y-3">
                <div>
                    <h5 class="font-medium text-gray-900">${node.title}</h5>
                    <p class="text-sm text-gray-600 mt-1">${node.description || 'No description available'}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-gray-500">Status:</span>
                        <div class="mt-1">
                            <select class="text-xs border rounded px-2 py-1 w-full" onchange="mindMapManager.updateNodeStatus('${node.id}', this.value)">
                                <option value="not_started" ${node.status === 'not_started' ? 'selected' : ''}>Not Started</option>
                                <option value="in_progress" ${node.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="completed" ${node.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="blocked" ${node.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                                <option value="deferred" ${node.status === 'deferred' ? 'selected' : ''}>Deferred</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <span class="text-gray-500">Priority:</span>
                        <div class="mt-1">
                            <select class="text-xs border rounded px-2 py-1 w-full" onchange="mindMapManager.updateNodePriority('${node.id}', this.value)">
                                <option value="low" ${node.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${node.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${node.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label class="text-gray-500 text-sm">Progress: ${node.completion_percentage || 0}%</label>
                    <input type="range" min="0" max="100" value="${node.completion_percentage || 0}" 
                           class="w-full mt-1" 
                           onchange="mindMapManager.updateNodeProgress('${node.id}', this.value)">
                </div>
                
                <div class="text-xs text-gray-500">
                    <div>Sources: ${node.source_count || 0}</div>
                    <div>Assigned: ${node.assigned_to || 'Unassigned'}</div>
                    <div>Category: ${node.category || 'None'}</div>
                </div>
            </div>
        `;
        
        this.nodeInfoPanel.innerHTML = detailsHTML;
    }
    
    async updateNodeStatus(nodeId, newStatus) {
        try {
            const response = await fetch(`tables/mindmap_nodes/${nodeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });
            
            if (response.ok) {
                const updatedNode = await response.json();
                this.nodes.set(nodeId, updatedNode);
                this.renderNodes();
                setTimeout(() => this.drawConnections(), 100);
                
                // Update overall progress
                this.updateOverallProgress();
            }
        } catch (error) {
            console.error('Error updating node status:', error);
        }
    }
    
    async updateNodePriority(nodeId, newPriority) {
        try {
            const response = await fetch(`tables/mindmap_nodes/${nodeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    priority: newPriority
                })
            });
            
            if (response.ok) {
                const updatedNode = await response.json();
                this.nodes.set(nodeId, updatedNode);
                this.renderNodes();
                setTimeout(() => this.drawConnections(), 100);
            }
        } catch (error) {
            console.error('Error updating node priority:', error);
        }
    }
    
    async updateNodeProgress(nodeId, newProgress) {
        try {
            const response = await fetch(`tables/mindmap_nodes/${nodeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completion_percentage: parseInt(newProgress)
                })
            });
            
            if (response.ok) {
                const updatedNode = await response.json();
                this.nodes.set(nodeId, updatedNode);
                this.renderNodes();
                setTimeout(() => this.drawConnections(), 100);
                
                // Update the selected node details if this node is selected
                if (this.selectedNode && this.selectedNode.id === nodeId) {
                    this.showNodeDetails(updatedNode);
                }
                
                // Update overall progress
                this.updateOverallProgress();
            }
        } catch (error) {
            console.error('Error updating node progress:', error);
        }
    }
    
    drawConnections() {
        if (!this.connectionsContainer) return;
        
        this.connectionsContainer.innerHTML = '';
        
        // Get container dimensions
        const containerRect = this.nodesContainer.getBoundingClientRect();
        const mindmapRect = document.getElementById('mindmap').getBoundingClientRect();
        
        this.connectionsContainer.setAttribute('width', containerRect.width);
        this.connectionsContainer.setAttribute('height', containerRect.height);
        
        this.nodes.forEach(node => {
            if (node.parent_id) {
                const parentElement = document.querySelector(`[data-node-id="${node.parent_id}"]`);
                const childElement = document.querySelector(`[data-node-id="${node.id}"]`);
                
                if (parentElement && childElement) {
                    const parentRect = parentElement.getBoundingClientRect();
                    const childRect = childElement.getBoundingClientRect();
                    
                    // Calculate relative positions
                    const parentX = parentRect.left + parentRect.width / 2 - mindmapRect.left;
                    const parentY = parentRect.top + parentRect.height / 2 - mindmapRect.top;
                    const childX = childRect.left + childRect.width / 2 - mindmapRect.left;
                    const childY = childRect.top + childRect.height / 2 - mindmapRect.top;
                    
                    // Create SVG line
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', parentX);
                    line.setAttribute('y1', parentY);
                    line.setAttribute('x2', childX);
                    line.setAttribute('y2', childY);
                    line.setAttribute('class', 'connection-line');
                    
                    this.connectionsContainer.appendChild(line);
                }
            }
        });
    }
    
    async updateOverallProgress() {
        try {
            const totalNodes = this.nodes.size;
            let totalProgress = 0;
            
            this.nodes.forEach(node => {
                totalProgress += (node.completion_percentage || 0);
            });
            
            const overallProgress = Math.round(totalProgress / totalNodes);
            
            // Update project metadata
            await fetch('tables/project_metadata/project_1', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    overall_progress: overallProgress
                })
            });
            
            // Update UI
            const progressElement = document.getElementById('overall-progress');
            if (progressElement) {
                progressElement.textContent = `${overallProgress}%`;
            }
            
        } catch (error) {
            console.error('Error updating overall progress:', error);
        }
    }
}

// Initialize mindmap manager
window.mindMapManager = new MindMapManager();