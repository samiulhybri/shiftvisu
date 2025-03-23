1. Create new Deployment in Bitbucket and set
   - BACKEND_APP_NAME - xxx-api
   - FRONTEND_TITLE - Shopfloor Suite
   - ODATA_API_PREFIX - odata
   - API_URL - ' ' - https://fna-quality-api-chipper-parrot-og.cfapps.us10-001.hana.ondemand.com/odata (retrieve from BTP after first deployment)
   - MES_ORG_API - https://api.cf.us10-001.hana.ondemand.com (retrieve from BTP)
   - MES_ORG_NAME - crab-mes-dev (retrieve from BTP)
   - MES_SPACE - dev (retrieve from BTP)
   - REST_API_PREFIX - ' ' - https://fna-quality-api-chipper-parrot-og.cfapps.us10-001.hana.ondemand.com/api (retrieve from BTP after first deployment)
   - SOKETI_HOST - localhost
   - SOKETI_PORT - 6001
   - SOKETI_PATH - ' '
   - SOKETI_APP_KEY - ' '
   - FRONTEND_APP_NAME - xxx-v12
   - MES_USERNAME - aholzer@schertech.com (cf cli user)
   - MES_PASSWORD - (cf cli password)
2. Add deployment to bitbucket-pipelines.yml
3. In BTP create the following Services
   - Connectivity Service
   - Destination Service
   - Job Scheduling Service
   - Object Store
   - Postgres
4. Bind all the services to the backend application
5. Trigger Pipeline that pushes back and frontend
6. The pipeline will fail because some additional parameters need to be set upon first push
   - In the bitbucket deployment now you can set API_URL and REST_API_PREFIX
   - You need to enable ssh for the backend
     - Login using the cf cli to the btp
     - `cf ssh-enable XXX-api`
7. Re-Run the pipeline
8. ssh into the backend and run the following commands
   - `HOME=$HOME/app source app/.profile.d/finalize_bp_env_vars.sh `
   - `cd app/`
   - `php artisan db:seed --class=SuperAdminUserSeeder`
9. Login to the frontend using `admin` and `1234`
10. Manually create appropriate Plants in BaseVisu under Logistics
11. Manually create languages in BaseVisu
12. Setup Task with Schedule to run the laravel worker
13. 