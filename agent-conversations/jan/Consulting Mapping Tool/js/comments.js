// Comments management functionality
class CommentsManager {
    constructor() {
        this.currentNodeId = null;
        this.commentsContainer = document.getElementById('comments-list');
        this.modal = document.getElementById('comment-modal');
        this.form = document.getElementById('comment-form');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add comment button
        document.getElementById('add-comment-btn').addEventListener('click', () => {
            if (window.mindMapManager.selectedNode) {
                this.showCommentModal();
            } else {
                alert('Please select a node first to add a comment.');
            }
        });
        
        // Modal close buttons
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideCommentModal();
        });
        
        document.getElementById('cancel-comment').addEventListener('click', () => {
            this.hideCommentModal();
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
        
        // Close modal on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideCommentModal();
            }
        });
    }
    
    showCommentModal() {
        this.modal.style.display = 'flex';
        document.getElementById('comment-text').focus();
    }
    
    hideCommentModal() {
        this.modal.style.display = 'none';
        this.form.reset();
    }
    
    async loadComments(nodeId) {
        this.currentNodeId = nodeId;
        
        try {
            // Load comments for this specific node
            const response = await fetch(`tables/node_comments?search=${nodeId}&limit=100`);
            const result = await response.json();
            
            if (result.data) {
                // Filter comments for this node (API search might not be exact)
                const nodeComments = result.data.filter(comment => comment.node_id === nodeId);
                this.renderComments(nodeComments);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            this.commentsContainer.innerHTML = '<div class="text-sm text-gray-500">Error loading comments</div>';
        }
    }
    
    renderComments(comments) {
        if (!comments || comments.length === 0) {
            this.commentsContainer.innerHTML = '<div class="text-sm text-gray-500 text-center py-4">No comments yet.<br>Click + to add one.</div>';
            return;
        }
        
        // Sort comments by timestamp (newest first)
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        const commentsHTML = comments.map(comment => this.renderComment(comment)).join('');
        this.commentsContainer.innerHTML = commentsHTML;
    }
    
    renderComment(comment) {
        const typeIcons = {
            observation: 'fas fa-eye',
            question: 'fas fa-question-circle',
            source: 'fas fa-book',
            recommendation: 'fas fa-lightbulb',
            barrier: 'fas fa-exclamation-triangle',
            opportunity: 'fas fa-star'
        };
        
        const typeColors = {
            observation: 'bg-blue-100 text-blue-800',
            question: 'bg-yellow-100 text-yellow-800',
            source: 'bg-green-100 text-green-800',
            recommendation: 'bg-purple-100 text-purple-800',
            barrier: 'bg-red-100 text-red-800',
            opportunity: 'bg-indigo-100 text-indigo-800'
        };
        
        const icon = typeIcons[comment.comment_type] || 'fas fa-comment';
        const colorClass = typeColors[comment.comment_type] || 'bg-gray-100 text-gray-800';
        const resolvedClass = comment.is_resolved ? 'opacity-60' : '';
        
        return `
            <div class="comment-card bg-white border rounded-lg p-3 ${resolvedClass}" data-comment-id="${comment.id}">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">
                            <i class="${icon} mr-1"></i>
                            ${comment.comment_type?.replace('_', ' ').toUpperCase() || 'COMMENT'}
                        </span>
                        ${comment.is_resolved ? '<span class="text-xs text-green-600 font-medium"><i class="fas fa-check mr-1"></i>Resolved</span>' : ''}
                    </div>
                    <div class="flex items-center space-x-1">
                        <button onclick="commentsManager.toggleResolved('${comment.id}', ${!comment.is_resolved})" 
                                class="text-gray-400 hover:text-gray-600 text-xs">
                            <i class="fas ${comment.is_resolved ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button onclick="commentsManager.deleteComment('${comment.id}')" 
                                class="text-gray-400 hover:text-red-600 text-xs">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <p class="text-sm text-gray-700 mb-2">${comment.comment_text}</p>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span class="font-medium">${comment.author}</span>
                    <span>${this.formatDate(comment.timestamp)}</span>
                </div>
            </div>
        `;
    }
    
    async submitComment() {
        const commentType = document.getElementById('comment-type').value;
        const commentText = document.getElementById('comment-text').value.trim();
        
        if (!commentText) {
            alert('Please enter a comment.');
            return;
        }
        
        if (!this.currentNodeId) {
            alert('No node selected.');
            return;
        }
        
        try {
            const response = await fetch('tables/node_comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    node_id: this.currentNodeId,
                    author: 'Carla', // Could be made dynamic
                    comment_text: commentText,
                    comment_type: commentType,
                    timestamp: new Date().toISOString(),
                    is_resolved: false
                })
            });
            
            if (response.ok) {
                this.hideCommentModal();
                // Reload comments for the current node
                await this.loadComments(this.currentNodeId);
            } else {
                alert('Error adding comment. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Error adding comment. Please try again.');
        }
    }
    
    async toggleResolved(commentId, resolved) {
        try {
            const response = await fetch(`tables/node_comments/${commentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_resolved: resolved
                })
            });
            
            if (response.ok) {
                // Reload comments for the current node
                await this.loadComments(this.currentNodeId);
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    }
    
    async deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }
        
        try {
            const response = await fetch(`tables/node_comments/${commentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Reload comments for the current node
                await this.loadComments(this.currentNodeId);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-AU');
        }
    }
    
    async getAllComments() {
        try {
            const response = await fetch('tables/node_comments?limit=1000');
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error loading all comments:', error);
            return [];
        }
    }
    
    getCommentStats(comments) {
        const stats = {
            total: comments.length,
            by_type: {},
            resolved: 0,
            unresolved: 0,
            by_node: {}
        };
        
        comments.forEach(comment => {
            // Count by type
            const type = comment.comment_type || 'unknown';
            stats.by_type[type] = (stats.by_type[type] || 0) + 1;
            
            // Count resolved status
            if (comment.is_resolved) {
                stats.resolved++;
            } else {
                stats.unresolved++;
            }
            
            // Count by node
            const nodeId = comment.node_id;
            stats.by_node[nodeId] = (stats.by_node[nodeId] || 0) + 1;
        });
        
        return stats;
    }
}

// Initialize comments manager
window.commentsManager = new CommentsManager();