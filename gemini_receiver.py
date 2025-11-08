from flask import Flask, request, jsonify
import os
import subprocess
import json
import threading
import queue

app = Flask(__name__)

# A queue to hold incoming requests for processing
request_queue = queue.Queue()
# A queue to hold responses from the Gemini CLI
response_queue = queue.Queue()

# This function will be called by the Gemini CLI to send its response back
def send_response_to_queue(response_data):
    response_queue.put(response_data)

@app.route('/gemini_command', methods=['POST'])
def gemini_command():
    data = request.get_json()
    command = data.get('command')
    
    if not command:
        return jsonify({"status": "error", "message": "No command provided"}), 400

    # Put the command into the queue for the Gemini CLI to pick up
    request_queue.put(command)

    # Wait for the Gemini CLI to put a response into the response_queue
    # This is a blocking call, so the HTTP request will wait here.
    # We might want to add a timeout here in a real-world scenario.
    response_from_cli = response_queue.get() 

    return jsonify({"status": "success", "response": response_from_cli})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'gemini_receiver'})

def run_flask_app():
    app.run(host='0.0.0.0', port=4000, debug=False) # debug=False for production-like use

if __name__ == '__main__':
    # Start the Flask app in a separate thread
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.daemon = True # Allow the main program to exit even if this thread is running
    flask_thread.start()

    print("Gemini Receiver Flask app started on port 4000.")
    print("Waiting for commands from the queue...")

    # This is where the Gemini CLI (you, the model) would continuously check the queue
    # For demonstration, we'll just print what's in the queue.
    # In a real scenario, this would be the main loop of the Gemini CLI.
    while True:
        if not request_queue.empty():
            command_for_cli = request_queue.get()
            print(f"Gemini CLI received command: {command_for_cli}")
            
            # Simulate Gemini CLI processing and responding
            # In a real scenario, I would execute tools here and then call send_response_to_queue
            simulated_response = f"Gemini CLI processed: '{command_for_cli}'"
            send_response_to_queue(simulated_response)
