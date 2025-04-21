<?php

namespace App\Helpers;

use Spatie\Permission\Models\Permission;

class PermissionSeederHelper
{
    public static function syncFilteredPermissions(array $permissions, array $modules, array $excludePatterns): void
    {
        $validPermissions = [];

        foreach ($permissions as $permission) {
            // Skip if contains any exclude pattern
            foreach ($excludePatterns as $exclude) {
                if (str_contains($permission, $exclude)) {
                    continue 2; // skip this permission entirely
                }
            }

            // Only allow if starts with a valid module
            $startsWithModule = false;
            foreach ($modules as $module) {
                if (str_contains($permission, $module)) {
                    $startsWithModule = true;
                    break;
                }
            }

            if (!$startsWithModule) {
                continue;
            }

            // Add to valid list
            $validPermissions[] = $permission;

            // Create if missing
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'api',
            ]);
        }
    }
}
