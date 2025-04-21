<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\DocVisu\DocVisuFile;
use App\Models\EightDReport;
use App\Models\Item;
use App\Models\Message;
use App\Models\MpOffer;
use App\Models\OfferPos;
use App\Models\OperationPlanPos;
use App\Models\ProdOrderPos;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function uploadMedia(Request $request): Response
    {
        $model = $request->get('model');
        $id = $request->get('id');

        switch ($model) {
            case 'MpOffer':
                $media = MpOffer::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            case 'OfferPos':
                $media = OfferPos::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            case 'Item':
                $media = Item::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            case 'ProdOrderPos':
                $media = ProdOrderPos::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            case 'OperationPlanPos':
                $media = OperationPlanPos::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            case 'Customer':
                $media = Customer::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            case 'Message':
                $media = Message::find($id)->addMediaFromRequest('media')->toMediaCollection();
                $media['path'] = app(MediaController::class)->getMediaPath($media)->getData()->path ?? $media['original_url'];
                return response($media);
            case 'EightDReport':
                $media = EightDReport::find($id)->addMediaFromRequest('media')->toMediaCollection();
                return response($media);
            default:
                abort(415, 'Model does not support media');
        }
    }

    public function getMediaPath(Media $media)
    {
        # getTemporaryUrl() is only available for S3
        if($media->disk == 's3') {
            return response()->json(['id' => $media->id, 'path' => $media->getTemporaryUrl(now()->addMinutes(5))]);
        } else if($media->disk == 'local' || $media->disk == 'public') {
            $temporaryLocalUrl = URL::signedRoute('api.temporary.media', [
                'media' => $media->id,
            ], now()->addMinutes(5));
            // Parse the URL to check the scheme
            $parsedUrl = parse_url($temporaryLocalUrl);

            // Ensure the URL uses HTTPS if it doesn't already
            if (env('APP_ENV') != "local" && ($parsedUrl['scheme'] ?? 'http') === 'http') {
                $temporaryLocalUrl = str_replace('http://', 'https://', $temporaryLocalUrl);
            }
            return response()->json(['id' => $media->id, 'path' => $temporaryLocalUrl]);
        } else {
            return response()->json(['id' => $media->id, 'path' => $media->getUrl()]);
        }
    }

    public function get_model_image_paths($model, $modelId)
    {
        try {
            if ($model == 'DocVisuFile') {
                $model = 'DocVisu\\DocVisuFile';
            }
            $collection = request()->query('collection');
            $modelClass = "App\\Models\\" . ucfirst($model);
            $modelInstance = $modelClass::with(['media' => function ($query) use ($collection) {
                if (!empty($collection)) {
                    $query->where('collection_name', $collection);
                }
                else {
                    $query->where('collection_name', 'default');
                }
                $query->orderByDesc('is_selected');
            }])->findOrFail($modelId);

            try{
                foreach($modelInstance->media as $key=>$media){
        
                    $modelInstance->media[$key]['path']= $this->getMediaPath($media)->getData()->path?? $modelInstance->media[$key]['original_url'];
                }
                } catch (\Exception $exception) {

            } 
            return response()->json($modelInstance);
        } catch (\Exception $exception) {
            abort(415, 'Model does not support media or not Found');
        }
    }

    public function serveTemporaryMedia(Request $request, Media $media)
    {

        # Check if the signed URL is still valid
        if (!$request->hasValidSignature()) {
            abort(403);
        }

        # Get local file path
        $filePath = $media->id . '/' . $media->file_name;
        $disk = $media->disk;
        if (!Storage::disk($disk)->exists($filePath)) {
            abort(404);
        }
        $path = public_path('storage/' . $filePath);

        $content = file_get_contents($path);
        $mimeType = mime_content_type($path);

        return response($content, 200)->header('Content-Type', $mimeType)->header('Content-Disposition', 'inline');
    }

    public function updateMediaSelection(Request $request, $id)
    {
        $findMedia = Media::where('model_type', $request->model_type)
            ->where('model_id', $request->model_id)
            ->get()->toArray();

        if (sizeof($findMedia) > 0) {
            foreach ($findMedia as $media) {
                $m = Media::find($media['id']);
                $m->is_selected = 0;
                $m->push();
            }
        }

        $media = Media::find($id);
        $media->is_selected = 1;
        $media->push();
    }

    public function removeMedia(Media $media)
    {
        try {
            $media->delete();
            return response()->json(['message' => 'File deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete file.', 'error' => $e->getMessage()], 500);
        }
    }
}
