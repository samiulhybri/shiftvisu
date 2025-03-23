<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
class HweQsCertificatePdfDelete extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:hwe-qs-certificate-pdf-delete';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $files = Storage::disk('public')->files("hwe-qs/certificate/");

       foreach ($files as $file) {

           Storage::disk('public')->delete($file);
       }

        return 0;

    }
}
