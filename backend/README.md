## Install Composer
    check https://getcomposer.org/
## Go to the directory, where you want to store the code base.
    cd <path_to_directory>
## Clone codebase from git [command line or vcs client]
    git clone https://<user_name>@bitbucket.org/SCT/SCT/shopfloor-suite.git
    Note: Replace the <user_name> section with your bitbucket username
    
    git checkout development
## Create DB
    Using phpmyadmin http://127.0.0.1/phpmyadmin/
    Otherwise use command line or mysql client
    create a new DB
## Change configuration and save
    cd backend
    cp .env.example .env
    sudo nano .env
    Note: update necessary configurations (at least db connection) and save the file.
## For automatic deployments
    cd ..
    cp deploy.sh.example deploy.sh
    Note: update necessary configurations and save the file.
## Composer install inside the project
    composer install 
## Migrating DB
    php artisan migrate 
## Seeding DB
    php artisan db:seed
    php artisan migrate --seed (seeding along with migration)
    php artisan fake_mp:seed (seeding MP offers seeders)
    php artisan fake_melt:seed (seeding Melt Visu seeders)
## Run laravel app [Development]
    php artisan serve
## Run laravel app [Production]
See [the root README.md](../README.md)
## Add Extension GD in php.ini
    XAMPP -> Apache -> config -> php.ini
    remove comment from extension=gd, extension=sodium and extension=zip
    restart Apache
    
## Working on the chat component
- [Fcm Configuration](docs/fcm.md)
- A pusher service (e.g. `soketi`) [must be available](docs/pusher.md)
- A Laravel worker must be running in the background. Since this worker will be used by the messaging component, a lower than default value for `--sleep` is recommended
  (e.g. `php artisan queue:work --sleep=0.1`). This ensures that messages will be delivered with less of a delay than the default 3 seconds.
  During development start the worker using the `listen` command instead (`php artisan queue:listen --sleep=0.1`) so you don't have to restart it for code changes to have an effect.
- For convenience, the `dev-scripts/launch-messaging` script launches the necessary services to work on the messaging component.

## Cache clear 
- clean backend while deploying the project everytime 
    php artisan cache:clear 
## Seeder (Only run this command for hwe kal)
- php artisan db:seed --class=HweKalkRoleSeeder
