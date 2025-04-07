FROM python:3.12

LABEL authors="HenryXiaoYang"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install -r requirements.txt

# Copy the code into the container
COPY . /app/

# Collect static files
RUN python3 manage.py collectstatic

# Apply database migrations
RUN python3 manage.py makemigrations Run4Hope
RUN python3 manage.py migrate

# Open port 8000
EXPOSE 8000

# Run the application
CMD ["gunicorn", "DjangoConfigs.wsgi", "-c", "gunicorn.conf.py"]