<?php

namespace App\Http\Controllers\DocVisu;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\IdGeneratorController;
use App\Models\DocVisu\DirectoryStructure;
use App\Models\DocVisu\DocumentSection;
use App\Models\DocVisu\DocVisuDirectory;
use App\Models\DocVisu\DocVisuFile;
use App\Models\DocVisu\FileNote;
use App\Models\DocVisu\FileVersion;
use App\Models\DocVisu\DocVisuLinking;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DocVisuController extends Controller
{

    protected $idGeneratorController;

    public function __construct(IdGeneratorController $idGeneratorController)
    {
        $this->idGeneratorController = $idGeneratorController;
    }

    public function createProcess(Request $request)
    {
        $structure = DirectoryStructure::create([
            'name' => $request->name,
            'sectionable_type' => $request->sectionable_type,
            'sectionable_id' => $request->sectionable_id,
            'is_active' => $request->is_active,
            'custom_id' => $request->custom_id
        ]);

        $directories = $request->directories;

        if ($directories) {
            $this->createDirectory($directories, 'App\\Models\\DocVisu\\DirectoryStructure', $structure->id);
        }

        return response()->json($structure, 201);
    }

    private function createDirectory($directories, $parentType, $parentId)
    {
        foreach ($directories as $directory) {
            $dir = DocVisuDirectory::create([
                'name' => $directory['name'],
                'parent_type' => $parentType,
                'parent_id' => $parentId
            ]);

            if (isset($directory['directories'])) {
                $this->createDirectory($directory['directories'], 'App\\Models\\DocVisu\\DocVisuDirectory', $dir->id);
            }
        }
    }

    public function getAllDocumentSections(Request $request)
    {
        $docSections = DocumentSection::with(['directoryStructure'])->get();
        if (!$docSections) {
            return response()->json(['message' => 'Document sections not found'], 404);
        }

        return response()->json($docSections, 200);
    }

    public function getAllDirectoryStructures(Request $request)
    {
        $sectionableType = $request->query('sectionable_type');
        $sectionableId = $request->query('sectionable_id');

        $query = DirectoryStructure::query();

        $query->where('sectionable_type', $sectionableType);
        $query->where('sectionable_id', $sectionableId);

        foreach ($request->query() as $key => $value) {
            $query->where($key, $value);
        }

        $query->orderBy('id', 'asc');

        $structures = $query->get();

        return response()->json($structures, 200);
    }

    public function getStructureDetails(Request $request, int $structureId)
    {
        $structure = DirectoryStructure::find($structureId);

        if (!$structure) {
            return response()->json(['message' => 'Structure not found'], 404);
        }

        $fetchDirectories = function ($parentId, $parentType, $parentName, bool $willFetchLinks) use (&$fetchDirectories, &$fetchLinks) {
            return DocVisuDirectory::where('parent_id', $parentId)
                ->where('parent_type', $parentType)
                ->with([
                    'files' => function ($query) {
                        $query->with([
                            'versions' => function ($version) {
                                $version->with(['creator:id,name,email']);
                            },
                            'notes' => function ($note) {
                                $note->with(['creator:id,name,email']);
                            },
                            'media'
                        ]);
                    }
                ])
                ->get()
                ->map(function ($directory) use ($fetchDirectories, $fetchLinks, $parentName, $willFetchLinks) {
                    $links = [];
                    if ($willFetchLinks) {
                        $links = $fetchLinks($directory->id, DocVisuDirectory::class, false);
                    }
                    return [
                        'id' => $directory->id,
                        'name' => $directory->name,
                        'parent_id' => $directory->parent_id,
                        'parent_type' => $directory->parent_type,
                        'parent_name' => $parentName,
                        'created_at' => $directory->created_at,
                        'updated_at' => $directory->updated_at,
                        'directories' => $fetchDirectories($directory->id, DocVisuDirectory::class, $directory->name, $willFetchLinks),
                        'files' => $directory->files,
                        'links' => $links,
                    ];
                });
        };

        $fetchLinks = function ($parentId, $parentType, $parentName) use (&$fetchDirectories) {
            return DocVisuLinking::where('parent_id', $parentId)
                ->where('parent_type', $parentType)
                ->with('linkable')
                ->get()
                ->map(function ($linkable) use ($fetchDirectories, $parentName) {
                    $linked = $linkable->linkable;

                    if ($linked instanceof DocVisuDirectory) {
                        return [
                            'id' => $linkable->id,
                            'parent_id' => $linkable->parent_id,
                            'parent_type' => $linkable->parent_type,
                            'linkable_id' => $linkable->linkable_id,
                            'linkable_type' => $linkable->linkable_type,
                            'created_at' => $linkable->created_at,
                            'directories' => $fetchDirectories($linked->id, DocVisuDirectory::class, $parentName, false),
                            'files' => $linked->files()->with([
                                'versions' => function ($version) {
                                    $version->with(['creator:id,name,email']);
                                },
                                'notes' => function ($note) {
                                    $note->with(['creator:id,name,email']);
                                },
                                'media'
                            ])->get(),
                        ];
                    } elseif ($linked instanceof DirectoryStructure) {
                        return [
                            'id' => $linkable->id,
                            'parent_id' => $linkable->parent_id,
                            'parent_type' => $linkable->parent_type,
                            'linkable_id' => $linkable->linkable_id,
                            'linkable_type' => $linkable->linkable_type,
                            'created_at' => $linkable->created_at,
                            'directories' => $fetchDirectories($linked->id, DirectoryStructure::class, $parentName, false),
                        ];
                    } elseif ($linked instanceof DocVisuFile) {
                        return [
                            'id' => $linkable->id,
                            'parent_id' => $linkable->parent_id,
                            'parent_type' => $linkable->parent_type,
                            'linkable_id' => $linkable->linkable_id,
                            'linkable_type' => $linkable->linkable_type,
                            'created_at' => $linkable->created_at,
                            'file' => $linked->load([
                                'versions' => function ($version) {
                                    $version->with(['creator:id,name,email']);
                                },
                                'notes' => function ($note) {
                                    $note->with(['creator:id,name,email']);
                                },
                                'media'
                            ])
                        ];
                    }

                    return $linkable;
                })->filter();
        };

        $directories = $fetchDirectories($structureId, DirectoryStructure::class, $structure->name, true);
        $links = $fetchLinks($structureId, DirectoryStructure::class, $structure->name);

        $structure->setRelation('directories', $directories);
        $structure->setRelation('links', $links);

        return response()->json($structure, 200);
    }

    public function getDocVisuFile(Request $request, int $fileId)
    {
        $file = DocVisuFile::with(['versions', 'notes', 'media'])->find($fileId);

        if (!$file) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->json($file, 200);
    }

    public function createDocVisuFile(Request $request)
    {
        $filename = $request->get('filename');
        $parentType = $request->get('parent_type');
        $parentId = $request->get('parent_id');

        $notes = $request->get('notes');
        $responses = [];

        try {
            $userId = $request->user()->id;
            $customId = $this->idGeneratorController->generateId('DocVisuFile');
            $file = DocVisuFile::create([
                'custom_id' => $customId,
                'parent_type' => $parentType,
                'parent_id' => intval($parentId),
            ]);

            $responses['file'] = $file;

            if ($notes) {
                $note = FileNote::create([
                    'note' => $notes,
                    'doc_visu_file_id' => $file->id,
                    'user_id_creator' => $userId,
                ]);

                $responses['note'] = $note;
            }

            $version = FileVersion::create([
                'version' => 1,
                'doc_visu_file_id' => $file->id,
                'user_id_creator' => $userId,
            ]);
            $responses['version'] = $version;

            $media = DocVisuFile::find($file->id)->addMediaFromRequest('media')->toMediaCollection();
            $media->update([
                'name' => $filename,
                'file_name' => $filename,
            ]);
            $media = Media::find($media->id);
            $responses['media'] = $media;


            return response()->json($responses, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createDocVisuFileNotes(Request $request, int $fileId)
    {
        $userId = $request->user()->id;
        $notes = $request->notes;

        $note = FileNote::create([
            'note' => $notes,
            'doc_visu_file_id' => $fileId,
            'user_id_creator' => $userId,
        ]);

        return response()->json($note, 201);
    }

    public function updateDocVisuFile(Request $request, int $fileId)
    {
        $userId = $request->user()->id;
        $notes = $request->notes;

        $response = [];

        if ($request->hasFile('media')) {
            $media = DocVisuFile::find($fileId)->addMediaFromRequest('media')->toMediaCollection();
            $response['media'] = $media;
        }
        if ($notes) {
            $note = FileNote::create([
                'note' => $notes,
                'doc_visu_file_id' => $fileId,
                'user_id_creator' => $userId,
            ]);
            $response['note'] = $note;
        }

        $version = FileVersion::where('doc_visu_file_id', $fileId)->max('version');

        $version = FileVersion::create([
            'version' => $version->version + 1,
            'doc_visu_file_id' => $fileId,
            'user_id_creator' => $userId,
        ]);

        $response['version'] = $version;

        return response()->json($response, 200);
    }

    public function uploadDocVisuFileMedia(Request $request, int $fileId)
    {
        $response = [];

        $userId = $request->user()->id;
        $notes = $request->notes;
        $filename = $request->get('filename');

        $media = DocVisuFile::find($fileId)->addMediaFromRequest('media')->toMediaCollection();
        $media->update([
            'name' => $filename,
            'file_name' => $filename,
        ]);
        $media = Media::find($media->id);
        $response['media'] = $media;

        $previousVersion = FileVersion::where('doc_visu_file_id', $fileId)->max('version');

        if ($notes) {
            $note = FileNote::create([
                'note' => $notes,
                'doc_visu_file_id' => $fileId,
                'user_id_creator' => $userId,
            ]);
            $response['note'] = $note;
        }

        $version = FileVersion::create([
            'version' => $previousVersion + 1,
            'doc_visu_file_id' => $fileId,
            'user_id_creator' => $request->user()->id,
        ]);
        $response['version'] = $version;

        return response()->json($response, 201);
    }

    public function linkedToDirectory(Request $request)
    {
        $linksData = $request->input('links');

        if (!is_array($linksData)) {
            return response()->json(['error' => 'Invalid data format, expected an array'], 400);
        }

        $createdLinks = [];

        foreach ($linksData as $link) {
            if (!isset($link['parent_type'], $link['parent_id'], $link['linkable_type'], $link['linkable_id'])) {
                return response()->json(['error' => 'Missing required fields'], 400);
            }

            $createdLinks[] = DocVisuLinking::create([
                'parent_type' => $link['parent_type'],
                'parent_id' => $link['parent_id'],
                'linkable_type' => $link['linkable_type'],
                'linkable_id' => $link['linkable_id'],
            ]);
        }

        return response()->json($createdLinks, 201);
    }
}
