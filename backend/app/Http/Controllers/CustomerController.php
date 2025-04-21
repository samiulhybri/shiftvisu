<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Customer;
use App\Models\Message;
use App\Models\SalesStatus;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CustomerController extends Controller
{
    public function getChatData($chatId)
    {
        try {
            $chat = Chat::where('id', $chatId)
                ->with(['messages'])
                ->first();

            if (isset($chat->messages)) {
                $messages = $chat->messages;
                $mappedMessages = $messages->map(function ($message) {
                    $image = Media::where([
                        ['model_id', '=', $message->id],
                        ['model_type', '=', Message::class],
                    ])->first();

                    if($image) {
                        $image['path'] = app(MediaController::class)->getMediaPath($image)->getData()->path ?? $image['original_url'];
                    }

                    return [
                        'id' => $message->id,
                        'chat_id' => $message->chat_id,
                        'content' => $message->content,
                        'sender_user_id' => $message->sender_user_id,
                        'affected_user_id' => $message->affected_user_id,
                        'chat_action' => $message->chat_action,
                        'created_at' => $message->created_at,
                        'media' => $image,
                        'sender' => User::where('id', $message->sender_user_id)->first(),
                        'message' => $message->id,
                        'read_by' => $message->readBy->map(function ($user) {
                            return [
                                'user_id' => $user->id,
                                'read' => $user->message_read_status->read ?? false,
                            ];
                        })->toArray(),
                    ];
                });

                return $mappedMessages;
            }

            if ($chat) {
            } else {
                return response()->json(['message' => 'No chat found'], 404);
            }
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }

    /**
     * get backlog for crm kanban
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Database\Eloquent\Collection<int, Customer>
     */
    public function getBacklog(Request $request)
    {
        $top = $request->query('$top', 100);
        $skip = $request->query('$skip', 0);
        $countryIds = collect(explode(',', $request->query('countries', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $revenueClassifications = collect(explode(',', $request->query('revenue_classifications', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $employeeClassifications = collect(explode(',', $request->query('employee_classifications', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $marketSegments = collect(explode(',', $request->query('market_segments', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $userResponsibles = collect(explode(',', $request->query('user_responsibles', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $salesStatuses = collect(explode(',', $request->query('sales_statuses', '')))
            ->map(callback: fn($item) => (int) $item)
            ->toArray();

        $searchValue = $request->query('searchValue');

        $query = Customer::with(['salesStatus', 'country'])
            ->select(['id','is_active', 'sales_status_id', 'custom_id', 'name', 'date_follow_up', 'country_id', 'revenue_classification_id', 'employee_classification_id', 'market_segment_id', 'user_id_responsible'])
            ->where('is_active', true);

        // Apply the 'whereIn' condition only if $countryIds is not empty
        if (!empty($request->query('countries'))) {
            $query->whereIn('country_id', $countryIds);
        }

        if (!empty($request->query('revenue_classifications'))) {
            $query->whereIn('revenue_classification_id', $revenueClassifications);
        }

        if (!empty($request->query('employee_classifications'))) {
            $query->whereIn('employee_classification_id', $employeeClassifications);
        }

        if (!empty($request->query('market_segments'))) {
            $query->whereIn('market_segment_id', $marketSegments);
        }

        if (!empty($request->query('user_responsibles'))) {
            $query->whereIn('user_id_responsible', $userResponsibles);
        }

        if (!empty($searchValue)) {
            $query->where('name', 'like', '%' . $searchValue . '%');
        }

        // Add other conditions
        $query->where(function ($query) use ($request, $salesStatuses) {
            $query
                ->where(function ($query) use($request, $salesStatuses) {
                    if (!empty($request->query('sales_statuses'))) {
                        $query->whereNull('date_follow_up')->whereRelation('salesStatus', 'show_in_kanban', true)->whereIn('sales_status_id', $salesStatuses);
                    }else{
                        $query->whereNull('date_follow_up')->whereRelation('salesStatus', 'show_in_kanban', true);
                    }
                })
                ->orWhere(function ($query) {
                    $query->whereNull('date_follow_up')->whereNull('sales_status_id');
                })
                ->orWhereNull('sales_status_id');
        });

        // Pagination
        $customers = $query
            ->skip($skip)
            ->take($top)
            ->get();

        return $customers;
    }

    public function getCustomerSchedules(Request $request)
    {
        $dateFollowUpUntil = $request->query('date_follow_up_until',Carbon::now()->addDays(7)->format('Y-m-d'));
        $countryIds = collect(explode(',', $request->query('countries', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $revenueClassifications = collect(explode(',', $request->query('revenue_classifications', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $employeeClassifications = collect(explode(',', $request->query('employee_classifications', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $marketSegments = collect(explode(',', $request->query('market_segments', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();
        $userResponsibles = collect(explode(',', $request->query('user_responsibles', '')))
            ->map(fn($item) => (int) $item)
            ->toArray();

        $query = Customer::with(['salesStatus', 'country'])
            ->select(['id','is_active', 'sales_status_id', 'custom_id', 'name', 'date_follow_up', 'country_id', 'revenue_classification_id', 'employee_classification_id', 'market_segment_id', 'user_id_responsible'])
            ->where('is_active', true);

        $salesStatuses = collect(explode(',', $request->query('sales_statuses', '')))
            ->map(callback: fn($item) => (int) $item)
            ->toArray();

        $searchValue = $request->query('searchValue');

        // Apply the 'whereIn' condition only if $countryIds is not empty
        if (!empty($request->query('countries'))) {
            $query->whereIn('country_id', $countryIds);
        }

        if (!empty($request->query('revenue_classifications'))) {
            $query->whereIn('revenue_classification_id', $revenueClassifications);
        }

        if (!empty($request->query('employee_classifications'))) {
            $query->whereIn('employee_classification_id', $employeeClassifications);
        }

        if (!empty($request->query('market_segments'))) {
            $query->whereIn('market_segment_id', $marketSegments);
        }

        if (!empty($request->query('user_responsibles'))) {
            $query->whereIn('user_id_responsible', $userResponsibles);
        }else{
            $query->whereNull('user_id_responsible');
        }

        if (!empty($request->query('sales_statuses'))) {
            $query->whereIn('sales_status_id', $salesStatuses);
        }
        if (!empty($searchValue)) {
            $query->where('name','like','%'.$searchValue.'%');
        }

        $query->whereDate('date_follow_up', '<=', $dateFollowUpUntil)->whereDate('date_follow_up', '>', Carbon::now()->subDay()->format('Y-m-d'));

        // Add other conditions
        $query->whereNotNull('sales_status_id')
            ->whereNotNull('date_follow_up')
            ->whereRelation('salesStatus', 'show_in_kanban', true);

        $customers = $query
            ->get();

        $data = collect([]);
        $currentDate = Carbon::now();
        $condtion = true;

        if (!empty($request->query('sales_statuses'))) {
            $allSalesStatus=SalesStatus::orderBy('sort_order')->whereIn('id', $salesStatuses)->where('show_in_kanban', true)->get();
        }else {
            $allSalesStatus=SalesStatus::orderBy('sort_order')->where('show_in_kanban', true)->get();
        }
        while ($condtion) {
            $salesStatuses2 = collect();

            foreach($allSalesStatus as $value) {
                $customers2 = $customers->filter(function($customer) use ($currentDate,$value){
                    return $customer->date_follow_up == $currentDate->format('Y-m-d') && $customer->sales_status_id == $value->id;
                })->values();

                // return $customers2;

                $value->data = $customers2;


                
                $salesStatuses2->push($value);
            }

            $data->push([
                'date'=> $currentDate->format('Y-m-d'),
                'salesStatuses' => $salesStatuses2->toArray(),
            ]);
            
            if($currentDate->format('Y-m-d')==$dateFollowUpUntil){
                $condtion = false;
            }
            $currentDate = $currentDate->addDay();
        }

        return response()->json(['data'=> $data, 'all_sales_statuses'=>$allSalesStatus]);


        // return $customers;
    }
}
