# A Full Test Application Using Django and Angular (Part 14) - Django Roles

In this chapter, we will address a crucial aspect of any modern web application: API security. Protecting our APIs is essential to ensure that only authorized users can access and modify data.

To achieve this goal, we will use **Keycloak**, an open-source solution for Identity and Access Management (IAM). Keycloak provides robust authentication and authorization features, simplifying the implementation of standard security mechanisms such as OAuth 2.0 and OpenID Connect.

The integration of Keycloak will take place on two fronts:

1.  **Frontend (Angular):** We will configure our Angular application to interact with Keycloak. This will allow users to authenticate via Keycloak and enable the Angular application to obtain access tokens for making secure calls to the backend APIs. We will use the `keycloak-angular` library to facilitate this integration.
2.  **Backend (Django):** We will protect our Django APIs so that a valid access token issued by Keycloak is required for every request. Django will be configured to validate these tokens and extract user and role information, enabling fine-grained access control based on the roles defined in Keycloak.

In the following steps, we will see in detail how to configure Keycloak, integrate the Angular client, and secure Django views.

## Keycloak Installation

Let's create a new schema on our Mysql (see part 3). Go on your terminal and login on your MySQL.

```bash
# mysql -h 127.0.0.1 -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1289
Server version: 8.3.0 MySQL Community Server - GPL

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Add new user `keycloak` and select a password:

```sql
mysql> CREATE USER keycloak@'%' IDENTIFIED BY 'keycloak';
Query OK, 0 rows affected (0,14 sec)
```

Create a new schema `keycloak`:

```sql
mysql> CREATE DATABASE keycloak;
Query OK, 1 row affected (0,01 sec)
```

Add acl on new schema to user `keycloak`:

```sql
mysql> GRANT ALL PRIVILEGES ON keycloak.* TO keycloak@'%';
Query OK, 0 rows affected (0,02 sec)
```

Reload the privileges on database:

```sql
mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0,01 sec)
```

Now we install `keycloak`. To quickly set up a develpment environment of Keycloak using Docker, update our `docker-compose.yml` file with the following content:

```yaml
name: library
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

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak
    command: start-dev
    networks:
      - backend
    depends_on:
      - db
    env_file:
      - path: ./environments/keycloak.env
        required: true
    ports:
      - "8080:8080"
    restart: unless-stopped

volumes:
  db_data: {}

networks:
  backend:
    driver: bridge
```

Define new environment file `environments/keycloak.env` as follow:

```bash
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=keycloak
KC_DB=mysql
KC_DB_URL_HOST=mysql
KC_DB_URL_DATABASE=keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=keycloak
```

Deploy keycloak running:

```bash
# docker-compose up -d

[+] Running 5/5
 ✔ keycloak Pulled                                                             10.6s
   ✔ 830112cfee05 Pull complete                                                 1.8s
   ✔ f79851aee01e Pull complete                                                 6.1s
   ✔ d36e3fd02231 Pull complete                                                 7.0s
   ✔ cc67d5854a75 Pull complete                                                 7.1s
[+] Running 3/3
 ✔ Network library_default  Created                                             0.1s
 ✔ Container mysql          Running                                             0.0s
 ✔ Container keycloak       Started                                             0.9s
```

You can then access the Keycloak admin console at [http://127.0.0.1:8080](http://127.0.0.1:8080).

![Keycloak Login Page](/docs/images/part14_1.png)

## Configuring a new Keycloak Realm

A **realm** in Keycloak is an isolated space for managing users, roles, groups, and clients. Each realm is independent: users, roles, and configurations in one realm are not visible or accessible from another. This allows you to manage multiple applications or environments (such as development, testing, and production) within the same Keycloak instance, keeping data and configurations separate.

A realm is useful for:

- Separating users and permissions between different applications or environments.
- Centrally managing authentication and authorization for a specific group of applications.
- Applying security policies and configurations tailored to each context.

### Creating a New Realm: `library-realm`

To organize users, roles, and clients for your application, you need to create a new realm in Keycloak. Follow these steps:

1. **Log in to the Keycloak Admin Console**  
   Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in your browser and log in using the admin credentials you set in the environment file (`KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD`).

2. **Create the Realm**

- In the left sidebar, click on `Manage realms` at the top.
- Click `Create realm` button.
- Enter `library-realm` as the **Realm Name**.
- Optionally, add a description.
- Click **Create**.

![New Keycloak Realm](/docs/images/part14_2.png)

Your new realm `library-realm` is now ready. You can now proceed to configure clients, roles, and users within this realm for your Django and Angular applications.
