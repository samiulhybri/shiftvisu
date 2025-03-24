<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Language;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //

        $languages = [
            [
                'code' => 'en',
                'name' => 'English',
                'custom_id' => 'en-GB'
            ],
            [
                'code' => 'de',
                'name' => 'Deutsch',
                'custom_id' => 'de-DE'
            ],
            [
                'code' => 'it',
                'name' => 'Italiano',
                'custom_id' => 'it-IT'
            ],
            [
                'code' => 'tr',
                'name' => 'Türkçe',
                'custom_id' => 'tr-TR'
            ],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(
                [
                    'custom_id' => $language['custom_id']
                ], 
                [
                    'name' => $language['name'],
                    'code' => $language['code']
                ]
            );
        }
    }
}
