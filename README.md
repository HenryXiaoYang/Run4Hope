# Run4Hope

This is a project for the Run4Hope event. It is a web application that allows users to track the runners.

## Installation

### Prerequisites

- Python 3.x
- pip

### Steps

1. Clone the repository:

```sh
git clone https://github.com/HenryXiaoYang/Run4Hope.git
cd Run4Hope
```

2. Install Python dependencies:

```sh
pip install -r requirements.txt
```

3. Edit the .env file to set your secret key:

```dotenv
DJANGO_SECRET_KEY=your_secret_key
```

Make sure to keep your keys safe!

4. Configure CSRF settings in DjangoConfigs/settings.py:

Django 4.0+ requires explicit configuration of trusted origins for CSRF protection. This is important for security, especially when deploying to production or when your application is accessed from different domains or IPs.

```python
# For local development
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# For production - add your actual domain(s)
# CSRF_TRUSTED_ORIGINS = [
#     'https://yourwebsite.com',
#     'https://www.yourwebsite.com',
# ]
```

Note: Always include the scheme (http:// or https://) in CSRF_TRUSTED_ORIGINS entries.

If you need to dynamically determine your server's IP address (useful in some deployment scenarios), you can use:

```python
import socket

# Get the hostname
hostname = socket.gethostname()
# Get the IP address
ip_address = socket.gethostbyname(hostname)

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    f'http://{ip_address}:8000',
    f'https://{ip_address}:8000',
]
```

If you continue to experience CSRF issues, consider installing django-cors-headers for more advanced cross-origin resource sharing control.

5. Edit the Run4Hope/settings.py file if you need to change some Django settings.

6. Collect static files:

```sh
python3 manage.py collectstatic
```

7. Migrate the database:

```sh
python3 manage.py makemigrations Run4Hope
python3 manage.py migrate
```

8. Create a superuser

```shell
python3 manage.py createsuperuser
```

## Usage

1. Run the server:

```sh
gunicorn DjangoConfigs.wsgi -c gunicorn.conf.py
```

2. Open your browser and go to `http://127.0.0.1:8000/` to view the website.
3. Use your superuser credentials to log in.

## Deploy with Docker

1. Build the image:

```sh
sudo docker build -t henryxiaoyang/run4hope .
```

2. Configure CSRF in your environment variables:

For Docker deployments, you may need to pass your domain as an environment variable and configure your settings.py to use it. Add a section to your settings.py that reads from environment variables:

```python
# In DjangoConfigs/settings.py
import os

# Get domains from environment or use defaults
csrf_trusted_domains = os.environ.get('CSRF_TRUSTED_DOMAINS', 'localhost,127.0.0.1').split(',')
CSRF_TRUSTED_ORIGINS = []

for domain in csrf_trusted_domains:
    CSRF_TRUSTED_ORIGINS.append(f'http://{domain}')
    CSRF_TRUSTED_ORIGINS.append(f'https://{domain}')
```

3. Run the image:

```sh
sudo docker run -d \
  --name run4hope \
  --restart always \
  -v run4hope:/app \
  -e DJANGO_SECRET_KEY=Your-Secret-Key \
  -e CSRF_TRUSTED_DOMAINS=yourwebsite.com,www.yourwebsite.com \
  -p 8000:8000 \
  henryxiaoyang/run4hope
```

or use docker-compose:

```docker-compose
version: "3"

services:
  run4hope:
    image: henryxiaoyang/run4hope
    container_name: run4hope
    restart: always
    volumes:
        - run4hope:/app
    environment:
      DJANGO_SECRET_KEY: Your-Secret-Key
      CSRF_TRUSTED_DOMAINS: yourwebsite.com,www.yourwebsite.com
    ports:
      - "8000:8000"

volumes:
    run4hope:
```

```sh
docker-compose up -d
```

## Troubleshooting CSRF Issues

If you encounter CSRF verification errors (403 Forbidden), try the following solutions:

1. **Verify CSRF_TRUSTED_ORIGINS includes the correct domain(s):**
   - Make sure all domains include the scheme (`http://` or `https://`)
   - Check for any subdomain issues (you may need to include both root domain and www version)
   - For dynamic IPs, ensure the current IP is included

2. **Common error messages and solutions:**
   - "Origin checking failed - X does not match any trusted origins": Add the domain X to your CSRF_TRUSTED_ORIGINS list
   - "CSRF cookie not set": Ensure your browser accepts cookies and Django's session middleware is correctly configured
   - "Referer checking failed": Check that your browser sends proper referer headers

3. **For development environments:**
   - If testing with different ports or domains, make sure all are included in CSRF_TRUSTED_ORIGINS
   - When using Docker or containers, ensure the host's domain is properly passed to the container

4. **For production environments:**
   - Always use HTTPS in production for better security
   - Consider using wildcard subdomains if needed: `'https://*.example.com'`

5. **Last resort options:**
   - For specific views that don't require CSRF protection, you can use the `@csrf_exempt` decorator:
   ```python
   from django.views.decorators.csrf import csrf_exempt
   
   @csrf_exempt
   def my_view(request):
       # ...
   ```
   - Consider installing and configuring django-cors-headers for more complex cross-origin scenarios

Remember that proper CSRF protection is critical for security. Avoid disabling it globally.