set -e  # Exit immediately if a command fails
set -u  # Print an error message if a variable is unset

cd backend
cf login -a "$MES_ORG_API" -u "$MES_USERNAME" -p "$MES_PASSWORD" && cf target -o "$MES_ORG_NAME" -s "$MES_SPACE"
cf push --var app_name="$BACKEND_APP_NAME"


# Run the migrations here. If there is a failure, we'll get a non-zero exit code and the deployment will fail.
# shellcheck disable=SC2016 # $HOME should not be expanded here
cf ssh "$BACKEND_APP_NAME" -c 'HOME=$HOME/app source app/.profile.d/finalize_bp_env_vars.sh && cd app && php artisan migrate'