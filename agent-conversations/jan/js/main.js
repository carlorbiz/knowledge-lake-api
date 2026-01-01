// Concept-to-Course Technical Documentation - Interactive Features

// Tab Management
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active', 'border-aussie-blue', 'text-aussie-blue');
        button.classList.add('border-transparent', 'text-gray-600');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Add active class to clicked tab button
    const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-aussie-blue', 'text-aussie-blue');
        activeButton.classList.remove('border-transparent', 'text-gray-600');
    }
    
    // Update URL hash for bookmarking
    window.location.hash = tabName;
}

// Test Results Tracking
function updateTestCounts() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    const passedCount = checkedBoxes.length;
    const totalCount = checkboxes.length;
    const completionPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    
    // Update display elements if they exist
    const passedElement = document.getElementById('passed-count');
    const failedElement = document.getElementById('failed-count');
    const completionElement = document.getElementById('completion-percent');
    
    if (passedElement) passedElement.textContent = passedCount;
    if (failedElement) failedElement.textContent = totalCount - passedCount;
    if (completionElement) completionElement.textContent = completionPercent + '%';
}

// Copy Code Functionality
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('bg-green-600');
        button.classList.remove('bg-aussie-blue');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
            button.classList.add('bg-aussie-blue');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        button.textContent = 'Copy Failed';
        button.classList.add('bg-red-600');
        button.classList.remove('bg-aussie-blue');
        
        setTimeout(() => {
            button.textContent = 'Copy Code';
            button.classList.remove('bg-red-600');
            button.classList.add('bg-aussie-blue');
        }, 2000);
    });
}

// Deployment Progress Tracking
let deploymentSteps = [
    { id: 'step1', name: 'Replace collectAllSourceMaterials_ Function', completed: false, critical: true },
    { id: 'step2', name: 'Restore Superior Module Extraction', completed: false, critical: true },
    { id: 'step3', name: 'Fix Modification Workflow Quality', completed: false, critical: true },
    { id: 'step4', name: 'Implement Gemini PDF Processing', completed: false, critical: false }
];

function toggleDeploymentStep(stepId) {
    const step = deploymentSteps.find(s => s.id === stepId);
    if (step) {
        step.completed = !step.completed;
        updateDeploymentProgress();
    }
}

function updateDeploymentProgress() {
    const completedSteps = deploymentSteps.filter(step => step.completed).length;
    const totalSteps = deploymentSteps.length;
    const criticalSteps = deploymentSteps.filter(step => step.critical && step.completed).length;
    const totalCritical = deploymentSteps.filter(step => step.critical).length;
    
    // Update any progress indicators
    console.log(`Deployment Progress: ${completedSteps}/${totalSteps} steps completed`);
    console.log(`Critical Steps: ${criticalSteps}/${totalCritical} completed`);
}

// Collapsible Sections
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const icon = document.querySelector(`[data-section="${sectionId}"] i`);
    
    if (section && icon) {
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            section.classList.add('hidden');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const searchableElements = document.querySelectorAll('[data-searchable]');
            
            searchableElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                const parent = element.closest('.search-container') || element;
                
                if (text.includes(searchTerm) || searchTerm === '') {
                    parent.style.display = '';
                } else {
                    parent.style.display = 'none';
                }
            });
        });
    }
}

// Print Functionality
function printSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Section</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;margin:20px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(section.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}

// Dark Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    }
}

// Load saved dark mode preference
function loadDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Export Functions
function exportDeploymentChecklist() {
    const checklist = deploymentSteps.map(step => 
        `${step.completed ? '✅' : '⏳'} ${step.name} ${step.critical ? '(CRITICAL)' : ''}`
    ).join('\n');
    
    const blob = new Blob([checklist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'concept-to-course-deployment-checklist.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${getNotificationClasses(type)}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

function getNotificationClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-500 text-white';
        case 'error':
            return 'bg-red-500 text-white';
        case 'warning':
            return 'bg-yellow-500 text-black';
        default:
            return 'bg-blue-500 text-white';
    }
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + 1-4 for tab navigation
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    showTab('overview');
                    break;
                case '2':
                    e.preventDefault();
                    showTab('critical-fixes');
                    break;
                case '3':
                    e.preventDefault();
                    showTab('deployment');
                    break;
                case '4':
                    e.preventDefault();
                    showTab('testing');
                    break;
                case '5':
                    e.preventDefault();
                    showTab('standards');
                    break;
            }
        }
        
        // Ctrl + P for printing current section
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-content:not(.hidden)');
            if (activeTab) {
                printSection(activeTab.id);
            }
        }
    });
}

// Smooth Scrolling
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved preferences
    loadDarkModePreference();
    
    // Initialize features
    initSearch();
    initKeyboardShortcuts();
    
    // Check for URL hash to show specific tab
    const hash = window.location.hash.substring(1);
    if (hash && ['overview', 'critical-fixes', 'deployment', 'testing', 'standards'].includes(hash)) {
        showTab(hash);
    }
    
    // Add event listeners for checkboxes to update test counts
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTestCounts);
    });
    
    // Initial test count update
    updateTestCounts();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Concept-to-Course Technical Documentation loaded successfully! Use Alt+1-5 for quick tab navigation.', 'success');
    }, 1000);
    
    console.log('Concept-to-Course Technical Documentation initialized successfully');
    console.log('Available keyboard shortcuts:');
    console.log('- Alt+1: Overview tab');
    console.log('- Alt+2: Critical Fixes tab');
    console.log('- Alt+3: Deployment tab');
    console.log('- Alt+4: Testing tab');
    console.log('- Alt+5: Standards tab');
    console.log('- Ctrl+P: Print current section');
});

// Export for global access
window.ConceptToCourse = {
    showTab,
    toggleSection,
    copyToClipboard,
    toggleDeploymentStep,
    exportDeploymentChecklist,
    showNotification,
    smoothScrollTo,
    updateTestCounts
};