"""
Knowledge Lake Dashboard - Streamlit Web Interface
Provides visibility and access to all generated course content
"""

import streamlit as st
import requests
import json
from datetime import datetime
import os

# Configuration
API_BASE_URL = "http://localhost:5002"
st.set_page_config(
    page_title="Knowledge Lake Dashboard",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f8ff;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #1f77b4;
    }
    .course-card {
        background-color: #ffffff;
        padding: 1.5rem;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
        margin-bottom: 1rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
</style>
""", unsafe_allow_html=True)

def check_server_health():
    """Check if Knowledge Lake API is accessible"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=3)
        return response.status_code == 200
    except:
        return False

def get_course_outputs():
    """Get list of all course outputs from file system"""
    course_dir = "C:\\Users\\carlo\\Development\\mem0-sync\\mem0\\course_outputs"
    if not os.path.exists(course_dir):
        return []

    courses = []
    for folder in os.listdir(course_dir):
        folder_path = os.path.join(course_dir, folder)
        if os.path.isdir(folder_path):
            # Try to read course_data.json
            data_file = os.path.join(folder_path, "course_data.json")
            if os.path.exists(data_file):
                try:
                    with open(data_file, 'r', encoding='utf-8') as f:
                        course_data = json.load(f)
                        course_data['folder_name'] = folder
                        courses.append(course_data)
                except Exception as e:
                    st.warning(f"Could not read {folder}: {e}")

    return sorted(courses, key=lambda x: x.get('course_id', ''), reverse=True)

# Header
st.markdown('<div class="main-header">🌊 Knowledge Lake Dashboard</div>', unsafe_allow_html=True)

# Server Status
server_healthy = check_server_health()
if server_healthy:
    st.success("✅ Knowledge Lake API Server: Online")
else:
    st.error("⚠️ Knowledge Lake API Server: Offline - Please start the server")

# Sidebar
with st.sidebar:
    st.header("🔍 Filters & Search")
    search_query = st.text_input("Search courses", placeholder="Enter keywords...")

    st.header("📊 Quick Stats")
    courses = get_course_outputs()

    col1, col2 = st.columns(2)
    with col1:
        st.metric("Total Courses", len(courses))
    with col2:
        total_modules = sum(len(c.get('modules', [])) for c in courses)
        st.metric("Total Modules", total_modules)

    st.header("🎯 Audience Types")
    audience_types = set()
    for course in courses:
        aud = course.get('audience_type', 'Unknown')
        if aud:
            audience_types.add(aud)

    selected_audience = st.multiselect(
        "Filter by audience",
        options=sorted(audience_types) if audience_types else ["All"],
        default=[]
    )

# Main Content Tabs
tab1, tab2, tab3, tab4 = st.tabs(["📚 Course Browser", "🔬 Research Foundations", "📝 Content Library", "📊 Analytics"])

with tab1:
    st.header("📚 Generated Courses")

    if not courses:
        st.info("No courses found. Generate your first course using the n8n workflow!")
    else:
        # Filter courses
        filtered_courses = courses
        if selected_audience:
            filtered_courses = [c for c in courses if c.get('audience_type') in selected_audience]
        if search_query:
            filtered_courses = [c for c in filtered_courses
                              if search_query.lower() in c.get('course_concept', '').lower()]

        st.write(f"Showing {len(filtered_courses)} of {len(courses)} courses")

        for course in filtered_courses:
            with st.expander(f"**{course.get('course_concept', 'Unknown Course')}** ({course.get('course_id', 'N/A')})"):
                col1, col2, col3 = st.columns([2, 1, 1])

                with col1:
                    st.write(f"**Audience:** {course.get('audience_type', 'Not specified')}")
                    st.write(f"**Generated:** {course.get('timestamp', 'Unknown')}")
                    st.write(f"**Folder:** `{course.get('folder_name', 'N/A')}`")

                with col2:
                    modules = course.get('modules', [])
                    st.metric("Modules", len(modules))

                with col3:
                    research = course.get('research_foundation', '')
                    st.metric("Research Words", len(research.split()) if research else 0)

                # Show modules
                if modules:
                    st.subheader("📖 Modules")
                    for i, module in enumerate(modules[:12], 1):
                        st.write(f"**Module {i}:** {module.get('title', 'Untitled')}")
                        if module.get('learning_objectives'):
                            st.caption(f"Objectives: {len(module['learning_objectives'])}")

                # Course Architecture
                if course.get('course_architecture'):
                    with st.expander("View Course Architecture"):
                        st.text_area(
                            "Course Architecture",
                            course['course_architecture'],
                            height=300,
                            key=f"arch_{course.get('course_id')}"
                        )

                # Research Foundation
                if course.get('research_foundation'):
                    with st.expander("View Research Foundation"):
                        st.text_area(
                            "Research Foundation",
                            course['research_foundation'],
                            height=300,
                            key=f"research_{course.get('course_id')}"
                        )

with tab2:
    st.header("🔬 Research Foundations")
    st.info("Research foundations that inform course development")

    for course in courses:
        research = course.get('research_foundation', '')
        if research:
            with st.expander(f"**{course.get('course_concept', 'Unknown')}**"):
                st.markdown(f"**Course ID:** {course.get('course_id')}")
                st.markdown(f"**Word Count:** {len(research.split())} words")
                st.text_area(
                    "Research Content",
                    research,
                    height=400,
                    key=f"rf_{course.get('course_id')}"
                )

with tab3:
    st.header("📝 Content Library")
    st.info("Browse reusable content components")

    content_type = st.radio(
        "Content Type",
        ["All Modules", "Learning Objectives", "Key Concepts", "Assessments"]
    )

    for course in courses:
        modules = course.get('modules', [])
        if modules:
            st.subheader(f"📚 {course.get('course_concept')}")

            for module in modules[:12]:
                with st.expander(f"Module: {module.get('title', 'Untitled')}"):
                    if content_type in ["All Modules", "Learning Objectives"]:
                        st.markdown("**Learning Objectives:**")
                        for obj in module.get('learning_objectives', []):
                            st.write(f"- {obj}")

                    if content_type in ["All Modules", "Key Concepts"]:
                        st.markdown("**Key Concepts:**")
                        for concept in module.get('key_concepts', []):
                            st.write(f"- {concept}")

with tab4:
    st.header("📊 Analytics Dashboard")

    if courses:
        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Total Courses", len(courses))
            st.metric("Total Modules", sum(len(c.get('modules', [])) for c in courses))
            st.markdown('</div>', unsafe_allow_html=True)

        with col2:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            total_objectives = sum(
                len(obj)
                for c in courses
                for m in c.get('modules', [])
                for obj in [m.get('learning_objectives', [])]
            )
            st.metric("Learning Objectives", total_objectives)
            st.markdown('</div>', unsafe_allow_html=True)

        with col3:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            audience_counts = {}
            for c in courses:
                aud = c.get('audience_type', 'Unknown')
                audience_counts[aud] = audience_counts.get(aud, 0) + 1
            st.metric("Audience Types", len(audience_counts))
            st.markdown('</div>', unsafe_allow_html=True)

        st.subheader("📈 Courses by Audience Type")
        if audience_counts:
            st.bar_chart(audience_counts)

        st.subheader("📅 Course Generation Timeline")
        st.info("Timeline visualization coming soon!")

    else:
        st.info("No data available yet. Generate courses to see analytics!")

# Footer
st.markdown("---")
st.caption("Knowledge Lake Dashboard v1.0 | Built with Streamlit")
