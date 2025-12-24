FROM python:3.11-slim
WORKDIR /app

# Cache buster - forces rebuild when git commit changes
ARG BUILD_DATE
ARG GIT_COMMIT
LABEL build_date=$BUILD_DATE
LABEL git_commit=$GIT_COMMIT

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install build tools, Python packages, then clean up build tools
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y build-essential && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY *.py ./

# Railway sets PORT env var, default to 8080 for local testing
EXPOSE 8080

# Start the application
CMD ["python", "start_knowledge_lake.py"]
