// Reports generation functionality
class ReportsManager {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Generate report button
        document.getElementById('generate-report').addEventListener('click', () => {
            this.showProgressReport();
        });
        
        // Export data button
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportProjectData();
        });
        
        // Close progress modal
        document.getElementById('close-progress-modal').addEventListener('click', () => {
            document.getElementById('progress-modal').style.display = 'none';
        });
        
        // Close modal on backdrop click
        document.getElementById('progress-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('progress-modal')) {
                document.getElementById('progress-modal').style.display = 'none';
            }
        });
    }
    
    async showProgressReport() {
        const modal = document.getElementById('progress-modal');
        const content = document.getElementById('report-content');
        
        // Show modal with loading state
        modal.style.display = 'flex';
        content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2">Generating report...</p></div>';
        
        try {
            // Load all data
            const [projectData, nodesData, commentsData] = await Promise.all([
                this.loadProjectMetadata(),
                this.loadAllNodes(),
                this.loadAllComments()
            ]);
            
            // Generate report content
            const reportHTML = this.generateReportHTML(projectData, nodesData, commentsData);
            content.innerHTML = reportHTML;
            
        } catch (error) {
            console.error('Error generating report:', error);
            content.innerHTML = '<div class="text-center py-8 text-red-600"><i class="fas fa-exclamation-triangle text-2xl"></i><p class="mt-2">Error generating report. Please try again.</p></div>';
        }
    }
    
    async loadProjectMetadata() {
        const response = await fetch('tables/project_metadata/project_1');
        return await response.json();
    }
    
    async loadAllNodes() {
        const response = await fetch('tables/mindmap_nodes?limit=100');
        const result = await response.json();
        return result.data || [];
    }
    
    async loadAllComments() {
        const response = await fetch('tables/node_comments?limit=1000');
        const result = await response.json();
        return result.data || [];
    }
    
    generateReportHTML(projectData, nodesData, commentsData) {
        const stats = this.calculateProjectStats(nodesData, commentsData);
        const progressChart = this.generateProgressChartHTML(nodesData);
        const statusBreakdown = this.generateStatusBreakdownHTML(nodesData);
        const commentsAnalysis = this.generateCommentsAnalysisHTML(commentsData, nodesData);
        const recommendations = this.generateRecommendationsHTML(stats, commentsData);
        
        return `
            <div class="space-y-8">
                <!-- Executive Summary -->
                <div>
                    <h2 class="text-2xl font-bold mb-4 text-gray-900">Executive Summary</h2>
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p class="text-gray-800">
                            This report provides a comprehensive overview of the Aboriginal and Torres Strait Islander GP Training 
                            scoping project as of ${new Date().toLocaleDateString('en-AU')}. The project examines training supports 
                            and challenges across ${nodesData.length} key areas, with analysis based on ${projectData.total_sources} sources.
                        </p>
                    </div>
                </div>
                
                <!-- Key Metrics -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Key Project Metrics</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white border rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-blue-600">${stats.overallProgress}%</div>
                            <div class="text-sm text-gray-600">Overall Progress</div>
                        </div>
                        <div class="bg-white border rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-green-600">${stats.completedNodes}</div>
                            <div class="text-sm text-gray-600">Completed Areas</div>
                        </div>
                        <div class="bg-white border rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-yellow-600">${stats.inProgressNodes}</div>
                            <div class="text-sm text-gray-600">In Progress</div>
                        </div>
                        <div class="bg-white border rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-purple-600">${commentsData.length}</div>
                            <div class="text-sm text-gray-600">Total Comments</div>
                        </div>
                    </div>
                </div>
                
                <!-- Progress by Category -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Progress by Category</h3>
                    <div class="bg-white border rounded-lg p-6">
                        <canvas id="progress-chart" style="height: 400px;"></canvas>
                    </div>
                </div>
                
                <!-- Status Breakdown -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Status Breakdown</h3>
                    ${statusBreakdown}
                </div>
                
                <!-- Comments Analysis -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Research Comments Analysis</h3>
                    ${commentsAnalysis}
                </div>
                
                <!-- Key Findings by Area -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Key Findings by Research Area</h3>
                    ${this.generateFindingsByAreaHTML(nodesData, commentsData)}
                </div>
                
                <!-- Recommendations -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Strategic Recommendations</h3>
                    ${recommendations}
                </div>
                
                <!-- Next Steps -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Recommended Next Steps</h3>
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <ul class="list-disc list-inside space-y-2 text-gray-800">
                            <li>Complete research on ${stats.notStartedNodes} outstanding areas</li>
                            <li>Address ${stats.blockedNodes} blocked research areas</li>
                            <li>Resolve ${this.getUnresolvedCommentsCount(commentsData)} outstanding research questions</li>
                            <li>Validate findings with key stakeholders</li>
                            <li>Develop detailed implementation recommendations</li>
                        </ul>
                    </div>
                </div>
                
                <!-- Export Options -->
                <div class="border-t pt-6">
                    <div class="flex space-x-4">
                        <button onclick="reportsManager.exportReportToWord()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-file-word mr-2"></i>Export to Word
                        </button>
                        <button onclick="reportsManager.printReport()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                            <i class="fas fa-print mr-2"></i>Print Report
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    calculateProjectStats(nodesData, commentsData) {
        const totalNodes = nodesData.length;
        let totalProgress = 0;
        let completedNodes = 0;
        let inProgressNodes = 0;
        let notStartedNodes = 0;
        let blockedNodes = 0;
        
        nodesData.forEach(node => {
            totalProgress += (node.completion_percentage || 0);
            
            switch (node.status) {
                case 'completed':
                    completedNodes++;
                    break;
                case 'in_progress':
                    inProgressNodes++;
                    break;
                case 'not_started':
                    notStartedNodes++;
                    break;
                case 'blocked':
                    blockedNodes++;
                    break;
            }
        });
        
        return {
            overallProgress: Math.round(totalProgress / totalNodes),
            completedNodes,
            inProgressNodes,
            notStartedNodes,
            blockedNodes,
            totalNodes
        };
    }
    
    generateProgressChartHTML(nodesData) {
        // This will be rendered after the HTML is inserted
        setTimeout(() => {
            this.renderProgressChart(nodesData);
        }, 100);
        
        return '';
    }
    
    renderProgressChart(nodesData) {
        const canvas = document.getElementById('progress-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Group nodes by category and calculate average progress
        const categoryProgress = {};
        nodesData.forEach(node => {
            const category = node.category || 'Other';
            if (!categoryProgress[category]) {
                categoryProgress[category] = { total: 0, count: 0 };
            }
            categoryProgress[category].total += (node.completion_percentage || 0);
            categoryProgress[category].count += 1;
        });
        
        const labels = Object.keys(categoryProgress);
        const data = labels.map(label => 
            Math.round(categoryProgress[label].total / categoryProgress[label].count)
        );
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Progress (%)',
                    data: data,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    generateStatusBreakdownHTML(nodesData) {
        const statusCounts = {};
        nodesData.forEach(node => {
            const status = node.status || 'not_started';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const statusConfig = {
            'completed': { color: 'green', icon: 'fa-check-circle', label: 'Completed' },
            'in_progress': { color: 'yellow', icon: 'fa-clock', label: 'In Progress' },
            'not_started': { color: 'gray', icon: 'fa-circle', label: 'Not Started' },
            'blocked': { color: 'red', icon: 'fa-exclamation-circle', label: 'Blocked' },
            'deferred': { color: 'purple', icon: 'fa-pause-circle', label: 'Deferred' }
        };
        
        let html = '<div class="grid grid-cols-5 gap-4">';
        
        Object.keys(statusConfig).forEach(status => {
            const count = statusCounts[status] || 0;
            const config = statusConfig[status];
            const percentage = Math.round((count / nodesData.length) * 100);
            
            html += `
                <div class="bg-white border rounded-lg p-4 text-center">
                    <i class="fas ${config.icon} text-2xl text-${config.color}-600 mb-2"></i>
                    <div class="text-xl font-bold text-${config.color}-600">${count}</div>
                    <div class="text-sm text-gray-600">${config.label}</div>
                    <div class="text-xs text-gray-500">${percentage}%</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    generateCommentsAnalysisHTML(commentsData, nodesData) {
        const commentStats = this.analyzeComments(commentsData, nodesData);
        
        return `
            <div class="grid grid-cols-2 gap-6">
                <div class="bg-white border rounded-lg p-4">
                    <h4 class="font-semibold mb-3">Comments by Type</h4>
                    <div class="space-y-2">
                        ${Object.entries(commentStats.byType).map(([type, count]) => `
                            <div class="flex justify-between">
                                <span class="capitalize">${type.replace('_', ' ')}</span>
                                <span class="font-medium">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-white border rounded-lg p-4">
                    <h4 class="font-semibold mb-3">Research Status</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span>Total Comments</span>
                            <span class="font-medium">${commentStats.total}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Resolved</span>
                            <span class="font-medium text-green-600">${commentStats.resolved}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Outstanding</span>
                            <span class="font-medium text-yellow-600">${commentStats.unresolved}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    analyzeComments(commentsData, nodesData) {
        const stats = {
            total: commentsData.length,
            resolved: 0,
            unresolved: 0,
            byType: {},
            byNode: {}
        };
        
        commentsData.forEach(comment => {
            // Count by resolution status
            if (comment.is_resolved) {
                stats.resolved++;
            } else {
                stats.unresolved++;
            }
            
            // Count by type
            const type = comment.comment_type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
            
            // Count by node
            const nodeId = comment.node_id;
            stats.byNode[nodeId] = (stats.byNode[nodeId] || 0) + 1;
        });
        
        return stats;
    }
    
    generateFindingsByAreaHTML(nodesData, commentsData) {
        // Group nodes by main category
        const areas = {};
        nodesData.forEach(node => {
            if (node.level === 1) { // Main areas only
                areas[node.id] = {
                    node: node,
                    comments: commentsData.filter(c => c.node_id === node.id)
                };
            }
        });
        
        let html = '<div class="space-y-6">';
        
        Object.values(areas).forEach(area => {
            const { node, comments } = area;
            const progressClass = this.getProgressColorClass(node.completion_percentage);
            
            html += `
                <div class="bg-white border rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-lg font-semibold">${node.title}</h4>
                        <div class="flex items-center space-x-2">
                            <div class="w-24 bg-gray-200 rounded-full h-2">
                                <div class="h-2 ${progressClass} rounded-full" style="width: ${node.completion_percentage || 0}%"></div>
                            </div>
                            <span class="text-sm font-medium">${node.completion_percentage || 0}%</span>
                        </div>
                    </div>
                    
                    <p class="text-gray-600 mb-4">${node.description}</p>
                    
                    ${comments.length > 0 ? `
                        <div class="border-t pt-4">
                            <h5 class="font-medium mb-2">Key Research Notes (${comments.length})</h5>
                            <div class="space-y-2">
                                ${comments.slice(0, 3).map(comment => `
                                    <div class="text-sm bg-gray-50 p-2 rounded">
                                        <span class="font-medium capitalize">${comment.comment_type?.replace('_', ' ')}: </span>
                                        ${comment.comment_text}
                                    </div>
                                `).join('')}
                                ${comments.length > 3 ? `<div class="text-sm text-gray-500">... and ${comments.length - 3} more</div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    generateRecommendationsHTML(stats, commentsData) {
        // Generate smart recommendations based on data
        const recommendations = [];
        
        if (stats.blockedNodes > 0) {
            recommendations.push('Address blocked research areas to maintain project momentum');
        }
        
        if (stats.notStartedNodes > stats.inProgressNodes) {
            recommendations.push('Prioritise starting research on pending areas to balance workload');
        }
        
        const unresolvedQuestions = commentsData.filter(c => 
            c.comment_type === 'question' && !c.is_resolved
        ).length;
        
        if (unresolvedQuestions > 5) {
            recommendations.push('Focus on resolving outstanding research questions to progress analysis');
        }
        
        if (stats.overallProgress < 50) {
            recommendations.push('Consider allocating additional resources to accelerate progress');
        }
        
        const barriers = commentsData.filter(c => c.comment_type === 'barrier').length;
        if (barriers > 3) {
            recommendations.push('Develop strategies to address identified systemic barriers');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Continue current approach - project is progressing well');
        }
        
        return `
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <ul class="list-disc list-inside space-y-1">
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    getProgressColorClass(percentage) {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    }
    
    getUnresolvedCommentsCount(commentsData) {
        return commentsData.filter(c => !c.is_resolved).length;
    }
    
    async exportProjectData() {
        try {
            // Load all data
            const [projectData, nodesData, commentsData] = await Promise.all([
                this.loadProjectMetadata(),
                this.loadAllNodes(),
                this.loadAllComments()
            ]);
            
            // Prepare export data
            const exportData = {
                project_metadata: projectData,
                nodes: nodesData,
                comments: commentsData,
                export_date: new Date().toISOString(),
                export_version: '1.0'
            };
            
            // Create and download file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `first-nations-gp-training-project-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    }
    
    exportReportToWord() {
        // Generate Word-compatible HTML
        const reportContent = document.getElementById('report-content').innerHTML;
        const wordHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>First Nations GP Training Scoping Project Report</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
                    h1, h2, h3 { color: #333; }
                    .grid { display: block; }
                    .bg-blue-50 { background-color: #eff6ff; padding: 1em; border-left: 4px solid #3b82f6; }
                    .border { border: 1px solid #e5e7eb; padding: 1em; margin: 0.5em 0; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    .text-2xl { font-size: 1.5em; }
                    .text-xl { font-size: 1.25em; }
                </style>
            </head>
            <body>
                <h1>First Nations GP Training Scoping Project Report</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-AU')}</p>
                <p><strong>Project Lead:</strong> Carla</p>
                <hr>
                ${reportContent}
            </body>
            </html>
        `;
        
        const blob = new Blob([wordHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `first-nations-gp-training-report-${new Date().toISOString().split('T')[0]}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    printReport() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const printWindow = window.open('', '', 'width=800,height=600');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>First Nations GP Training Project Report</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
                    h1, h2, h3 { color: #333; page-break-after: avoid; }
                    .grid { display: block; }
                    .bg-blue-50 { background-color: #f0f9ff; padding: 1em; border-left: 4px solid #0ea5e9; }
                    .border { border: 1px solid #d1d5db; padding: 1em; margin: 0.5em 0; }
                    @media print {
                        .no-print { display: none; }
                        h2, h3 { page-break-after: avoid; }
                        .page-break { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                <h1>First Nations GP Training Scoping Project Report</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-AU')}</p>
                <hr>
                ${reportContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}

// Initialize reports manager
window.reportsManager = new ReportsManager();