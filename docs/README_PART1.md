# A full test application using Django and Angular (Part 1) - Django Project

Create a container directory and install a Python3 Virtual Environment

```bash
mkdir TestApp
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

Requirement already satisfied: pip in ./venv/lib/python3.13/site-packages (24.3.1)
Collecting pip
  Using cached pip-25.0.1-py3-none-any.whl.metadata (3.7 kB)
Using cached pip-25.0.1-py3-none-any.whl (1.8 MB)
Installing collected packages: pip
  Attempting uninstall: pip
    Found existing installation: pip 24.3.1
    Uninstalling pip-24.3.1:
      Successfully uninstalled pip-24.3.1
Successfully installed pip-25.0.1
```

Create a **.gitignore** file to exclude the **venv** directory.

```bash
echo venv > .gitignore
echo "__pycahce__" >> .gitignore
echo "*.pyc" >> .gitignore
echo "db.sqlite3" >> .gitignore
echo "dump_all.json" >> .gitignore
```

On GitHub, create a **repository** named TestApp and initialize the app to push the code remotely.

```bash
git init

Initialized empty Git repository in /Users/rgiannetto/Developer/TestApp/.git/
```

```bash
git add .
```

```bash
git commit -m "first commit"

[main (root-commit) 419631f] first commit
 2 files changed, 26 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
```

```bash
git branch -M main
git remote add origin https://github.com/axiom4/TestApp.git
```

```bash
git push -u origin main

Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 10 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (4/4), 576 bytes | 576.00 KiB/s, done.
Total 4 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/axiom4/TestApp.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

Install Django python modules

```bash
pip install django django-environ

Collecting django
  Using cached Django-5.1.6-py3-none-any.whl.metadata (4.2 kB)
Collecting django-environ
  Using cached django_environ-0.12.0-py2.py3-none-any.whl.metadata (12 kB)
Collecting asgiref<4,>=3.8.1 (from django)
  Using cached asgiref-3.8.1-py3-none-any.whl.metadata (9.3 kB)
Collecting sqlparse>=0.3.1 (from django)
  Using cached sqlparse-0.5.3-py3-none-any.whl.metadata (3.9 kB)
Using cached Django-5.1.6-py3-none-any.whl (8.3 MB)
Using cached django_environ-0.12.0-py2.py3-none-any.whl (19 kB)
Using cached asgiref-3.8.1-py3-none-any.whl (23 kB)
Using cached sqlparse-0.5.3-py3-none-any.whl (44 kB)
Installing collected packages: sqlparse, django-environ, asgiref, django
Successfully installed asgiref-3.8.1 django-5.1.6 django-environ-0.12.0 sqlparse-0.5.3

[notice] A new release of pip is available: 24.3.1 -> 25.0.1
[notice] To update, run: pip install --upgrade pip
```

In my installation, it is recommended to also update the pypi package.

```bash
pip install --upgrade pip

Requirement already satisfied: pip in ./venv/lib/python3.13/site-packages (24.3.1)
Collecting pip
  Using cached pip-25.0.1-py3-none-any.whl.metadata (3.7 kB)
Using cached pip-25.0.1-py3-none-any.whl (1.8 MB)
Installing collected packages: pip
  Attempting uninstall: pip
    Found existing installation: pip 24.3.1
    Uninstalling pip-24.3.1:
      Successfully uninstalled pip-24.3.1
Successfully installed pip-25.0.1
```

Generate **requirements.txt**

```bash
pip freeze > requirements.txt
```

Init Django Project

```bash
django-admin startproject testapp_rest
cd testapp_rest
```

Init Django Database

```bash
./manage.py migrate

Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying auth.0012_alter_user_first_name_max_length... OK
  Applying sessions.0001_initial... OK
```

Create Django superuser

```bash
./manage.py createsuperuser --username admin --email admin@example.com
Password:
Password (again):
Superuser created successfully.
```

Open **testapp_rest/testapp_rest/settings.py** and update configuration parameters.

First, let's import the environment file **"environments/mysql.env"** that is already shared with the container.

After line:

> \# Build paths inside the project like this: BASE_DIR / 'subdir'.
> BASE_DIR = Path(**file**).resolve().parent.parent

Add this:

```python
import environ
import os

env = environ.Env()
env.read_env(os.path.join(BASE_DIR, '../environments/django.env'))
```

So update SECRET_KEY, DEBUG and ALLOWED_HOSTS line:

```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
```

and create **environments/django.env** file:

```python
SECRET_KEY='(#6%1j67g+9&$2s(rje#)1@$%zsjjwz6*ba74y#&&c+8an+p4a'
DEBUG=True
ALLOWED_HOSTS=[]
```

The `SECRET_KEY` can be easily generated using the following website: [https://djecrety.ir](https://djecrety.ir)

Start the Django development server

```bash
./manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
February 23, 2025 - 19:46:00
Django version 5.1.6, using settings 'testapp_rest.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

Open the browser and navigate to the following URL: http://localhost:8000

![./manage.py runserver](/docs/images/part1_1.png)
