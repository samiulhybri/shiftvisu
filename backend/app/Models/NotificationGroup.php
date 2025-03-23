<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NotificationGroup extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function notificationGroupUsers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationGroupUser::class);
    }

    #[LodataRelationship]
    public function notificationGroupEmailAddresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationGroupEmailAddress::class);
    }

    #[LodataRelationship]    
    public function notificationGroupNotificationTypes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationGroupNotificationType::class);
    }

    #[LodataRelationship]
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_group_users');
    }
}
