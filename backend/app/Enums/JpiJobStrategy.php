<?php

namespace App\Enums;

enum JpiJobStrategy : string
{
    case ASAP = 'ASAP';
    case JIT = 'JIT';

    public function jpiEnum(): string
    {
        return match ($this) {
            JpiJobStrategy::JIT => 'Jit',
            default => 'Asap',
        };
    }
}
