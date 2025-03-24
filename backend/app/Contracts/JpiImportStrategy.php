<?php

namespace App\Contracts;

interface JpiImportStrategy
{
    public function importJpiJobs(?string $singleCustomId = null);
}