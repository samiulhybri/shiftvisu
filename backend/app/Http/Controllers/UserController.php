<?php

namespace App\Http\Controllers;

use App\Helpers\EmailHelper;
use App\Mail\MailPasswordReset;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Enums\BaseVisu\PermissionEnum;
use Illuminate\Support\Facades\App;
use DateTime;

class UserController extends Controller
{

    private function generateLoginResponse(User $user, $machine_id = null)
    {
        $token = $user->createToken(env('APP_KEY','browser'))->plainTextToken;
        return response()->json([
            'user' => [
                'id' => $user->id,
                'custom_id' => $user->custom_id,
                'username' => $user->username,
                'name' => $user->name,
                'permissions' => $this->getPermissionsNames($user->getAllPermissions()),
                'machine_id' => $machine_id
            ],
            'token' => $token,
        ], 201);
    }

    function login(Request $request)
    {
        $user = User::where('username', $request->username)->where('is_active',true)
            ->orWhere(function (Builder $query) use ($request) {
                $query->where('chip_number', $request->chip_number)
                    ->whereNotNull('chip_number');
            })
            ->first();
        if ($user === null)
            return response('Unauthorized', 403);

        if (
            password_verify($request->password, $user->password) ||
            ($request->chip_number && $request->chip_number === $user->chip_number)
        ) {
            return $this->generateLoginResponse($user);
        }
        return response('Unauthorized', 403);
    }

    function autoLogin(Request $request)
    {
        try {
            $ip = $request->ip;

            $user = User::where('ip_address', $ip)->first();
            
            if ($user === null) {
                return response("Unauthorized", 401);
            }

            // Get the first active machine associated with the user
            $machine = $user->machines()->where('is_active', true)->first();
            $machine_id = $machine ? $machine->id : null;

            return $this->generateLoginResponse($user, $machine_id);
        } catch (\Throwable $th) {
            return response($th, 403);
        }
    }

    private function getPermissionsNames(Collection $permissions): array
    {
        return $permissions->pluck('name')->toArray();
    }

    function getUserByToken(Request $request)
    {
        $accessToken = $request->bearerToken();
        $token = PersonalAccessToken::findToken($accessToken);

        if ($token == null)
            return response('Unauthorized', 403);
        $tokenableUser = $token->tokenable;
        $user = User::with(['supervisorOne', 'supervisorTwo', 'roles.permissions'])->where('id', $tokenableUser->id)->first();

        if($user->is_active == false) {
            return response('Unauthorized', 403);
        }

        return [
            ...$user->toArray(),
            'permissions' => $this->getPermissionsNames($user->getAllPermissions())
        ];
    }

