#!/usr/bin/env python3
"""
Premium Course Generator - Production Testing Suite
Test the complete premium course generation system with rate limiting
"""

import requests
import json
import time
from datetime import datetime

# Test data for comprehensive course creation
test_premium_course = {
    "course_concept": "Advanced Medication Management for Aged Care Nurses",
    "audience_type": "Registered Nurses in Aged Care",
    "source_urls": "https://www.nursingmidwiferyboard.gov.au/codes-guidelines-statements/professional-standards.aspx",
    "voice_type": "Charon",
    "research_foundation": "Available - comprehensive evidence base covering medication safety, polypharmacy management, regulatory compliance (AHPRA/NMBA standards), person-centered care approaches, and quality improvement methodologies specific to Australian aged care contexts."
}

def check_api_status():
    """Check if the Knowledge Lake API is running"""
    try:
        response = requests.get("http://192.168.68.61:5000/health", timeout=10)
        if response.status_code == 200:
            print("✅ Knowledge Lake API is running")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to Knowledge Lake API: {e}")
        return False

def test_individual_endpoints():
    """Test each premium endpoint individually with rate limiting"""
    base_url = "http://192.168.68.61:5000"

    endpoints_to_test = [
        {
            'name': 'Audience Analysis',
            'url': f'{base_url}/ai/audience-analysis',
            'data': test_premium_course
        },
        {
            'name': 'Course Architecture',
            'url': f'{base_url}/course/architect',
            'data': {
                'course_concept': test_premium_course['course_concept'],
                'audience_type': test_premium_course['audience_type'],
                'research_foundation': test_premium_course['research_foundation']
            }
        }
    ]

    results = {}

    for endpoint in endpoints_to_test:
        print(f"\n🔍 Testing {endpoint['name']}...")

        try:
            response = requests.post(
                endpoint['url'],
                json=endpoint['data'],
                timeout=120  # 2 minute timeout for safety
            )

            if response.status_code == 200:
                result = response.json()
                results[endpoint['name']] = {
                    'status': 'SUCCESS',
                    'response_size': len(str(result)),
                    'success': result.get('success', False)
                }
                print(f"✅ {endpoint['name']}: SUCCESS")
                print(f"   Response size: {len(str(result))} characters")
            else:
                results[endpoint['name']] = {
                    'status': 'FAILED',
                    'error_code': response.status_code,
                    'error_text': response.text[:200]
                }
                print(f"❌ {endpoint['name']}: FAILED ({response.status_code})")
                print(f"   Error: {response.text[:200]}")

        except requests.exceptions.Timeout:
            results[endpoint['name']] = {
                'status': 'TIMEOUT',
                'error': 'Request timed out after 2 minutes'
            }
            print(f"⏰ {endpoint['name']}: TIMEOUT")

        except Exception as e:
            results[endpoint['name']] = {
                'status': 'ERROR',
                'error': str(e)
            }
            print(f"❌ {endpoint['name']}: ERROR - {e}")

        # Rate limiting: wait between requests
        print("   ⏳ Waiting 10 seconds to respect rate limits...")
        time.sleep(10)

    return results

def test_premium_endpoints():
    """Test premium course component endpoints"""
    base_url = "http://192.168.68.61:5000"

    # Use minimal test data to avoid hitting API limits
    test_module_content = "Module: Advanced Medication Safety\n- Learning Objectives\n- Key concepts\n- Assessment criteria"

    premium_endpoints = [
        {
            'name': 'iSpring Assessments',
            'url': f'{base_url}/premium/ispring-assessments',
            'data': {
                'module_content': test_module_content,
                'course_concept': test_premium_course['course_concept'],
                'audience_type': test_premium_course['audience_type']
            }
        },
        {
            'name': 'Role Play Scenarios',
            'url': f'{base_url}/premium/roleplay-scenarios',
            'data': {
                'course_concept': test_premium_course['course_concept'],
                'audience_type': test_premium_course['audience_type'],
                'module_content': test_module_content
            }
        }
    ]

    results = {}

    for endpoint in premium_endpoints:
        print(f"\n🎯 Testing Premium {endpoint['name']}...")

        try:
            response = requests.post(
                endpoint['url'],
                json=endpoint['data'],
                timeout=180  # 3 minute timeout
            )

            if response.status_code == 200:
                result = response.json()
                results[endpoint['name']] = {
                    'status': 'SUCCESS',
                    'response_size': len(str(result)),
                    'success': result.get('success', False)
                }
                print(f"✅ {endpoint['name']}: SUCCESS")
                print(f"   Response size: {len(str(result))} characters")
            else:
                results[endpoint['name']] = {
                    'status': 'FAILED',
                    'error_code': response.status_code,
                    'error_text': response.text[:200]
                }
                print(f"❌ {endpoint['name']}: FAILED ({response.status_code})")
                print(f"   Error: {response.text[:200]}")

        except requests.exceptions.Timeout:
            results[endpoint['name']] = {
                'status': 'TIMEOUT',
                'error': 'Request timed out'
            }
            print(f"⏰ {endpoint['name']}: TIMEOUT")

        except Exception as e:
            results[endpoint['name']] = {
                'status': 'ERROR',
                'error': str(e)
            }
            print(f"❌ {endpoint['name']}: ERROR - {e}")

        # Rate limiting: wait between requests
        print("   ⏳ Waiting 15 seconds to respect rate limits...")
        time.sleep(15)

    return results

