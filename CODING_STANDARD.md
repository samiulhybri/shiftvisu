# Coding Standards Schertech

```
                                                     *                          
                                           /%%%%%%%%%%.                         
                                  #%%%%%%%%%%%%%%%%%%%%                         
                         #%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%                        
               ##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%                        
       ,%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%                       
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%/                      
  #%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%                      
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%                     
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%(                    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%                    
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*                       
 /%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*,                                
  .%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*                                          
     %%%%%%%%%%%%%%%%%%%%%%%/                               .***********.       
         /%%%%%%%%(/                               .************************    
                                         .,***********************************  
                                .********************************************** 
                       .********************************************************
                    ************************************************************
                     ***********************************************************
                      ********************************************************* 
                      ,*******************************************************  
                       *****************************************************    
                        ************************************************,       
                        ,***************************************                
                         ******************************                         
                          ********************                                  
                          **********   
                           *
```

## Backend
1. Add a new table to the database 
    - New model and new migration have to be created using
    - ` php artisan make:model AsOffer -m `
    - This will create 1 migration script and 1 Model file
    - Output:
        - Model
            ```
            namespace App\Models; 
            use Illuminate\Database\Eloquent\Factories\HasFactory; 
            use Illuminate\Database\Eloquent\Model; 
            class AsOffer extends Model
            {
                use HasFactory;
            }
            ```
        - Migration
            ```            
            return new class extends Migration
            {
                public function up()
                {
                    Schema::create('as_offers', function (Blueprint $table) {
                        $table->id();
                        $table->timestamps();
                    });
                }
                public function down()
                {
                    Schema::dropIfExists('as_offers');
                }
            };
            ```
        - Notes: The name of the model always has to be singular, the table will be automatically called plural
2. 
## Frontend
1. Create Project<br />
    1.1. Project name should be in kebab case<br />

    1.2. Create Project inside following structure<br />
       
        src
            -> app
                -> modules
                    .....
        
    1.2. Create module - ng g module modules/demo-machine

    1.3. Create component - ng g c modules/demo-machine

    1.4. Copy routing module - modules/demo-machine-routing.module.ts

    1.5. Integrate into app.routing.module.ts

    1.6. Integrate route into modules/demo-machine.module.ts

    1.7. Generate model class - ng g class shared/models/machine - Class has to always implement Deserializable
    
2. All Models Should be in<br />

    src
        -> app
            -> shared
                ->models
    
    ` ng g class --skip-tests=true shared/models/Customer `

3. All Interfaces Should be in<br />

    src
        -> app
            -> shared
                -> interfaces

    ` ng g class --skip-tests=true shared/interfaces/Deserializable `

4. All ENUMS Should be in<br />

    src
        -> app
            -> shared
                -> enums
    
    ` ng g e shared/enums/MpOffers `

5.  Use Path Aliases<br />

    As the size and complexity of your app grow, the app hierarchy might have a deep hierarchy. While this is good for organizing things, it presents a challenge for import statements as they become quite long and confusing. Using path alliances to reference these deeply nested files keeps the import statements clean and readable.

    Avoid this

    ` import { CardType } from './././enums/card-type.enum'; `

    Try this instead

    ` import { CardType } from 'src/app/shared/enums/card-type.enum'; `
