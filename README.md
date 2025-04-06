# Installation

- Clone the repository
- In the repository, execute the following commands:

```bash
sudo apt install -y composer git python3 gcc build-essential
cd backend
cp .env.example .env
php artisan key:generate
```

- Now, edit `.env` and set `DB_USERNAME` and `DB_PASSWORD`. Also set `APP_ENV=production` and `APP_DEBUG=false`.
Set `APP_TIME_ZONE` to the time zone of the production plant

Set `SOKETI_DEFAULT_APP_SECRET` to an arbitrary random value (consider using `php artisan key:generate --show` to generate a key).

```bash
composer install --optimize-autoloader --no-dev
php artisan migrate --seed  # Confirm the creation of a new database
sudo chgrp -R www-data storage/
sudo npm install -g @soketi/soketi
#Keep in mind that when starting pm2 start soketi-pm2 -- start you have to be in the backend folder!
pm2 start soketi-pm2 -- start
php artisan queue:work 
#for production:
nohup php artisan queue:work --daemon >> storage/logs/laravel.log &
#add to /etc/crontab:
* *     * * *   www-data        cd /var/www/html/shopfloor-suite/backend && php artisan schedule:run >> /dev/null 2>&1
```
Laravel job in Production system can also be realised with the package supervisord:
```bash
sudo apt install supervisor
sudo nano /etc/supervisor/conf.d/laravel.conf
```
add following code (this is an example config can be changed as you wish, for example command the path is probably different depending on the server)
```plaintext
[program:laravel-worker]
command=php8.2 /var/www/html/shopfloor-suite/backend/artisan queue:work --queue=default,notification --tries=3 --verbose --timeout=30 --sleep=3
numprocs=4
process_name=%(program_name)s_%(process_num)02d
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/worker.log
```
After config file is created run these commands:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
#This is for checking the Status:
sudo supervisorctl status laravel-worker:*
#Would be the command for restarting
sudo supervisorctl restart laravel-worker:*
```


For the frontend:

```bash
cd ../frontend
npm install
sudo npm install -g @angular/cli
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/firebase-messaging-sw.example.js src/firebase-messaging-sw.js
cp src/manifest.example.json src/manifest.json
```
Now, edit the configuration in `src/environments/environment.ts`.
- Set `soketiHost` to the server address (WITHOUT `http(s)://`)

There are comments in that file that indicate what configuration needs to
be duplicated in `src/firebase-messaging-sw.js` and `src/manifest.json`.
See [fcm.md](backend/docs/fcm.md) for how to get a firebase configuration.

```bash
ng build --base-href /v11/ --localize --configuration=production
```

- Add the following to the `http {}` block in `/etc/nginx/nginx.conf` (modify the list of languages according to requirements):
```plaintext
        # Browser preferred language detection (does NOT require
        # AcceptLanguageModule)
        map $http_accept_language $accept_language {
            # Modify the languages below if necessary:
            ~*^de de;
            ~*^it it;
            ~*^en en;
        }
```
See the [angular docs](https://angular.io/guide/i18n-common-deploy) for context.

- Add the following to the `server{}` block in `/etc/nginx/sites-available/default`:

```plaintext
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
    }

    location /odata/ {
        proxy_pass http://127.0.0.1:8080/odata/;
    }

    location ^~/v11/ {
        proxy_pass http://127.0.0.1:8081/;
        proxy_pass_header Content-Type;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
    
    location ^~/v12/ {
        proxy_pass http://127.0.0.1:8082/;
        proxy_pass_header Content-Type;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }

    location /websockets/ {
        proxy_pass             http://127.0.0.1:6001/;
        proxy_read_timeout     60;
        proxy_connect_timeout  60;
        proxy_redirect         off;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

- Create the file `/etc/nginx/sites-available/v11-backend`

```plaintext
server {

    listen 8080;
    listen [::]:8080;

    server_name _;

    root /var/www/html/shopfloor-suite/backend/public/;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    error_page 404 /index.php;

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

- Create the file `/etc/nginx/sites-available/v11-frontend`
  - Update the fallback language (update `set $accept_language "en";`) if needed
  - Update the list of available languages (update `location ~ ^/(de|en|it) {`) if needed
```plaintext
server {
    listen 8081;
    server_name 127.0.0.1;

    root /var/www/html/shopfloor-suite/frontend/dist/shopfloorsuite_frontend;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.html;
    charset utf-8;

    # Fallback to default language if no preference defined by browser
    if ($accept_language ~ "^$") {
        set $accept_language "en";
    }

    # Redirect "/" to Angular application in the preferred language of the browser
    rewrite ^/$ /$accept_language permanent;

    # Everything under the Angular application is always redirected to Angular in the
    # correct language
    location ~ ^/(de|en|it) {
        try_files $uri /$1/index.html?$args;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    error_page 404 /index.php;

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
- Getting v12 ready:
```bash
#go to folder frontend-sap
cd ../frontend-sap/
#installing packages:
npm i
#copy env file for production and after that change the config so that apURL etc are set how it is needed:
cp src/app/environments/environment.development.example.ts src/app/environments/environment.ts
nano src/app/environments/environment.ts
#Important V12 is now localized
ng build --base-href /v12/ --localize --configuration=production
```
- Create the file `/etc/nginx/sites-available/v12-frontend`
```plaintext
server {
    listen 8082;
    server_name 127.0.0.1;

    root /var/www/html/shopfloor-suite/frontend-sap/dist/shopfloor-v12/;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.html;
    charset utf-8;

    # Fallback to default language if no preference defined by browser
    if ($accept_language ~ "^$") {
        set $accept_language "en";
    }

    # Redirect "/" to Angular application in the preferred language of the browser
    rewrite ^/$ /$accept_language permanent;

    # Everything under the Angular application is always redirected to Angular in the
    # correct language
    location ~ ^/(de|en|it) {
        try_files $uri /$1/index.html?$args;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    error_page 404 /index.php;

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```


- Link the previously created files:
```bash
sudo ln -s /etc/nginx/sites-available/v11-backend /etc/nginx/sites-enabled/v11-backend
sudo ln -s /etc/nginx/sites-available/v11-frontend /etc/nginx/sites-enabled/v11-frontend
sudo ln -s /etc/nginx/sites-available/v12-frontend /etc/nginx/sites-enabled/v12-frontend
```