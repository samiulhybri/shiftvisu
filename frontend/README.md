## Install the Node(18.x) (if not installed)
    Go to terminal and  run following commands.
    1. `sudo apt update`
    2. `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
    3. `sudo apt-get install -y nodejs`
    Then check `node -v` and  `npm -v`
## Install the Angular CLI (15.x) (if not installed)

    You have to install angular/cli by running  `npm install -g @angular/cli@15`
    Then check `ng --version`

## Go to the directory, where you want to store the code base.
    cd <path_to_directory>

## Clone codebase from git(if repository not cloned).

    git clone https://<user_name>@bitbucket.org/SCT/SCT/shopfloor-suite.git
    Note: Replace the <user_name> section with your bitbucket username
    git checkout development
    cd frontend

## Pull code (if repository already cloned)
    git checkout development
    git fetch
    git pull origin development
    cd frontend

## Set up configuration
    cp src/environments/environment.development.example.ts src/environments/environment.ts
    cp src/firebase-messaging-sw.example.js src/firebase-messaging-sw.js
    cp src/manifest.example.json src/manifest.json

Update src/environment/environment.ts as needed.

## Install dependencies 

    Run `npm install` or `npm install --legacy-peer-deps` to install all the dependencies for the project.

## Setting up Backend

    Change the default configuration for backend API URL in `/src/environments/environment.ts` or `/src/environments/environment.development.ts`

## Development server

    Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`

## Serve Config

    Run `ng serve` Default Development
    Run `ng serve --configuration=production` for Production
    Run `ng serve --configuration=development` for Development

## Build Config

    Run `ng build` Default Production
    Run `ng build --configuration=production` for Production
    Run `ng build --configuration=development` for Development

