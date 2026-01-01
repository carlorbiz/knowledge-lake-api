# First Nations GP Training Scoping Project - Interactive Management Tool

## Project Overview

This interactive project management tool transforms the Aboriginal and Torres Strait Islander GP Training mindmap into a comprehensive research management system for GPSA consulting work. The tool enables collaborative scoping research with real-time progress tracking, commenting, and professional report generation.

## Currently Completed Features

### ✅ Core Functionality
- **Interactive Mindmap Display**: Visual representation of all research areas with hierarchical structure
- **Real-time Progress Tracking**: Individual node progress with visual indicators and overall project metrics
- **Dynamic Status Management**: Update research status (Not Started, In Progress, Completed, Blocked, Deferred)
- **Priority Management**: Set and adjust priority levels (High, Medium, Low) for research areas
- **Commenting System**: Add, categorise, and manage research notes with resolution tracking
- **Professional Report Generation**: Comprehensive reports with charts, analysis, and recommendations

### 📊 Data Management
- **Structured Data Storage**: RESTful API integration for persistent data management
- **Comment Categorisation**: Support for observations, questions, sources, recommendations, barriers, and opportunities
- **Progress Analytics**: Automatic calculation of completion percentages and project metrics
- **Export Capabilities**: JSON data export and Word-compatible report generation

### 🎨 User Interface
- **Responsive Design**: Works across desktop and tablet devices
- **Interactive Node Selection**: Click nodes to view details and add comments
- **Visual Progress Indicators**: Progress bars, status badges, and priority markers
- **Professional Styling**: Clean, modern interface suitable for consulting presentations

## Functional Entry Points and Usage

### Main Interface (`/index.html`)
- **Primary URL**: `index.html`
- **Purpose**: Main project management dashboard
- **Key Features**: 
  - Interactive mindmap with clickable nodes
  - Sidebar with node details and comments
  - Real-time progress tracking
  - Report generation access

### Data API Endpoints
All endpoints use relative URLs from the root domain:

- **`GET tables/mindmap_nodes`** - Retrieve all mindmap nodes with pagination
- **`GET tables/mindmap_nodes/{node_id}`** - Get specific node details
- **`PATCH tables/mindmap_nodes/{node_id}`** - Update node status, priority, or progress
- **`GET tables/node_comments?search={node_id}`** - Get comments for specific node
- **`POST tables/node_comments`** - Add new research comment
- **`PATCH tables/node_comments/{comment_id}`** - Update comment resolution status
- **`DELETE tables/node_comments/{comment_id}`** - Remove comment
- **`GET tables/project_metadata/project_1`** - Get project overview and metrics

## Research Areas Structure

### Primary Research Categories
1. **Support for GP Training Supervisors** (30% complete)
   - Team-based cultural learning approaches
   - Specific supervisor training programs
   - RACGP Aboriginal & Torres Strait Islander Health Faculty programs

2. **Support for Trainees** (40% complete)
   - Indigenous health curriculum supports
   - Clinical support frameworks for registrars
   - Mentorship programs (RACGP/ACRRM)

3. **The GP Training Lifecycle Experience** (20% complete)
   - Cultural compatibility of training posts
   - Rural placements for cultural immersion
   - ACCHO placement opportunities

4. **Trainees Challenges** (35% complete)
   - Cultural isolation in non-community placements
   - Limited comprehensive primary healthcare opportunities

### Data Management Features

#### Comment Types Support
- **Observations**: Research findings and insights
- **Questions**: Outstanding research queries
- **Sources**: Reference material and evidence
- **Recommendations**: Strategic suggestions
- **Barriers**: Identified obstacles
- **Opportunities**: Potential improvements

#### Progress Tracking
- Individual node completion percentages (0-100%)
- Overall project progress calculation
- Status tracking with visual indicators
- Priority-based work planning

## Features Not Yet Implemented

