<?php

namespace App\Console\Commands\Helper;

class FieldChecker
{
    /**
     * instead of checking if condition multiple time
     * I have prepared this method 
     * which will check our given field is set or not
     * @param String $fieldName
     * @param Model $record
     * @param Array $item => each item from the data source
     * @param mixed $defaultValue
     * @return void
     */
    public static function setField($fieldName, $record, $item, $defaultValue = null)
    {
        $record->$fieldName = isset($item[$fieldName]) ? $item[$fieldName] : $defaultValue;
    }
}
?>