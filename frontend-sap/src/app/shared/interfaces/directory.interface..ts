export interface IDirectory {
  id: number;
  parent_id?: number;
  parent_type?: string;
  name: string;
  icon?: string;
  status?: string;
  type?: string;
  directories: IDirectory[];
  links?: any;
  linked?: any;
  files: IFile[];
  expanded?: boolean;
}

export interface ILinking {
  id: number;
  parent_id: number;
  parent_type: string;
  linked_id: number;
  linked_type: string;
  file?: IFile;
  files?: IFile[];
  directories?: IDirectory[];
}

export interface IFile {
  id: number;
  name: string;
  custom_id: string;
  icon: string;
  parent_id: number;
  parent_type: string;
  file_type: string;
  file_size: number;
  file_path: string;
  file_hash: string;
  notes: INotes[];
  media: IMedia[];
}

export interface INotes {
  id: number;
  notes: string;
}

export interface IMedia {
  id: number;
  name: string;
  mime_type: string;
  file_path: string;
  file_hash: string;
  file_size: number;
  created_at: string;
}
