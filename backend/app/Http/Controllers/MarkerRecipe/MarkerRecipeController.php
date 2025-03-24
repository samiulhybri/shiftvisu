<?php

namespace App\Http\Controllers\MarkerRecipe;

use App\Enums\MarkerBlockType;
use App\Http\Controllers\Controller;
use App\Http\Controllers\IdGeneratorController;
use App\Models\MarkerRecipe;
use App\Models\MarkerRecipePos;
use App\Models\MarkerRecipePosBlock;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class MarkerRecipeController extends Controller {
    public function sendMarkerRecipe(MarkerRecipe $markerRecipe, Request $request) {
        if (!$markerRecipe || !$request->ip) return response()->json(['success' => false]);
        $markerRecipe = $markerRecipe->load(['item', 'markerRecipePos.markerRecipePosBlock']);
        $sendMarker = [
            'custom_id' => $markerRecipe->custom_id,
            'name' => $markerRecipe->name,
            'machine_id' => isset($markerRecipe->machine->custom_id) ? $markerRecipe->machine->custom_id : "",
            'item_id' => isset($markerRecipe->item->custom_id) ? $markerRecipe->item->custom_id : "",
            'delay' => $markerRecipe->delay,
            'zaxis' => $markerRecipe->zaxis ? TRUE : FALSE,
            'pos' => []
        ];
        foreach ($markerRecipe->markerRecipePos as $pos) {
            $sendPos = [
                'pos' => $pos->pos,
                'marker_pos_type' => $pos->marker_pos_type,
                'pos_x' => $pos->pos_x,
                'pos_y' => $pos->pos_y,
                'pos_z' => $pos->pos_z,
                'angle' => $pos->angle,
                'font_height' => $pos->font_height,
                'should_touch_probe' => $pos->should_touch_probe ? true : false
            ];
            
            $sendPos['blocks'] = [];
            foreach ($pos->markerRecipePosBlock as $block) {
                $sendBlock = [
                    'sequence' => $block->order,
                    'marker_block_type' => $block->marker_block_type
                ];
                switch ($block->marker_block_type) {
                    case MarkerBlockType::TEXT():
                        $sendBlock['text'] = html_entity_decode(urldecode($block->text));
                        break;
                    case MarkerBlockType::ASCII_CHARACTER():
                        $sendBlock['ascii_dec'] = $block->ascii_dec;
                        break;
                    case MarkerBlockType::DAY_COUNTER():
                        $sendBlock['day_counter_length'] = $block->shot_counter_length;
                        break;
                    case MarkerBlockType::ORDER_COUNTER():
                        $sendBlock['order_counter_length'] = $block->shot_counter_length;
                        break;
                    case MarkerBlockType::DATETIME():
                        $sendBlock['text'] = $block->date_time_format_string;
                        break;
                    default:
                        # code...
                        break;
                }
                if($block->marker_block_type == MarkerBlockType::DATETIME()) {
                    $sendBlock['marker_block_type'] = 'TEXT';
                }

                $sendPos['blocks'][] = $sendBlock;
            }
            usort($sendPos['blocks'], function ($blockA, $blockB) {
                return $blockA['sequence'] - $blockB['sequence'];
            });

            $sendMarker['pos'][] = $sendPos;
            usort($sendMarker['pos'], function ($posA, $posB) {
                return $posA['pos'] - $posB['pos'];
            });
        }
        return Http::post('http://' . $request->ip . ':3000/marker-recipe', $sendMarker);
    }

    public function savePos(Request $request) {
        DB::beginTransaction();
        try {
            $maxPos = MarkerRecipePos::where("marker_recipe_id", $request->marker_recipe_id)->max('pos');
            if ($request->id) {
                $updatePos = MarkerRecipePos::where("id", $request->id)->first();
                $updatePos->marker_pos_type = $request->marker_pos_type;
                $updatePos->font_height = $request->font_height;
                $updatePos->pos_x = $request->pos_x;
                $updatePos->pos_y = $request->pos_y;
                $updatePos->pos_z = $request->pos_z;
                $updatePos->angle = $request->angle;
                $updatePos->should_touch_probe = $request->should_touch_probe;

                $currentPosition = $updatePos->pos;

                $updatePos->pos = 0;
                $updatePos->save();

                if ($request->pos < $currentPosition) {
                    MarkerRecipePos::where('pos', '!=', 0)
                        ->where('pos', '>=', $request->pos)
                        ->where('pos', '<', $currentPosition)
                        ->where('marker_recipe_id', $request->marker_recipe_id)
                        ->orderBy('pos', 'desc')
                        ->update(['pos' => DB::raw('`pos` + 1')]);
                } else if($currentPosition == 0) {
                    MarkerRecipePos::where('pos', '=', 0)
                        ->where('pos', '<=', $request->pos)
                        ->where('marker_recipe_id', $request->marker_recipe_id)
                        ->update(['pos' => DB::raw('`pos` + 1')]);
                } else {
                    MarkerRecipePos::where('pos', '!=', 0)
                        ->where('pos', '<=', $request->pos)
                        ->where('pos', '>', $currentPosition)
                        ->where('marker_recipe_id', $request->marker_recipe_id)
                        ->update(['pos' => DB::raw('`pos` - 1')]);
                }

                $updatePos->pos = $request->pos > $maxPos ? $maxPos : $request->pos;
                $updatePos->save();
            } else {
                $newPos = new MarkerRecipePos();
                $newPos->marker_recipe_id = $request->marker_recipe_id;
                $newPos->pos = $request->pos > $maxPos ? $maxPos + 1 : ($request->pos <= 0 ? 1 : $request->pos);
                $newPos->marker_pos_type = $request->marker_pos_type;
                $newPos->font_height = $request->font_height;
                $newPos->pos_x = $request->pos_x;
                $newPos->pos_y = $request->pos_y;
                $newPos->pos_z = $request->pos_z;
                $newPos->angle = $request->angle;
                $newPos->should_touch_probe = $request->should_touch_probe;

                if ($request->pos <= $maxPos) {
                    MarkerRecipePos::where('pos', '!=', 0)
                        ->where('pos', '>=', $request->pos)
                        ->where('marker_recipe_id', $request->marker_recipe_id)
                        ->orderBy('pos', 'desc')
                        ->update(['pos' => DB::raw('`pos` + 1')]);
                }

                $newPos->save();
            }
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            return response()->json(['success' => false]);
        }
        return response()->json(['success' => true]);
    }

    public function deletePos(Request $request) {
        DB::beginTransaction();
        try {
            $currentPosition = MarkerRecipePos::where("id", $request->id)->first();
            MarkerRecipePos::destroy($request->id);
            $remainingRecordsCount = MarkerRecipePos::where('marker_recipe_id', $currentPosition->marker_recipe_id)->count();

            if ($remainingRecordsCount == 1) {
                MarkerRecipePos::where('marker_recipe_id', $currentPosition->marker_recipe_id)
                    ->update(['pos' => 1]);
            } elseif ($remainingRecordsCount > 1) {
                MarkerRecipePos::where('marker_recipe_id', $currentPosition->marker_recipe_id)
                    ->where('pos', '>', $currentPosition->pos)
                    ->update(['pos' => DB::raw('`pos` - 1')]);
            }
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            return response()->json(['success' => false]);
        }
        return response()->json(['success' => true]);
    }

    public function saveBlock(Request $request) {
        DB::beginTransaction();
        try {
            $maxOrder = MarkerRecipePosBlock::where("marker_recipe_pos_id", $request->marker_recipe_pos_id)->max('order');
            if ($request->id) {
                $updateBlock = MarkerRecipePosBlock::where("id", $request->id)->first();
                $updateBlock->marker_block_type       = $request->marker_block_type;
                $updateBlock->date_time_format_string = $request->date_time_format_string;
                $updateBlock->text                    = $request->input('text');
                $updateBlock->ascii_dec               = $request->ascii_dec;
                $updateBlock->shot_counter_length     = $request->shot_counter_length;
                $updateBlock->notes                   = $request->notes;

                $currentOrder = $updateBlock->order;

                $updateBlock->order = 0;
                $updateBlock->save();

                if ($request->order < $currentOrder) {
                    MarkerRecipePosBlock::where('order', '!=', 0)
                        ->where('order', '>=', $request->order)
                        ->where('order', '<', $currentOrder)
                        ->where('marker_recipe_pos_id', $request->marker_recipe_pos_id)
                        ->orderBy('order', 'desc')
                        ->update(['order' => DB::raw('`order` + 1')]);
                } else if($currentOrder == 0) {
                    MarkerRecipePosBlock::where('order', '=', 0)
                        ->where('order', '<=', $request->order)
                        ->where('marker_recipe_pos_id', $request->marker_recipe_pos_id)
                        ->orderBy('order', 'desc')
                        ->update(['order' => DB::raw('`order` + 1')]);
                } else {
                    MarkerRecipePosBlock::where('order', '!=', 0)
                        ->where('order', '<=', $request->order)
                        ->where('order', '>', $currentOrder)
                        ->where('marker_recipe_pos_id', $request->marker_recipe_pos_id)
                        ->update(['order' => DB::raw('`order` - 1')]);
                }
                $updateBlock->order = $request->order > $maxOrder ? $maxOrder : $request->order;
                $updateBlock->save();
            } else {
                $newBlock = new MarkerRecipePosBlock();
                $newBlock->marker_recipe_pos_id    = $request->marker_recipe_pos_id;
                $newBlock->marker_block_type       = $request->marker_block_type;
                $newBlock->date_time_format_string = $request->date_time_format_string;
                $newBlock->text                    = $request->input('text');
                $newBlock->ascii_dec               = $request->ascii_dec;
                $newBlock->shot_counter_length     = $request->shot_counter_length;
                $newBlock->notes                   = $request->notes;
                $newBlock->order = $request->order > $maxOrder ? $maxOrder + 1 : ($request->order <= 0 ? 1 : $request->order);

                if ($request->order <= $maxOrder) {
                    MarkerRecipePosBlock::where('order', '!=', 0)
                        ->where('order', '>=', $request->order)
                        ->where('marker_recipe_pos_id', $request->marker_recipe_pos_id)
                        ->orderBy('order', 'desc')
                        ->update(['order' => DB::raw('`order` + 1')]);
                }

                $newBlock->save();
            }
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            return response()->json(['success' => false]);
        }
        return response()->json(['success' => true]);
    }

    public function deleteBlock(Request $request) {
        DB::beginTransaction();
        try {
            $currentOrder = MarkerRecipePosBlock::where("id", $request->id)->first();
            MarkerRecipePosBlock::destroy($request->id);
            $remainingOrdersCount = MarkerRecipePosBlock::where('marker_recipe_pos_id', $currentOrder->marker_recipe_pos_id)->count();

            if ($remainingOrdersCount == 1) {
                MarkerRecipePosBlock::where('marker_recipe_pos_id', $currentOrder->marker_recipe_pos_id)
                    ->update(['order' => 1]);
            } elseif ($remainingOrdersCount > 1) {
                MarkerRecipePosBlock::where('marker_recipe_pos_id', $currentOrder->marker_recipe_pos_id)
                    ->where('order', '>', $currentOrder->order)
                    ->update(['order' => DB::raw('`order` - 1')]);
            }
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            return response()->json(['success' => false]);
        }
        return response()->json(['success' => true]);
    }

    public function requestDataPcc($ip) {
        return Http::get('http://' . $ip . ':3001');
    }

    public function sendDatatoPrinter($ip) {
        return Http::get('http://' . $ip . ':3000/api/send-marker-recipe');
    }
    public function setOrderCounter($ip, $count) {
        return Http::get('http://' . $ip . ':3000/api/set-order-counter?cnt=' . $count);
    }
    public function setDayCounter($ip, $count) {
        return Http::get('http://' . $ip . ':3000/api/set-day-counter?cnt=' . $count);
    }

    public function copyRecipe(Request $request, $id) {
        try {
            $parentRecipe = MarkerRecipe::with('markerRecipePos.markerRecipePosBlock')->where('id', $id)->first();
            $copyRecipe = new MarkerRecipe();
            $copyRecipe->custom_id = IdGeneratorController::generateId('MarkerRecipes');
            $copyRecipe->machine_id = $request->machine_id;
            $copyRecipe->name = $parentRecipe->name;
            $copyRecipe->is_active = $parentRecipe->is_active;
            $copyRecipe->item_id = $parentRecipe->item_id;
            $copyRecipe->delay = $parentRecipe->delay;
            $copyRecipe->zaxis = $parentRecipe->zaxis;
            $copyRecipe->save();

            if($parentRecipe->markerRecipePos) {
                $childPos = [];
                foreach($parentRecipe->markerRecipePos as $parentPos) {
                    $cPos = new MarkerRecipePos();
                    $sourceAttributes = $parentPos->getAttributes();
                    foreach ($sourceAttributes as $key => $value) {
                        if($key != 'id' && $key != 'marker_recipe_id') {
                            $cPos->$key = $value;
                        } 
                    }
                    $cPos->marker_recipe_id = $copyRecipe->id;
                    $cPos->save();
                    if($parentPos->markerRecipePosBlock) {
                        $childBlock = [];
                        foreach($parentPos->markerRecipePosBlock as $parentPosBlock) {
                            $cBlock = new MarkerRecipePosBlock();
                            $sourceAttributes = $parentPosBlock->getAttributes();
                            foreach ($sourceAttributes as $key => $value) {
                                if($key != 'id' && $key != 'marker_recipe_pos_id ') {
                                    $cBlock->$key = $value;
                                } 
                            }
                            $cBlock->marker_recipe_pos_id = $cPos->id;
                            $cBlock->save();
                            array_push($childBlock, $cBlock);
                        }
                        $cPos->marker_recipe_pos_block = $childBlock;
                    }
                    array_push($childPos, $cPos);
                }
                $copyRecipe->marker_recipe_pos = $childPos;
            }

            return response()->json(['success' => true, 'records' => $copyRecipe]);
        } catch (Exception $exception) {
            return response()->json(['success' =>  false]);
        }
    }
}
