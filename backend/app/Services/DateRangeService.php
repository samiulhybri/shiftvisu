<?php

namespace App\Services;

use App\Enums\ReportRangeGeneratorType;
use Carbon\Carbon;
use DateTime;
use DateTimeImmutable;

class DateRangeService
{
    public function generateDateRanges(string $date_filter, ReportRangeGeneratorType $dateRangeType, int $count = 12): array
    {
        $dates = [];
        $startDate = new DateTime($date_filter);

        switch ($dateRangeType) {
            case ReportRangeGeneratorType::DAY:
                for ($i = $count - 1; $i >= 0; $i--) {
                    $date = clone $startDate;
                    $date->modify("-$i days");
                    $dates[] = $date->format('d.m.Y'); // DD.MM.YYYY format
                }
                break;

            case ReportRangeGeneratorType::WEEK:
                $firstDayOfWeek = clone $startDate;
                $firstDayOfWeek->modify('monday this week');
                for ($i = $count - 1; $i >= 0; $i--) {
                    $date = clone $firstDayOfWeek;
                    $date->modify("-$i weeks");

                    // Get the year and week number, ensuring the week number is zero-padded to two digits
                    $weekYear = $date->format('o'); // ISO-8601 year
                    $weekNumber = $date->format('W'); // ISO-8601 week number
                    $dates[] = "{$weekNumber}.{$weekYear}"; // Format as WW.YYYY
                }
                break;

            case ReportRangeGeneratorType::MONTH:
                // Ensure $startDate is immutable and set to the first day of the month
                $startDate = new DateTimeImmutable($startDate->format('Y-m-01'));

                for ($i = 0; $i < $count; $i++) {
                    $date = $startDate->modify("-$i months"); // Go back one month at a time
                    $dates[] = $date->format('m.Y'); // Format as month.year
                }                
                $dates = array_reverse($dates);
                break;

            default:
                return []; // Return empty array for invalid date range types
        }

        return $dates;
    }

    public function getFirstDateOfWeek(string $yearWeek): string
    {
        [$week, $year] = explode('.', $yearWeek);

        // Create a DateTime object for the first day of the week
        $date = new DateTime();
        $date->setISODate((int)$year, (int)$week);
        return $date->format('Y-m-d');
    }

    public function getFirstDateOfMonth(string $yearMonth): string
    {
        // Split the year and month number
        [$month, $year] = explode('.', $yearMonth);

        // Create a DateTime object for the first day of the next month
        $date = new DateTime();
        $date->setDate((int)$year, (int)$month, 1);

        return $date->format('Y-m-d');
    }

    public function getFirstDateOfCurrentMonth($date = null)
    {
        // If no date is provided, use the current date
        if ($date === null) {
            $date = now();
        }

        $carbonDate = Carbon::parse($date);
        return $carbonDate->startOfMonth()->toDateString(); // Returns date in 'YYYY-MM-DD' format
    }
}
