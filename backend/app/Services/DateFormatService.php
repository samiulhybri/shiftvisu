<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DateFormatService
{
    /**
     * Get Database Driver
     */
    protected function getDriver(): string
    {
        return DB::connection()->getPDO()->getAttribute(\PDO::ATTR_DRIVER_NAME);
    }

    /**
     * Get formatted date (DD.MM.YYYY)
     */
    public function getDateFormat(string $table, string $column): \Illuminate\Database\Query\Expression
    {
        return $this->getDriver() === 'pgsql'
            ? DB::raw("TO_CHAR({$table}.{$column}, 'DD.MM.YYYY') AS date")
            : DB::raw("DATE_FORMAT({$table}.{$column}, '%d.%m.%Y') AS date");
    }

    /**
     * Get week number
     */
    public function getWeekFormat(string $table, string $column): \Illuminate\Database\Query\Expression
    {
        return $this->getDriver() === 'pgsql'
            ? DB::raw("EXTRACT(WEEK FROM {$table}.{$column}) AS week")
            : DB::raw("WEEK({$table}.{$column}, 3) AS week");
    }

    /**
     * Get week-year format (WW.YYYY)
     */
    public function getWeekYearFormat(string $table, string $column): \Illuminate\Database\Query\Expression
    {
        return $this->getDriver() === 'pgsql'
            ? DB::raw("TO_CHAR({$table}.{$column}, 'IW.YYYY') AS week_year")
            : DB::raw("CONCAT(LPAD(WEEK({$table}.{$column}, 3), 2, '0'), '.', YEAR({$table}.{$column})) AS week_year");
    }

    /**
     * Get month number
     */
    public function getMonthFormat(string $table, string $column): \Illuminate\Database\Query\Expression
    {
        return $this->getDriver() === 'pgsql'
            ? DB::raw("EXTRACT(MONTH FROM {$table}.{$column}) AS month")
            : DB::raw("MONTH({$table}.{$column}) AS month");
    }

    /**
     * Get month-year format (MM.YYYY)
     */
    public function getMonthYearFormat(string $table, string $column): \Illuminate\Database\Query\Expression
    {
        return $this->getDriver() === 'pgsql'
            ? DB::raw("TO_CHAR({$table}.{$column}, 'MM.YYYY') AS month_year")
            : DB::raw("DATE_FORMAT({$table}.{$column}, '%m.%Y') AS month_year");
    }
}