def test_monolithic_endpoint():
    """Test the complete monolithic course generation endpoint"""
    print(f"\n🚀 Testing Complete Premium Course Generation...")
    print("⚠️  WARNING: This will use multiple AI API calls")
    print("    Using shortened research foundation to minimize API usage")

    # Use existing research foundation to avoid generating new one
    test_data = test_premium_course.copy()

    try:
        response = requests.post(
            "http://192.168.68.61:5000/course/complete-pipeline",
            json=test_data,
            timeout=900  # 15 minute timeout for complete generation
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ COMPLETE PREMIUM COURSE GENERATION: SUCCESS!")
            print(f"   Course concept: {result.get('course', {}).get('course_concept', 'N/A')}")
            print(f"   Modules generated: {result.get('modules_ready_for_audio', 0)}")

            premium_components = result.get('premium_components_generated', {})
            print(f"   iSpring assessments: {premium_components.get('ispring_assessments', 0)}")
            print(f"   Role play scenarios: {premium_components.get('roleplay_scenarios', 0)}")
            print(f"   Workbook specifications: {premium_components.get('workbook_specifications', 'N/A')}")
            print(f"   SCORM package: {premium_components.get('scorm_package', 'N/A')}")

            return {
                'status': 'SUCCESS',
                'modules_generated': result.get('modules_ready_for_audio', 0),
                'premium_components': premium_components,
                'course_ready': result.get('premium_course_ready', False)
            }
        else:
            print(f"❌ COMPLETE GENERATION FAILED: {response.status_code}")
            print(f"   Error: {response.text[:300]}")
            return {
                'status': 'FAILED',
                'error_code': response.status_code,
                'error_text': response.text[:300]
            }

    except requests.exceptions.Timeout:
        print("⏰ COMPLETE GENERATION: TIMEOUT after 15 minutes")
        return {
            'status': 'TIMEOUT',
            'error': 'Complete generation timed out'
        }

    except Exception as e:
        print(f"❌ COMPLETE GENERATION ERROR: {e}")
        return {
            'status': 'ERROR',
            'error': str(e)
        }

def main():
    print("🧪 PREMIUM COURSE GENERATOR - PRODUCTION TESTING SUITE")
    print("=" * 60)
    print(f"Start time: {datetime.now().isoformat()}")
    print(f"Test course: {test_premium_course['course_concept']}")
    print(f"Target audience: {test_premium_course['audience_type']}")
    print()

    # Step 1: Check API status
    if not check_api_status():
        print("\n❌ Cannot proceed - API not available")
        return

    # Step 2: Test individual endpoints
    print("\n" + "="*60)
    print("PHASE 1: Testing Individual Endpoints")
    print("="*60)
    individual_results = test_individual_endpoints()

    # Step 3: Test premium endpoints
    print("\n" + "="*60)
    print("PHASE 2: Testing Premium Component Endpoints")
    print("="*60)
    premium_results = test_premium_endpoints()

    # Step 4: Test complete monolithic endpoint (optional)
    print("\n" + "="*60)
    print("PHASE 3: Complete Premium Course Generation")
    print("="*60)

    user_input = input("🚨 Test complete monolithic endpoint? This will use significant API calls (y/n): ")
    if user_input.lower() == 'y':
        monolithic_result = test_monolithic_endpoint()
    else:
        monolithic_result = {'status': 'SKIPPED', 'reason': 'User chose to skip'}

    # Summary
    print("\n" + "="*60)
    print("🎯 TESTING COMPLETE - SUMMARY REPORT")
    print("="*60)

    print("\\n📊 Individual Endpoints:")
    for name, result in individual_results.items():
        status_emoji = "✅" if result['status'] == 'SUCCESS' else "❌"
        print(f"   {status_emoji} {name}: {result['status']}")

    print("\\n🎯 Premium Components:")
    for name, result in premium_results.items():
        status_emoji = "✅" if result['status'] == 'SUCCESS' else "❌"
        print(f"   {status_emoji} {name}: {result['status']}")

    print(f"\\n🚀 Complete Generation: {monolithic_result['status']}")
    if monolithic_result['status'] == 'SUCCESS':
        print(f"   📚 Modules: {monolithic_result.get('modules_generated', 0)}")
        print(f"   🎓 Course Ready: {monolithic_result.get('course_ready', False)}")

    print(f"\\n⏰ Test completed: {datetime.now().isoformat()}")

    # Check if system is ready for production
    all_individual_passed = all(r['status'] == 'SUCCESS' for r in individual_results.values())
    all_premium_passed = all(r['status'] == 'SUCCESS' for r in premium_results.values())

    if all_individual_passed and all_premium_passed:
        print("\\n🎉 SYSTEM STATUS: READY FOR PRODUCTION!")
        print("   All endpoints functioning correctly with rate limiting")
    else:
        print("\\n⚠️  SYSTEM STATUS: NEEDS ATTENTION")
        print("   Some endpoints failed - check errors above")

if __name__ == "__main__":
    main()