### 🔜 Planned Enhancements
- **Advanced Search**: Full-text search across nodes and comments
- **Stakeholder Collaboration**: Multi-user access with role-based permissions
- **Document Integration**: Direct attachment of source documents to nodes
- **Timeline View**: Project timeline with milestone tracking
- **Email Integration**: Automated progress reports and notifications
- **Advanced Analytics**: Trend analysis and predictive project completion
- **Mobile App**: Dedicated mobile application for field research
- **Integration APIs**: Connect with external research management tools

### 📋 Content Expansion
- **Detailed Source Integration**: Link comments directly to specific research sources
- **Stakeholder Mapping**: Visual representation of key stakeholders per research area
- **Risk Assessment**: Systematic risk identification and mitigation planning
- **Implementation Planning**: Detailed action plans for each recommendation

## Recommended Next Steps for Development

### Immediate Priorities (Next 2 Weeks)
1. **Complete Outstanding Research Areas**: Focus on 4 areas marked "Not Started"
2. **Resolve Pending Questions**: Address 3 unresolved research questions in comments
3. **Stakeholder Validation**: Share interactive tool with key GPSA stakeholders for feedback
4. **Source Documentation**: Link all 19 sources directly to relevant nodes

### Short-term Goals (Next Month)
1. **Advanced Search Implementation**: Enable full-text search across all content
2. **Report Customisation**: Allow users to generate tailored reports by category
3. **Integration Testing**: Validate all API endpoints and data consistency
4. **User Training**: Create documentation and training materials for GPSA team

### Long-term Vision (Next Quarter)
1. **Multi-project Support**: Extend tool to support multiple concurrent scoping projects
2. **Advanced Analytics**: Implement predictive analytics for project completion
3. **External Integration**: Connect with GPSA's existing project management systems
4. **Public Reporting**: Create public-facing summary reports for transparency

## Technical Architecture

### Frontend Technologies
- **HTML5/CSS3**: Modern responsive web standards
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility
- **Chart.js**: Interactive charts and data visualisation
- **Font Awesome**: Professional iconography

### Data Management
- **RESTful Table API**: Persistent data storage with CRUD operations
- **JSON Data Format**: Structured data exchange
- **Client-side State Management**: Real-time UI updates
- **Export Functionality**: Data portability and backup

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Responsive Design**: Optimised for desktop and tablet use
- **Progressive Enhancement**: Graceful degradation for older browsers

## Data Models and Storage

### Core Data Structures

#### Mindmap Nodes
```javascript
{
  id: "unique_identifier",
  title: "Node title",
  description: "Detailed description",
  parent_id: "parent_node_id",
  level: 1,
  category: "support_systems",
  status: "in_progress",
  priority: "high",
  assigned_to: "Carla",
  source_count: 5,
  completion_percentage: 75
}
```

#### Research Comments
```javascript
{
  id: "comment_id",
  node_id: "associated_node",
  author: "Carla",
  comment_text: "Research observation",
  comment_type: "observation",
  timestamp: "2024-12-24",
  is_resolved: false
}
```

#### Project Metadata
```javascript
{
  project_name: "Aboriginal and Torres Strait Islander GP Training Scoping Study",
  client: "General Practice Supervision Australia (GPSA)",
  project_lead: "Carla",
  total_sources: 19,
  overall_progress: 35,
  start_date: "2024-12-01",
  target_completion: "2025-02-28"
}
```

## Public URLs and Deployment

### Development Environment
- **Main Application**: `index.html`
- **API Base**: Relative URLs from application root
- **Static Assets**: `css/`, `js/`, `images/` directories

### Production Deployment
To deploy this application:
1. **Use the Publish tab** in the development environment
2. All files will be automatically deployed with one click
3. A live website URL will be provided for stakeholder access
4. The API endpoints will be fully functional in the deployed environment

## Contact and Support

**Project Lead**: Carla  
**Organisation**: General Practice Supervision Australia (GPSA)  
**Project Type**: Aboriginal and Torres Strait Islander GP Training Scoping Study  
**Last Updated**: December 2024  

For technical support or project inquiries, please refer to the GPSA project management team or the deployed application's help documentation.

---

*This tool represents a comprehensive transformation of traditional mindmapping into an interactive, collaborative research management platform specifically designed for the unique requirements of Aboriginal and Torres Strait Islander healthcare education research.*