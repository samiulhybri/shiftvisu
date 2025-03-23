<?php

namespace App\Models;

use App\Enums\ShopfloorModule;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Chat extends Model
{
    use HasFactory;

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'associated_module' => ShopfloorModule::class . ':nullable',
    ];

    protected $hidden = ['pivot'];

    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['users:id,name,email'];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['unread_messages_count', 'latest_message'];

    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    #[LodataRelationship]
    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Message::class);
    }

    protected function latestMessage(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->messages()->latest()->first(),
        );
    }

    protected function unreadMessagesCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this
                ->messages()
                ->whereHas(
                    'readBy',
                    fn (Builder $query) => $query->where('user_id', Auth::id())->where('read', false)
                )->count(),
        );
    }
}
