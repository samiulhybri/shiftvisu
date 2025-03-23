<?php

namespace App\Http\Requests\CapacityPlan;

use App\Models\Hall;
use App\Models\Machine;
use App\Models\ShiftModel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCapacityPlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
//    public function authorize()
//    {
//        return false;
//    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'machine_id' => [
                'nullable',
                Rule::requiredIf(function () {
                    return empty($this->input('hall_id'));
                }),
                Rule::exists(Machine::class, 'id'),
            ],
            'hall_id' => [
                'nullable',
                Rule::requiredIf(function () {
                    return empty($this->input('machine_id'));
                }),
                Rule::exists(Hall::class, 'id'),
            ],
            'year' => ['required', 'integer', 'min:2020'],
            'shift_model_id' => ['required', Rule::exists(ShiftModel::class, 'id')],
            'working_day' => ['required', 'Array', Rule::in([0,1,2,3,4,5,6,])],
            'possible_off_dates' => ['nullable', 'Array']
        ];
    }

    protected function failedValidation(Validator $validator)
    {  
        throw new HttpResponseException(response()->json([
            'message' => 'The given data was invalid.'
        ], 422));
    }
}
