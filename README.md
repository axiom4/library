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
