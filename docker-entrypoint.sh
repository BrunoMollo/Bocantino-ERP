#!/bin/sh
set -e

# If .env.docker exists, use it as .env (for Docker runtime)
if [ -f ".env.docker" ] && [ ! -f ".env" ]; then
    echo "Using .env.docker as runtime environment..."
    cp .env.docker .env
fi

# Start the application
exec "$@"
