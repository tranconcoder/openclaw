FROM alpine/openclaw:main

# Switch to root to install system dependencies
USER root

# The container OS was identified as Debian 12 (bookworm)
# Update apt and install required dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment for whisper to avoid PEP 668 PEP-Breakage
RUN python3 -m venv /opt/whisper-env && \
    /opt/whisper-env/bin/pip install -U openai-whisper setuptools-rust

# Symlink the whisper binary so it is available in the user's PATH
RUN ln -s /opt/whisper-env/bin/whisper /usr/local/bin/whisper

# Switch back to the node user
USER node
