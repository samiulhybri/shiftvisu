<?php

namespace App\ExportStrategies;

use App\Contracts\ExportStrategy;
use App\Models\DataExport;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;
use Storage;

class BohExportStrategy extends ExportStrategy
{
    public function exportCastingData(DataExport $dataExport): ExportResult
    {
        $jsondata = json_decode($dataExport->data);
        $masch_code = 'TEST';
        foreach ($jsondata->masch_details as $maschinedata) {
            $masch_code = $this->removeSpacesAndLinebreaks($maschinedata->maschinenr);
        }
        //This is here temporary so that only selected machines are exported
        // if ($masch_code === 'GM40' || $masch_code === 'GM22' || $masch_code === 'GM39') {
            
        // }
        $formattedDate = Carbon::createFromFormat('Y-m-d H:i:s', $jsondata->time)->format('YmdHi');
        $seconds = Carbon::createFromFormat('Y-m-d H:i:s', $jsondata->time)->format('s');
        //Setting up Filename as BOHAI wished for it in that way
        $csvFileName = $masch_code . '_' . $formattedDate . '.csv';
        $exportPath = $this->getExportPath($csvFileName);
        $fullExportPath = storage_path($exportPath);
        //CSV File not present so add Headers to CSV
        $fp = fopen($fullExportPath, 'w');
        if (!Storage::disk('local')->exists($exportPath)) {
            $csvHeader = array('Time', 'Sekunde', 'Anlage');
            fputcsv($fp, $csvHeader);
        }
        //Columns like in the Header above Time,Seconds,Machinecode
        $dataSender = array($jsondata->time, $seconds, 1);
        //Adding the Data to CSV this way with fwrite instead of fputcsv was chosen as otherwise the date would be inside "" and that was not in customers csv file
        //Customer wanted: 2018-04-29 19:26:19,19,4 fputcsv would produce: "2018-04-29 19:26:19",19,4
        fwrite($fp, implode(',', $dataSender) . "\n");
        fclose($fp);
        return ExportResult::SUCCESS();
    }

    private function removeSpacesAndLinebreaks(string $value): string
    {
        return str_replace(' ', '', str($value)->squish());
    }

    private function getExportPath(string $value): string
    {
        $pathToExport = $value;
        if (env('EXPORT_DIRECTORY') !== null && env('EXPORT_DIRECTORY') !== '') {
            $pathToExport = env('EXPORT_DIRECTORY');
            if (!str_ends_with($pathToExport, '/')) {
                $pathToExport .= '/';
            }
            $pathToExport .= $value;
        }
        return $pathToExport;
    }
}
