<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\BaseVisu\PermissionEnum;
use Flat3\Lodata\Attributes\LodataFunction;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'custom_id',
        'userGroup',
        'is_melter',
        'chip_number',
        'username',
        'is_mp_offer_user',
        'is_mp_offer_admin',
        'mp_is_allowed_reoffer',
        'supervisor1_user_id',
        'supervisor2_user_id',
        'is_supervisor',
        'user_type',
        'is_absence_manager_admin',
        'ip_address',
        'shift_model_id',
        'hall_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * This function is only for version 10 castvisu permission sync
     * Get permissions by v10 CAST_VISU permissionID
     */
    public function getPermissionBasedOnCastVisuPermissionIDForV10($permissionID)
    {
        $permission = null;
        switch ($permissionID) {
            case 1:
                $permission = Permission::where('name', PermissionEnum::CASTVISU_POWER()->value)->first();
                break;
            case 2:
                $permission = Permission::where('name', PermissionEnum::CASTVISU_ADMIN()->value)->first();
                break;
            case 3:
                $permission = Permission::where('name', PermissionEnum::CASTVISU_SUPER()->value)->first();
                break;
            case 4:
                $permission = Permission::where('name', PermissionEnum::CASTVISU_VIEWER()->value)->first();
                break;
            default:
                break;
        }
        return $permission;
    }

    public function materialConsumptions()
    {
        $this->hasMany(MaterialConsumption::class);
    }

    public function fcmTokens()
    {
        return $this->hasMany(FcmToken::class);
    }

    public function chats(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Chat::class);
    }

    #[LodataRelationship]
    public function absenceRequests()
    {
        return $this->hasMany(AbsenceRequest::class);
    }

    #[LodataRelationship]
    public function supervisorOne()
    {
        return $this->belongsTo(User::class, 'supervisor1_user_id');
    }

    #[LodataRelationship]
    public function supervisorTwo()
    {
        return $this->belongsTo(User::class, 'supervisor2_user_id');
    }

    #[LodataRelationship]
    public function userGroup(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(UserGroup::class, 'user_user_groups');
    }

    #[LodataRelationship]
    public function machines(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Machine::class, 'machine_user_restrictions');
    }

    #[LodataRelationship]
    public function prodOrderProdOperationDeliveries(): HasMany
    {
        return $this->hasMany(ProdOrderPosOperationDelivery::class);
    }

    #[LodataRelationship]
    public function machineUserTime(): HasMany
    {
        return $this->hasMany(MachineUserTime::class);
    }

    #[LodataRelationship]
    public function qualification(): BelongsToMany
    {
        return $this->belongsToMany(Qualification::class, 'qualification_users');
    }

    #[LodataRelationship]
    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'area_user');
    }

    #[LodataRelationship]
    public function capacities(): MorphMany
    {
        return $this->morphMany(Capacity::class, 'capacitable');
    }

    #[LodataRelationship]
    public function shiftModel(): BelongsTo
    {
        return $this->belongsTo(ShiftModel::class);
    }
    
    #[LodataRelationship]
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'user_id_responsible');
    }
    
    #[LodataRelationship]
    public function userRoles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'model_has_roles', 'model_id', 'role_id')
                    ->where('model_type', self::class);
    }

    public function machineUserPlanTimes(): HasMany
    {
        return $this->hasMany(MachineUserPlanTime::class, 'user_id');
    }

    #[LodataRelationship]
    public function inspectionPoints(): HasMany
    {
        return $this->hasMany(InspectionPoint::class, 'user_id_creator');
    }
    
    #[LodataRelationship]
    public function hall(): BelongsTo
    {
        return $this->belongsTo(Hall::class);
    }
}
