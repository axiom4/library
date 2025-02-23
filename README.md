# A full test application using Django and Angular

Create a container directory and install a Python3 Virtual Environment

```bash
mkdir TestApp
python3 -m venv venv
```

Create a **.gitignore** file to exclude the **venv** directory.

```bash
echo venv > .gitignore
```

On GitHub, create a **repository** named TestApp and initialize the app to push the code remotely.

```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/axiom4/TestApp.git
git push -u origin main
```
