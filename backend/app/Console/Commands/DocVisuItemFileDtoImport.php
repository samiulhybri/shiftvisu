<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class DocVisuItemFileDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:docvisuitemfile {custom_id?}';

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
        $onlyCustomId = $this->argument('custom_id');
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        while ($drawingChunk = $ds->docVisuItemFileDtos($skip, $take, $onlyCustomId)) {
            $skip += $take;

            $allDrawings = [];
            foreach ($drawingChunk as $drawingDto) {
                
                $parts = explode('_', $drawingDto->drawing_code);
                $drawingCode = $parts[0];
                $searchFileExt = $drawingDto->file_extension;

                # Relative path from the storage root
                $directory = $this->getDocVisuFileImportFolder();
                $files = Storage::files($directory);

                # Filter files that start with the $drawingCode and end with the $fileExtension
                $matchingFiles = array_filter($files, function ($file) use ($drawingCode, $searchFileExt) {
                    $fileBaseName = basename($file);

                    $extensionMatch = str_ends_with($fileBaseName, $searchFileExt);
                    $isExactMatch = $fileBaseName === $drawingCode;
                    $startsWithUnderscore = str_starts_with($fileBaseName, $drawingCode . '_');

                    return $extensionMatch && ($isExactMatch || $startsWithUnderscore);
                });

                # Reindex the array to start from 0
                $matchingFiles = array_values($matchingFiles);
                $matchingFiles = $this->getSortedFiles($matchingFiles);

                $fileDetails = array_map(function ($file) {
                    # Get the file name (basename)
                    $fileName = basename($file);
                
                    # Get the file URL
                    $fileUrl = Storage::disk('local')->path($file); //Storage::url($file);
                
                    # Get the file size
                    $fileSizeInBytes = Storage::size($file);

                    # Convert file size to KB
                    $fileSizeInKB = round($fileSizeInBytes / 1024, 2); // rounding to 2 decimal places
                
                    # Get the file extension
                    $fileExtension = pathinfo($file, PATHINFO_EXTENSION);
                
                    # Return the detailed info as an array
                    return [
                        'name' => $fileName,
                        'link' => $fileUrl,
                        'size' => $fileSizeInKB,
                        'extension' => $fileExtension,
                    ];
                }, $matchingFiles);

                if(count($fileDetails) > 0) {
                    # Prepare the final result in the desired format
                    $selectedFile = $fileDetails[count($fileDetails) - 1]; // The last file is the main document
                    $response = [
                        'item' => $drawingDto->item_id_custom,
                        'document' => [
                            'name' => $selectedFile['name'],
                            'link' => $selectedFile['link'],
                            'file_size' => $selectedFile['size'],
                            'ext' => $selectedFile['extension']
                        ],
                        'versions' => [],
                    ];

                    # Add the rest of the files to the versions array, if any
                    foreach (array_slice($fileDetails, 0, count($fileDetails) - 1) as $index => $file) {
                        $response['versions'][] = [
                            'version' => $index + 1, // Version starts from 1 for subsequent files
                            'link' => $file['link'],
                            'name' => $file['name']
                        ];
                    }
                }

                $allDrawings[] = $response;
            }
            $apiRes = Http::withoutVerifying()->post(env('V10_DOCVISU_FILE_IMPORT_POST_API'), $allDrawings);
        }
        return 0;
    }

    private function getDocVisuFileImportFolder(): string
    {
        $pathToImport = env('DOCVISU_FILE_IMPORT_DIRECTORY', '');
        if (!str_ends_with($pathToImport, '/')) {
            $pathToImport .= '/';
        }
        return $pathToImport;
    }

    private function getSortedFiles(array $files): array
    {
        usort($files, function ($a, $b) {
            $getSuffix = function ($file) {
                $filename = basename($file, '.pdf');
                $parts = explode('_', $filename);
                return $parts[1] ?? '';
            };
        
            return strcasecmp($getSuffix($a), $getSuffix($b));
        });
        return $files;
    }
}
