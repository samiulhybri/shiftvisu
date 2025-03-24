<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'name' => 'required|unique:roles,name'
        ]);

        if($validate->fails()){
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ], 403);
        }

        $permissionsValid = $this->checkPermissionsValidity($request->permissions);
        if(!$permissionsValid) {
            return response()->json(['error' => 'Invalid permission name'], 400);
        }
    
        $role = Role::create(['guard_name' => 'api', 'name' => $request->name]);
        $role->syncPermissions($request->get('permissions'));
        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $role)
    {
        $role = Role::where('id', $role)->first();
        $validate = Validator::make($request->all(), [
            'name' => 'required|unique:roles,name,'.$role->id
        ]);

        if($validate->fails()){
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ], 403);
        }

        $permissionsValid = $this->checkPermissionsValidity($request->permissions);
        if(!$permissionsValid) {
            return response()->json(['error' => 'Invalid permission name'], 400);
        }

        $role->update($request->only('name'));
        $role->syncPermissions($request->get('permissions'));
        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Role $role)
    {
        $role->delete();
        return response()->json(null, 204);
    }

    // check permission validity
    private function checkPermissionsValidity($permissions): bool
    {
        $permissions = is_array($permissions) ? $permissions : ($permissions != '' ? [$permissions] : []);
        $existingPermissions = Permission::pluck('name');

        foreach ($permissions as $permission) {
            if (!$existingPermissions->contains($permission)) {
                return false; 
            }
        }
        return true;
    }
}