    /**
     * This function is only for Version 10
     * This function is responsible for sync the castvisu permission 
     */
    function syncCastVisuUserPermissionForV10(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'custom_id' => 'required',
            'permission' => 'nullable|numeric'
        ]);

        if ($validate->fails()) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ], 403);
        }

        try {
            $user = User::where('custom_id', $request->custom_id)
                ->with('permissions')
                ->first();

            if ($user == null) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // get existing permissions
            $prevPermissions = $user->permissions->pluck('name')->toArray();

            // remove existing castvisu permissions
            $prevPermissions = array_filter($prevPermissions, function ($el) {
                return stripos($el, "castvisu") === false;
            });

            // remove all castvisu permissions if permission set to null
            if(is_null($request->permission)) {
                $user->syncPermissions([...$prevPermissions]);
            }else {
                $selectedPermission = $user->getPermissionBasedOnCastVisuPermissionIDForV10($request->permission);
                if ($selectedPermission) {
                    $user->syncPermissions([...$prevPermissions, $selectedPermission->name]);
                }
            }
            return response()->json($user->load('permissions'), 201);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    function logout(Request $request)
    {
        $accessToken = $request->bearerToken();
        $v10Token = isset($request->headers->all()['v10token'][0]) ? $request->headers->all()['v10token'][0] : '';
        $v9SessionId = isset($request->headers->all()['v9sessionid'][0]) ? $request->headers->all()['v9sessionid'][0] : '';
        
        $v10Url = env('v10_URL');
        $v9Url = env('v9_URL');
        $token = PersonalAccessToken::findToken($accessToken);
        if ($token){
            $token->delete();
            if ($v10Token) {
                $url = "{$v10Url}/auth/auth_service.php?service=logout";                
                try {
                    $response = Http::withHeaders([
                        'Authorization' => "Bearer {$v10Token}"
                    ])->get($url);
                    
                    if ($response->successful()) {
                        // Handle successful response
                    } else {
                        // Handle non-2xx status codes
                        throw new \Exception('Error: Non-successful response.');
                    }
                } catch (\Exception $e) {
                    // Handle error during the request
                    // Log or display the error
                    error_log($e->getMessage());
                }
            }
            
            if ($v9SessionId && $v9SessionId == 'true') {
                $url = "{$v9Url}/user_session/php/session_data_service.php?service=end_session";
                try {
                    $response = Http::get($url);
                    
                    if ($response->successful()) {
                        // Handle successful response
                    } else {
                        // Handle non-2xx status codes
                        throw new \Exception('Error: Non-successful response.');
                    }
                } catch (\Exception $e) {
                    // Handle error during the request
                    error_log($e->getMessage());
                }
            }
            
        }

    }

    function createUser(Request $request)
    {
        $password = password_hash($request->password, PASSWORD_DEFAULT);
        DB::beginTransaction();
        try {
            $user = User::create([
                'custom_id' => $request->custom_id,
                'supervisor1_user_id' => $request->supervisor1_user_id,
                'supervisor2_user_id' => $request->supervisor2_user_id,
                'name' => $request->name,
                'email' => $request->email,
                'email_verified_at' => $request->email_verified_at,
                'chip_number' => $request->chip_number,
                'is_active' => $request->is_active,
                'username' => $request->username,
                'is_melter' => $request->is_melter,
                'is_mp_offer_user' => $request->is_mp_offer_user,
                'is_mp_offer_admin' => $request->is_mp_offer_admin,
                'mp_is_allowed_reoffer' => $request->mp_is_allowed_reoffer,
                'is_supervisor' => $request->is_supervisor,
                'user_type' => $request->user_type,
                'is_absence_manager_admin' => $request->is_absence_manager_admin,
                'ip_address' => $request->ip_address,
                'password' => $password,
                'shift_model_id' => $request->shift_model_id,
            ]);


            $userGroup = $request->userGroup;
            $userUserGroups = [];
            foreach ($userGroup as $value) {
                array_push($userUserGroups, [
                    'user_group_id' => $value['id']
                ]);
            }

            $user->userGroup()->attach($userUserGroups);
            $queries = [];
            foreach ($request->roles as $value) {
                array_push($queries, ['name', '=', $value['name']]);
            }

            $roles = null;
            foreach ($queries as $key => $query) {
                if ($key == 0) {
                    $roles = Role::orWhere($query[0], $query[1], $query[2]);
                } else {
                    $roles = $roles->orWhere($query[0], $query[1], $query[2]);
                }
            }

            if ($roles != null) {
                $roles = $roles->get();
                $user->assignRole($roles);
            }
            $user->userGroup = $userGroup;


            DB::commit();
            return $user->load(
                'roles.permissions'
            );
        } catch (\Exception $e) {
            DB::rollback();
            return $e;
        }


    }

    public function getUsers(Request $request)
    {
        $query = User::with(['userGroup', 'roles.permissions', 'supervisorOne', 'supervisorTwo', 'machines', 'shiftModel'])->orderBy('custom_id');

        // Get the filter parameter
        $filter = $request->query('$filter');

        // Apply the filter if present
        if ($filter) {
            $arrayString = explode(" ", $filter);
            $field = $arrayString[0];
            $value = $arrayString[2];

            switch ($arrayString[1]) {
                case 'eq':
                    $operator = "=";
                    break;
                case 'ne':
                    $operator = "!=";
                    break;
                default:
                    return response()->json($query->get()); // If the operator is not recognized, return all users
            }

            // If the value is "true" or "false", convert it to 1 or 0
            if ($value == "true" || $value == "false") {
                $value = $value == "true" ? 1 : 0;
            }

            $query->where($field, $operator, $value);  // Apply the filter to the query
        }

        $users = $query->get();

        return response()->json($users);
    }

    function getUserCount() {
        $userCount = User::count();
        return response()->json([$userCount], 200);
    }

    function updateUser(Request $request, $user)
    {
        DB::beginTransaction();
        try {
            $password = password_hash($request->password, PASSWORD_DEFAULT);
            $data = [
                'custom_id' => $request->custom_id,
                'supervisor1_user_id' => $request->supervisor1_user_id,
                'supervisor2_user_id' => $request->supervisor2_user_id,
                'name' => $request->name,
                'email' => $request->email,
                'email_verified_at' => $request->email_verified_at,
                'chip_number' => $request->chip_number,
                'is_active' => $request->is_active,
                'username' => $request->username,
                'is_melter' => $request->is_melter,
                'is_mp_offer_user' => $request->is_mp_offer_user,
                'is_mp_offer_admin' => $request->is_mp_offer_admin,
                'mp_is_allowed_reoffer' => $request->mp_is_allowed_reoffer,
                'is_supervisor' => $request->is_supervisor,
                'user_type' => $request->user_type,
                'is_absence_manager_admin' => $request->is_absence_manager_admin,
                'ip_address' => $request->ip_address,
                'shift_model_id' => $request->shift_model_id,
                'hall_id' => $request->hall_id,
            ];
            if ($request->password) {
                $data['password'] = $password;
            }

            $user = User::where('id', $user)->first();
            $user->update($data);

            $userGroup = $request->userGroup;

            $userUserGroups = [];
            foreach ($userGroup as $value) {
                array_push($userUserGroups, [
                    'user_group_id' => $value['id']
                ]);
            }

            $user->userGroup()->sync($userUserGroups);

            $roles = null;
            $queries = [];
            foreach ($request->roles as $value) {
                array_push($queries, ['name', '=', $value['name']]);
            }

            foreach ($queries as $key => $query) {
                if ($key == 0) {
                    $roles = Role::orWhere($query[0], $query[1], $query[2]);
                } else {
                    $roles = $roles->orWhere($query[0], $query[1], $query[2]);
                }
            }

            if ($roles != null) {
                $roles = $roles->get();
                $user->syncRoles($roles);
            } else {
                $user->syncRoles();
            }

            $user->userGroup = $userGroup;

            DB::commit();
            return $user;
        } catch (\Exception $e) {
            DB::rollback();
            return $e;
        }
    }

    //ToolVisu role permissions based apis used only for v9 and v10 clients
    function fetchAllToolVisuRoles () {
        $toolVisuRoles = Role::where('name', 'LIKE', '%toolvisu%')
            ->where('name', '!=', 'SUPERADMIN')
            ->get();

        return response()->json([
            'roles_by_naming' => $toolVisuRoles
        ],201);
    }

    function fetchToolVisuUsersRoles() {
        try {
            // Define the specific ToolVisu permissions
            $toolVisuPermissions = [
                PermissionEnum::TOOLVISU_VIEW()->value,
                PermissionEnum::TOOLVISU_TOOL_REPAIR_EDIT()->value,
                PermissionEnum::TOOLVISU_TOOL_REPAIR_VIEW()->value,
                PermissionEnum::TOOLVISU_PLANNED_ORDERS_EDIT()->value,
                PermissionEnum::TOOLVISU_PLANNED_ORDERS_VIEW()->value,
                PermissionEnum::TOOLVISU_REPAIR_HISTORY_VIEW()->value,
                PermissionEnum::TOOLVISU_ORDER_HISTORY_EDIT()->value,
                PermissionEnum::TOOLVISU_ORDER_HISTORY_VIEW()->value,
                PermissionEnum::TOOLVISU_TOOL_OVERVIEW_VIEW()->value,
                PermissionEnum::TOOLVISU_TOOL_SCHEDULE_VIEW()->value,
                PermissionEnum::TOOLVISU_SETTINGS_EDIT()->value,
                PermissionEnum::TOOLVISU_SETTINGS_VIEW()->value,
            ];
    
            $users = User::with('roles.permissions')->get();
    
            $userRolesData = $users->map(function ($user) use ($toolVisuPermissions) {
                $userToolVisuRoles = $user->roles->filter(function ($role) use ($toolVisuPermissions) {
                    return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($toolVisuPermissions)->isNotEmpty();
                });
    
                $rolesWithPermissions = $userToolVisuRoles->pluck('name')->unique();
    
                return [
                    'custom_id' => $user->custom_id,
                    'roles' => $rolesWithPermissions->values(),
                ];
            })->filter(function ($userData) {
                return !$userData['roles']->isEmpty();
            })->values();
    
            return response()->json([
                'status' => 'success',
                'data' => $userRolesData,
            ], 200);
    
        } catch(\Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'An error occurred!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    

    function updateToolVisuRolePerUser (Request $request) {
        $validate = Validator::make($request->all(), [
            'custom_id' => 'required',
            'updated_role' => 'nullable|array'
        ]);

        if($validate->fails()) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ],403);
        }

        try{
            $user = User::where('custom_id', $request->custom_id)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'User not found!',
                ], 404);
            }

            $toolVisuPermissions = [
                PermissionEnum::TOOLVISU_VIEW()->value,
                PermissionEnum::TOOLVISU_TOOL_REPAIR_EDIT()->value,
                PermissionEnum::TOOLVISU_TOOL_REPAIR_VIEW()->value,
                PermissionEnum::TOOLVISU_PLANNED_ORDERS_EDIT()->value,
                PermissionEnum::TOOLVISU_PLANNED_ORDERS_VIEW()->value,
                PermissionEnum::TOOLVISU_REPAIR_HISTORY_VIEW()->value,
                PermissionEnum::TOOLVISU_ORDER_HISTORY_EDIT()->value,
                PermissionEnum::TOOLVISU_ORDER_HISTORY_VIEW()->value,
                PermissionEnum::TOOLVISU_TOOL_OVERVIEW_VIEW()->value,
                PermissionEnum::TOOLVISU_TOOL_SCHEDULE_VIEW()->value,
                PermissionEnum::TOOLVISU_SETTINGS_EDIT()->value,
                PermissionEnum::TOOLVISU_SETTINGS_VIEW()->value,
            ];

            $userToolVisuRoles = $user->roles->filter(function ($role) use ($toolVisuPermissions) {
                return $role->name !== 'SUPERADMIN' &&  $role->permissions->pluck('name')->intersect($toolVisuPermissions)->isNotEmpty();
            })->pluck('name')->toArray();

            foreach ($userToolVisuRoles as $role) {
                if ($user->hasRole($role)) {
                    $user->removeRole($role);
                }
            }

            if (count($request->updated_role) > 0) {
                foreach ($request->updated_role as $role) {
                    $user->assignRole($role);
                }
            }

            $updatedRoles = $user->roles->filter(function ($role) use ($toolVisuPermissions) {
                return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($toolVisuPermissions)->isNotEmpty();
            })->pluck('name')->values()->toArray();

            return response()->json([
                'status' => 'success',
                'message' => 'User ToolVisu roles updated successfully.',
                'data' => [
                    'user' => $user->custom_id,
                    'toolvisu_roles' => $updatedRoles,
                ],
            ], 201);
        } catch(\Exception $e) {
            return $e;
        }
    }

    function syncSuperVisor(User $user) {
        try {
            if (!$user->is_supervisor) {
                $assigendSupervisor1 = User::where('supervisor1_user_id', $user->id)->get();
                $assigendSupervisor2 = User::where('supervisor2_user_id', $user->id)->get();
    
                if (count($assigendSupervisor1) > 0) {
                    foreach($assigendSupervisor1 as $user) {
                        User::where('id', $user->id)->update(['supervisor1_user_id' => null]);
                    }
                } 
                if (count($assigendSupervisor2) > 0) {
                    foreach($assigendSupervisor2 as $user) {
                        User::where('id', $user->id)->update(['supervisor2_user_id' => null]);
                    }
                } 
                return response()->json(['success' => true],200);
            }
        } catch (\Exception $e){
            return response()->json(['success' => $e],status: 500);
        }
    }

    /**
     * ====================Time Visu Role Permissions based APIs used only for v9 and v10 clients====================
     */

    /**
     * Fetch all Time Visu Roles
     */
    public function fetchAllTimeVisuRoles() 
    {
        $timeVisuRoles = Role::where('name', 'LIKE', '%timevisu%')
            ->where('name', '!=', 'SUPERADMIN')
            ->get();

        return response()->json([
            'roles_by_naming' => $timeVisuRoles
        ], 201);
    }

    /**
     * Fetch all roles related to time visu users
     */
    public function fetchTimeVisuUsersRoles() 
    {
        try {
            # Define the specific TimeVisu permissions
            $timeVisuPermissions = $this->getAllTimeVisuPermissions();
    
            $users = User::with('roles.permissions')->get();
    
            $userRolesData = $users->map(function ($user) use ($timeVisuPermissions) {
                $userTimeVisuRoles = $user->roles->filter(function ($role) use ($timeVisuPermissions) {
                    return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($timeVisuPermissions)->isNotEmpty();
                });
    
                $rolesWithPermissions = $userTimeVisuRoles->pluck('name')->unique();
    
                return [
                    'custom_id' => $user->custom_id,
                    'roles'     => $rolesWithPermissions->values(),
                ];
            })->filter(function ($userData) {
                return !$userData['roles']->isEmpty();
            })->values();
    
            return response()->json([
                'status'    => 'success',
                'data'      => $userRolesData,
            ], 200);
        } catch(\Exception $e) {
            return response()->json([
                'status'    => 'failed',
                'message'   => 'An error occurred!',
                'error'     => $e->getMessage(),
            ], 500);
        }
    }

    public function updateTimeVisuRolePerUser(Request $request) 
    {
        $validate = Validator::make($request->all(), [
            'custom_id'     => 'required',
            'updated_role'  => 'nullable|array'
        ]);

        if($validate->fails()) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ], 403);
        }

        try {
            $user = User::where('custom_id', $request->custom_id)->first();

            if (!$user) {
                return response()->json([
                    'status'    => 'failed',
                    'message'   => 'User not found!',
                ], 404);
            }

            $timeVisuPermissions = $this->getAllTimeVisuPermissions();

            $userTimeVisuRoles = $user->roles->filter(function ($role) use ($timeVisuPermissions) {
                return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($timeVisuPermissions)->isNotEmpty();
            })->pluck('name')->toArray();

            foreach ($userTimeVisuRoles as $role) {
                if ($user->hasRole($role)) {
                    $user->removeRole($role);
                }
            }

            if (count($request->updated_role) > 0) {
                foreach ($request->updated_role as $role) {
                    $user->assignRole($role);
                }
            }

            $updatedRoles = $user->roles->filter(function ($role) use ($timeVisuPermissions) {
                return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($timeVisuPermissions)->isNotEmpty();
            })->pluck('name')->values()->toArray();

            return response()->json([
                'status'    => 'success',
                'message'   => 'User TimeVisu roles updated successfully.',
                'data' => [
                    'user'              => $user->custom_id,
                    'toolvisu_roles'    => $updatedRoles,
                ],
            ], 201);
        } catch(\Exception $e) {
            return $e;
        }
    }

    /**
     * Get All Time Visu Related Permissions
     */
    private function getAllTimeVisuPermissions()
    {
        return [
            PermissionEnum::TIMEVISU_VIEW()->value,
            PermissionEnum::TIMEVISU_TIME_RECORD_VIEW()->value,
            PermissionEnum::TIMEVISU_TIME_RECORD_EDIT()->value,
            PermissionEnum::TIMEVISU_REPORT_HOURS_TOOLVISU()->value,
            PermissionEnum::TIMEVISU_REPORT_HOURS_EMPLOYEE()->value,
            PermissionEnum::TIMEVISU_REPORTS_HOURS_PROJECTS()->value,
        ];
    }

    public function getEmailForForgotPassword(Request $request)
    {
        try {
            $email = $request->input('email');
            $url = $request->input('url');

            // Retrieve active user by email
            $user = User::where('email', $email)->where('is_active', true)->first();

            if (!$user) {
                return response()->json(['success' => false], 404);
            }

            App::setLocale(config('app.locale'));

            // Generate encrypted reset token
            $token = Crypt::encryptString(json_encode([
                'email' => $email,
                'timestamp' => now()->toDateTimeString(),
            ]));

            // Build reset link
            $resetLink = str_replace('/forgot-password', "/change-password/$token", $url);

            // Prepare email content
            $mailInfo = [
                'subject' => __('messages.resetPassword.subject'),
                'content' => nl2br(__('messages.resetPassword.sectionTwo')),
                'resetLink' => $resetLink,
            ];

            // Send reset email
            (new EmailHelper())->sendEmail(
                'smtp',
                $mailInfo,
                $email,
                MailPasswordReset::class,
                [],
            );

            return response()->json(['success' => true], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 500);
        }
    }

    public function checkTokenValidationForResetPassword(Request $request)
    {
        try {
            $token = $request->input('token');
            $decryptToken = Crypt::decryptString($token);
            $values = json_decode($decryptToken, true);

            if (empty($values['timestamp']) || empty($values['email'])) {
                return response()->json(['error' => 'Invalid token data'], 400);
            }

            // Check if the token is expired (more than 5 minutes)
            $tokenTimestamp = new DateTime($values['timestamp']);
            $isExpired = (now()->diffInMinutes($tokenTimestamp, true) > 5);

            $user = User::where('email', $values['email'])
                ->where('is_active', true)
                ->where('updated_at', '<', $tokenTimestamp)
                ->first();

            if (!$user || $isExpired) {
                return response()->json(['success' => false, 'message' => 'Token expired or user not found'], 400);
            }

            return response()->json(['success' => true, 'message' => 'Token is valid'], 200);

        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            return response()->json(['success' => false, 'message' => 'Invalid token'], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $token = $request->input('token');
            $password = $request->input('password');
            $passwordConfirm = $request->input('passwordConfirm');

            // Check if password fields are provided and match
            if (empty($password) || $password !== $passwordConfirm) {
                return response()->json(['error' => 'Passwords do not match or are empty'], 400);
            }

            // Decrypt the token and retrieve email
            $decryptToken = Crypt::decryptString($token);
            $values = json_decode($decryptToken, true);

            // Validate the token data
            if (empty($values['email'])) {
                return response()->json(['error' => 'Invalid token data'], 400);
            }

            // Find the user by email
            $user = User::where('email', $values['email'])->where('is_active', true)->first();

            if (!$user) {
                return response()->json(['error' => 'User not found or inactive'], 404);
            }

            // Update user password
            $user->update([
                'password' => password_hash($request->password, PASSWORD_DEFAULT),
            ]);

            return response()->json(['success' => true, 'message' => 'Password reset successfully'], 200);

        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            return response()->json(['error' => 'Invalid token'], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    public function getUserIp(Request $request){
       
       return response()->json(['userIP' => $request->ips()], 200);
    }

    /**
     *PlanVisu role permissions based APIs used only for v9 and v10 clients
    */

    public function fetchAllPlanVisuRoles() 
    {
        $planVisuRoles = Role::where('name', 'LIKE', '%planvisu%')
            ->where('name', '!=', 'SUPERADMIN')
            ->get();

        return response()->json([
            'roles_by_naming' => $planVisuRoles
        ], 201);
    }

    public function fetchPlanVisuUsersRoles() 
    {
        try {
            # Define the specific PlanVisu permissions
            $planVisuPermissions = $this->getAllPlanVisuPermissions();
    
            $users = User::with('roles.permissions')->get();
    
            $userRolesData = $users->map(function ($user) use ($planVisuPermissions) {
                $userplanVisuRoles = $user->roles->filter(function ($role) use ($planVisuPermissions) {
                    return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($planVisuPermissions)->isNotEmpty();
                });
    
                $rolesWithPermissions = $userplanVisuRoles->pluck('name')->unique();
    
                return [
                    'custom_id' => $user->custom_id,
                    'roles'     => $rolesWithPermissions->values(),
                ];
            })->filter(function ($userData) {
                return !$userData['roles']->isEmpty();
            })->values();
    
            return response()->json([
                'status'    => 'success',
                'data'      => $userRolesData,
            ], 200);
        } catch(\Exception $e) {
            return response()->json([
                'status'    => 'failed',
                'message'   => 'An error occurred!',
                'error'     => $e->getMessage(),
            ], 500);
        }
    }

    public function updatePlanVisuRolePerUser(Request $request) 
    {
        $validate = Validator::make($request->all(), [
            'custom_id'     => 'required',
            'updated_role'  => 'nullable|array'
        ]);

        if($validate->fails()) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ], 403);
        }

        try {
            $user = User::where('custom_id', $request->custom_id)->first();

            if (!$user) {
                return response()->json([
                    'status'    => 'failed',
                    'message'   => 'User not found!',
                ], 404);
            }

            $planVisuPermissions = $this->getAllPlanVisuPermissions();

            $userPlanVisuRoles = $user->roles->filter(function ($role) use ($planVisuPermissions) {
                return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($planVisuPermissions)->isNotEmpty();
            })->pluck('name')->toArray();

            foreach ($userPlanVisuRoles as $role) {
                if ($user->hasRole($role)) {
                    $user->removeRole($role);
                }
            }

            if (count($request->updated_role) > 0) {
                foreach ($request->updated_role as $role) {
                    $user->assignRole($role);
                }
            }

            $updatedRoles = $user->roles->filter(function ($role) use ($planVisuPermissions) {
                return $role->name !== 'SUPERADMIN' && $role->permissions->pluck('name')->intersect($planVisuPermissions)->isNotEmpty();
            })->pluck('name')->values()->toArray();

            return response()->json([
                'status'    => 'success',
                'message'   => 'User related PlanVisu roles updated successfully.',
                'data' => [
                    'user'              => $user->custom_id,
                    'planvisu_roles'    => $updatedRoles,
                ],
            ], 201);
        } catch(\Exception $e) {
            return $e;
        }
    }

    /**
     * Get All PlanVisu Related Permissions
     */
    private function getAllPlanVisuPermissions()
    {
        return [
            PermissionEnum::PLANVISU_VIEW()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_PRODUCTION_PLAN_PAGE_EDIT()->value,
            PermissionEnum::PRODUCTION_PLAN_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_MACHINE_SCHEDULAR_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_MACHINE_SCHEDULAR_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_USER_SCHEDULAR_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_USER_SCHEDULAR_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_RANGE_OVERVIEW_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_ORDER_CREATE_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_ORDER_CREATE_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_STAFF_NEEDED_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_STAFF_WORKLOAD_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_MACHINE_WORKLOAD_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_ORDER_VIEW()->value,
            PermissionEnum::PLANVISU_SET_UP_PLAN_VIEW()->value,
            PermissionEnum::PLANVISU_EXPORT_IMPORT_VIEW()->value,
            PermissionEnum::PLANVISU_SET_UP_PLAN_EDIT()->value,
            PermissionEnum::PLANVISU_EXPORT_IMPORT_EDIT()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_DELETE()->value,
        ];
    }
}
