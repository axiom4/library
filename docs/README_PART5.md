# A full test application using Django and Angular (Part 5) - OpenAPI integration

Now, let's configure OpenAPI schema to integrate apps.

First, install the necessary packages:

```bash
pip install PyYAML uritemplate inflection markdown

Collecting PyYAML
  Using cached PyYAML-6.0.2-cp313-cp313-macosx_11_0_arm64.whl.metadata (2.1 kB)
Collecting uritemplate
  Using cached uritemplate-4.1.1-py2.py3-none-any.whl.metadata (2.9 kB)
Collecting inflection
  Using cached inflection-0.5.1-py2.py3-none-any.whl.metadata (1.7 kB)
Collecting markdown
  Using cached Markdown-3.7-py3-none-any.whl.metadata (7.0 kB)
Using cached PyYAML-6.0.2-cp313-cp313-macosx_11_0_arm64.whl (171 kB)
Using cached uritemplate-4.1.1-py2.py3-none-any.whl (10 kB)
Using cached inflection-0.5.1-py2.py3-none-any.whl (9.5 kB)
Using cached Markdown-3.7-py3-none-any.whl (106 kB)
Installing collected packages: uritemplate, PyYAML, markdown, inflection
Successfully installed PyYAML-6.0.2 inflection-0.5.1 markdown-3.7 uritemplate-4.1.1
```
