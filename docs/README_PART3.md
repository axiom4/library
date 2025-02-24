# A full test application using Django and Angular (Part 3)

Now we will start creating the middleware on which our application will run. We will use Docker Desktop as a base to create a MySQL container.

If you have never installed Docker, you can follow the instructions on the following page: [https://docs.docker.com/desktop/](https://docs.docker.com/desktop/).

Let's create a file containing the environment variables for our MySQL.

```bash
mkdir environments
vi environments/mysql.env
```

The content of the **mysql.env** file will be as follows:

```
MYSQL_ROOT_HOST=%
MYSQL_ROOT_PASSWORD=testpassword
MYSQL_DATABASE=testapp_db
MYSQL_USER=testapp_user
MYSQL_PASSWORD=testapp_password
```

Finally, let's create a **docker-compose.yaml** file where we will currently only insert the definitions to create the container to manage the MySQL database.

The content of the file will be as follows:

```docker
version: "3.1"
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
