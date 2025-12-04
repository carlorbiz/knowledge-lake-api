#!/usr/bin/env python3
"""
Test script for Manus MCP Server

This script tests the basic functionality of the MCP server tools.
"""

import asyncio
import json
import sys
from manus_server import (
    assign_task, 
    get_task_status, 
    get_task_result, 
    list_my_tasks,
    update_task_status
)


async def test_mcp_server():
    """Test all MCP server tools"""
    print("=" * 60)
    print("Testing Manus MCP Server")
    print("=" * 60)
    
    # Test 1: Assign a task
    print("\n[Test 1] Assigning a new task...")
    result = await assign_task(
        description="Create a Python script to analyze CSV data",
        context="The CSV has columns: date, sales, region. Calculate total sales by region.",
        priority="high"
    )
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to assign task")
        return False
    
    task_id = result_data["task_id"]
    print(f"✅ Task assigned successfully: {task_id}")
    
    # Test 2: Get task status
    print("\n[Test 2] Getting task status...")
    result = await get_task_status(task_id)
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to get task status")
        return False
    
    print(f"✅ Task status: {result_data['status']}")
    
    # Test 3: Update task to in_progress
    print("\n[Test 3] Updating task to in_progress...")
    result = await update_task_status(task_id, "in_progress")
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to update task status")
        return False
    
    print(f"✅ Task updated to: {result_data['status']}")
    
    # Test 4: Complete the task
    print("\n[Test 4] Completing the task...")
    result = await update_task_status(
        task_id, 
        "completed",
        result="Task completed successfully. Total sales by region: North: $150k, South: $200k, East: $175k, West: $225k"
    )
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to complete task")
        return False
    
    print(f"✅ Task completed")
    
    # Test 5: Get task result
    print("\n[Test 5] Getting task result...")
    result = await get_task_result(task_id)
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to get task result")
        return False
    
    print(f"✅ Task result retrieved")
    
    # Test 6: List all tasks
    print("\n[Test 6] Listing all tasks...")
    result = await list_my_tasks()
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to list tasks")
        return False
    
    print(f"✅ Found {result_data['returned_count']} task(s)")
    
    # Test 7: Assign another task with different priority
    print("\n[Test 7] Assigning a low priority task...")
    result = await assign_task(
        description="Research best practices for Python testing",
        context="Focus on pytest and unittest frameworks",
        priority="low"
    )
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to assign second task")
        return False
    
    task_id_2 = result_data["task_id"]
    print(f"✅ Second task assigned: {task_id_2}")
    
    # Test 8: List pending tasks
    print("\n[Test 8] Listing pending tasks...")
    result = await list_my_tasks(status_filter="pending")
    result_data = json.loads(result)
    print(result)
    
    if not result_data.get("success"):
        print("❌ Failed to list pending tasks")
        return False
    
    print(f"✅ Found {result_data['returned_count']} pending task(s)")
    
    # Test 9: Test error handling - invalid task ID
    print("\n[Test 9] Testing error handling with invalid task ID...")
    result = await get_task_status("invalid-task-id")
    result_data = json.loads(result)
    print(result)
    
    if result_data.get("success"):
        print("❌ Should have failed with invalid task ID")
        return False
    
    print(f"✅ Error handling works correctly")
    
    # Test 10: Test invalid priority
    print("\n[Test 10] Testing error handling with invalid priority...")
    result = await assign_task(
        description="Test task",
        priority="urgent"  # Invalid priority
    )
    result_data = json.loads(result)
    print(result)
    
    if result_data.get("success"):
        print("❌ Should have failed with invalid priority")
        return False
    
    print(f"✅ Priority validation works correctly")
    
    print("\n" + "=" * 60)
    print("All tests passed! ✅")
    print("=" * 60)
    return True


if __name__ == "__main__":
    try:
        success = asyncio.run(test_mcp_server())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
