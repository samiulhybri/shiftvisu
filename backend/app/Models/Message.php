<?php

namespace App\Models;

use App\Enums\ChatAction;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Message extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia {
        media as protected trait_media;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'chat_action' => ChatAction::class . ':nullable',
    ];

    protected $with = ['readBy:id', "media"];

    protected $appends = ['read_by_user'];

    #[LodataRelationship]
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }

    public function readBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_read')
            ->as('message_read_status')
            ->withPivot('read');
    }

    /// Returns whether this message was read by the currently authenticated user
    /// or null if the current user was not part of this chat when the message was sent.
    public function readByUser(): Attribute
    {
        return Attribute::make(
            get: function () {
                $readStatus = $this->readBy->firstWhere("id", auth()->id())?->message_read_status;

                return $readStatus ? $readStatus->read : null;
            }
        );
    }
}
