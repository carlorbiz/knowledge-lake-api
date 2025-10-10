#!/usr/bin/env python3
"""
AI Brain Course Generator - Production Test
Test the complete course generation pipeline
"""

import requests
import json
import time

# Test data for real course creation
test_course = {
    "course_concept": "Advanced Medication Management for Aged Care Nurses",
    "audience_type": "Registered Nurses in Aged Care",
    "research_foundation": "Comprehensive evidence base available covering medication safety, polypharmacy management, regulatory compliance (AHPRA/NMBA standards), person-centered care approaches, and quality improvement methodologies specific to Australian aged care contexts."
}

def test_ai_brain_workflow():
    """Test the complete AI Brain workflow"""

    print("Testing AI Brain Course Generator...")
    print(f"Course: {test_course['course_concept']}")
    print(f"Audience: {test_course['audience_type']}")
    print()

    # Test each endpoint individually first
    base_url = "http://192.168.68.61:5000"

    print("1. Testing Audience Analysis...")
    try:
        response = requests.post(
            f"{base_url}/ai/audience-analysis",
            json=test_course,
            timeout=300
        )
        if response.status_code == 200:
            audience_result = response.json()
            print("SUCCESS: Audience Analysis")
            print(f"Analysis length: {len(audience_result.get('audience_analysis', ''))} chars")
        else:
            print(f"❌ Audience Analysis failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Audience Analysis error: {e}")
        return False

    print("\n2️⃣ Testing Course Architecture...")
    try:
        response = requests.post(
            f"{base_url}/course/architect",
            json=test_course,
            timeout=300
        )
        if response.status_code == 200:
            course_result = response.json()
            print("✅ Course Architecture: SUCCESS")
            print(f"Architecture length: {len(course_result.get('course_architecture', ''))} chars")
        else:
            print(f"❌ Course Architecture failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Course Architecture error: {e}")
        return False

    print("\n3️⃣ Testing Task Distribution...")
    try:
        task_data = {
            "course_architecture": course_result.get('course_architecture', ''),
            "audience_profile": audience_result.get('audience_analysis', '')
        }
        response = requests.post(
            f"{base_url}/ai/distribute-tasks",
            json=task_data,
            timeout=300
        )
        if response.status_code == 200:
            task_result = response.json()
            print("✅ Task Distribution: SUCCESS")
            print(f"Distribution length: {len(task_result.get('task_distribution', ''))} chars")
        else:
            print(f"❌ Task Distribution failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Task Distribution error: {e}")
        return False

    print("\n🎯 AI BRAIN WORKFLOW: COMPLETE SUCCESS!")
    print("\n📊 Results Summary:")
    print(f"- Audience Analysis: {len(audience_result.get('audience_analysis', ''))} characters")
    print(f"- Course Architecture: {len(course_result.get('course_architecture', ''))} characters")
    print(f"- Task Distribution: {len(task_result.get('task_distribution', ''))} characters")
    print("\n✅ Ready for n8n deployment!")

    return True

def test_n8n_webhook():
    """Test the n8n webhook if available"""

    print("\n4️⃣ Testing n8n Webhook (if available)...")

    try:
        # Try the n8n webhook
        response = requests.post(
            "http://localhost:5678/webhook/ai-brain-course-generator",
            json=test_course,
            timeout=600  # 10 minutes for full workflow
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ n8n Workflow: SUCCESS")
            print(f"Complete pipeline executed successfully!")
            return True
        else:
            print(f"⚠️ n8n Webhook not available or failed: {response.status_code}")
            print("This is normal if the workflow isn't imported yet.")
            return False

    except Exception as e:
        print(f"⚠️ n8n Webhook not available: {e}")
        print("This is normal if the workflow isn't imported yet.")
        return False

if __name__ == "__main__":
    print("AI BRAIN PRODUCTION TEST")
    print("=" * 50)

    # Test AI Brain components
    if test_ai_brain_workflow():
        # Test n8n integration if available
        test_n8n_webhook()

        print("\n🎯 DEPLOYMENT READY!")
        print("Next steps:")
        print("1. Import ai_brain_workflow.json into n8n")
        print("2. Activate the workflow")
        print("3. Create your first real course!")
    else:
        print("\n❌ Tests failed. Check Knowledge Lake server.")