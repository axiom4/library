# A full test application using Django and Angular (Part 7) - Generate Angular Modules

To create a new Angular module named "Library", you can use the following command:

````bash
ng generate module modules/Library --routing

CREATE src/app/modules/library/library-routing.module.ts (250 bytes)
CREATE src/app/modules/library/library.module.ts (284 bytes)```
````

This command generates a new Angular module named "Library" inside the `src/app/modules` directory. The `--routing` flag tells the Angular CLI to also generate a routing module for the new module. This is useful for creating feature modules with their own dedicated routes.
