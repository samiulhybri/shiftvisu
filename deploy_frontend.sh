set -e  # Exit immediately if a command fails
set -u  # Print an error message if a variable is unset

cd frontend-sap

cf login -a "$MES_ORG_API" -u "$MES_USERNAME" -p "$MES_PASSWORD" && cf target -o "$MES_ORG_NAME" -s "$MES_SPACE"

cp src/app/environments/environment.template.ts src/app/environments/environment.ts
cp src/manifest.template.webmanifest src/manifest.webmanifest

# Explanation of syntax:
# ${VAR//PATTERN/REPLACEMENT} replaces all occurrences of PATTERN with REPLACEMENT in the value of VAR
# PATTERN in our case is /, replacement is \\/

FRONTEND_TITLE=${FRONTEND_TITLE////\\/}
API_URL=${API_URL////\\/}
ODATA_API_PREFIX=${ODATA_API_PREFIX////\\/}
REST_API_PREFIX=${REST_API_PREFIX////\\/}
SOKETI_HOST=${SOKETI_HOST////\\/}
SOKETI_PORT=${SOKETI_PORT////\\/}
SOKETI_PATH=${SOKETI_PATH////\\/}
SOKETI_APP_KEY=${SOKETI_APP_KEY////\\/}

sed -i "s/TITLE/$FRONTEND_TITLE/
s/API_URL/$API_URL/
s/ODATA_API_PREFIX/$ODATA_API_PREFIX/
s/REST_API_PREFIX/$REST_API_PREFIX/
s/SOKETI_HOST/$SOKETI_HOST/
s/\"SOKETI_PORT\"/$SOKETI_PORT/
s/SOKETI_PATH/$SOKETI_PATH/
s/SOKETI_APP_KEY/$SOKETI_APP_KEY/" src/app/environments/environment.ts

sed -i "s/TITLE/$FRONTEND_TITLE/" src/manifest.webmanifest

cp src/assets/configs/config.development.example.json src/assets/configs/config.json

echo "//npm.bryntum.com/:_authToken=$BRYNTUM_AUTH_TOKEN" > ~/.npmrc

npm i
node --max_old_space_size=5048 ./node_modules/@angular/cli/bin/ng build --localize

cp ./buildpack.yml ./dist/buildpack.yml
cp ./mime.types ./dist/mime.types
cp ./nginx.conf ./dist/nginx.conf
cp ./manifest.yml ./dist/manifest.yml

cd dist

cf push --var app_name="$FRONTEND_APP_NAME"
