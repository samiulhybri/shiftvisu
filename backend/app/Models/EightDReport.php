<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class EightDReport extends Model implements HasMedia
{

    use InteractsWithMedia {
        media as protected trait_media;
    }

    use HasFactory;

    #[LodataRelationship]
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    #[LodataRelationship()]
    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    #[LodataRelationship]
    public function team()
    {
        return $this->belongsToMany(User::class, 'eight_d_report_teams');
    }

    #[LodataRelationship()]
    public function actions()
    {
        return $this->hasMany(EightDReportAction::class);
    }

    #[LodataRelationship()]
    public function author()
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship()]
    public function fiveWhies()
    {
        return $this->hasMany(EightDReportFiveWhy::class);
    }

    #[LodataRelationship()]
    public function ishikawas()
    {
        return $this->hasMany(EightDReportIshikawa::class);
    }

    #[LodataRelationship()]
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('default');
        $this->addMediaCollection('signature');
    }
}
