# A full test application using Django and Angular (Part 3)

Now we will start creating the middleware on which our application will run. We will use Docker Desktop as a base to create a MySQL container.

If you have never installed Docker, you can follow the instructions on the following page: [https://docs.docker.com/desktop/](https://docs.docker.com/desktop/).

Let's create a file containing the environment variables for our MySQL.

```bash
mkdir environments
vi environments/mysql.env
```

The content of the **mysql.env** file will be as follows:

```bash
MYSQL_ROOT_HOST=%
MYSQL_ROOT_PASSWORD=testpassword
MYSQL_DATABASE=testapp_db
MYSQL_USER=testapp_user
MYSQL_PASSWORD=testapp_password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
```

Finally, let's create a **docker-compose.yaml** file where we will currently only insert the definitions to create the container to manage the MySQL database.

The content of the file will be as follows:

```yaml
name: testapp
services:
  db:
    image: mysql
    container_name: mysql

    restart: always
    env_file:
      - path: ./environments/mysql.env
        required: true
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - backend

volumes:
  db_data: {}

networks:
  backend:
    driver: bridge
```

The docker file is composed of the following sections:

```yaml
# Application Name
name: testapp

# Services deployed
services:
---
# Volumes
volumes:
---
# Network Layers
networks:
```

The MySQL database is described as follows:

```yaml
db:
  # container image to use
  image: mysql
  # container name
  container_name: mysql

  # action to run on failure
  restart: always

  # file with environment variables used for the db deployment
  env_file:
    - path: ./environments/mysql.env
      required: true

  # port to expose on the local system
  ports:
    - "3306:3306"

  # name of the volume and mount point to use for persistent data storage
  volumes:
    - db_data:/var/lib/mysql

  # network layer to use to launch the service, necessary for service segregation
  networks:
    - backend
```

Adesso lanceremo il comando per creare il nostro container MySQL:

```bash
docker-compose up -d
```

![./manage.py runserver](/docs/images/part3_1.png)

Further information can be found in the Docker documentation [https://docs.docker.com](https://docs.docker.com).

## Configure Django to use MySQL

Now, we will change the configuration to allow our Django application to use the newly installed MySQL container.

Install mysqlclient python module:

```bash
pip install mysqlclient

Collecting mysqlclient
  Using cached mysqlclient-2.2.7-cp313-cp313-macosx_15_0_arm64.whl
Installing collected packages: mysqlclient
Successfully installed mysqlclient-2.2.7
```

Dump sqlite3 database contents:

```bash
./manage.py dumpdata > dump_all.json
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

mysql_env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '../environments/mysql.env'))
```

Find the DATABASE section (you can comment the code using #)

```python
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': BASE_DIR / 'db.sqlite3',
  }
}
```

and replace with the following:

```python
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.mysql',
    'NAME': mysql_env('MYSQL_DATABASE'),
    'USER': mysql_env('MYSQL_USER'),
    'PASSWORD': mysql_env('MYSQL_PASSWORD'),
    'HOST': mysql_env('MYSQL_HOST', default='localhost'),
    'PORT': mysql_env('MYSQL_PORT', default='3306'),
  }
}
```

Now we'll create Django Schema on MySQL

```bash
./manage.py migrate --run-syncdb
```

and run django shell with command:

```bash
python manage.py shell
```

and run:

```python
from django.contrib.contenttypes.models import ContentType
ContentType.objects.all().delete()
quit()
```

Finally, import the **dump_all.json** file:

```bash
python manage.py loaddata dump_all.json

Installed 31 object(s) from 1 fixture(s)
```

This procedure can be used whenever it is necessary to export and re-import the database.

Now you can run python server

```bash
./manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
February 24, 2025 - 15:14:31
Django version 5.1.6, using settings 'testapp_rest.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```
