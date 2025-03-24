<?php

namespace App\Http\Controllers;

use App\Models\CallOff;
use App\Models\CallOffSimulation;
use App\Models\SimCallOff;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class CallOffSimulationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return CallOffSimulation::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $count = CallOffSimulation::where('name', $request->input('name'))->count();

        if ($count)
            abort(409);

        $simulation = new CallOffSimulation();
        $simulation->name = $request->input('name');
        $simulation->save();

        if($request->input('with_sim_call_offs')) {

            $start_date = strtotime($request->query('start_date')) ?
                Date::createFromTimestamp(strtotime($request->query('start_date'))) :
                now();

            $end_date = strtotime($request->query('end_date')) ?
                Date::createFromTimestamp(strtotime($request->query('end_date'))) :
                now()->addYear();

            $call_offs = CallOff::select('item_id')
                ->where('call_offs.date', '>=', $start_date->toDateString())
                ->where('call_offs.date', '<=', $end_date->toDateString())
                ->groupBy('item_id')
                ->get();


            foreach ($call_offs as $call_off) {
                for ($date = $start_date->copy(); $date <= $end_date; $date->addWeek()) {
                    $sim_call_off = new SimCallOff();
                    $sim_call_off->call_off_simulation_id = $simulation->id;
                    $sim_call_off->item_id = $call_off->item_id;
                    $sim_call_off->year = $date->year;
                    $sim_call_off->week = $date->isoWeek;

                    $date_monday = now();
                    $date_monday->setISODate($sim_call_off->year, $sim_call_off->week);

                    $sim_call_off->date_monday = $date_monday->toDateString();
                    $sim_call_off->quantity = 0;
                    $sim_call_off->save();
                }
            }
        }

        return response($simulation, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return CallOffSimulation::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $simulation = CallOffSimulation::find($id);

        $simulation->name = $request->input('name', $simulation->name);
        $simulation->save();

        return $simulation;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $simulation = CallOffSimulation::find($id);
        $simulation->delete();
        return $simulation;
    }
}
