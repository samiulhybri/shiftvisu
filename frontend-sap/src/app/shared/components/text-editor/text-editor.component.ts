import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
    ClassicEditor,
    Autoformat,
    Bold,
    Italic,
    Underline,
    BlockQuote,
    Base64UploadAdapter,
    CloudServices,
    CKBox,
    Essentials,
    Heading,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    PictureEditing,
    Indent,
    IndentBlock,
    Link,
    List,
    MediaEmbed,
    Mention,
    Paragraph,
    PasteFromOffice,
    Table,
    TableColumnResize,
    TableToolbar,
    TextTransformation,
    ImageTextAlternative,
    FontColor,
    FontBackgroundColor,
    FontFamily,
    FontSize,
    Undo,
    Strikethrough,
    Subscript,
    Superscript,
    Code,
    CodeBlock,
    Alignment,
    TodoList,
    TableProperties,
    TableCellProperties,
    AutoLink,
} from 'ckeditor5';
import { EditorConfig } from '@ckeditor/ckeditor5-core';
import { SlashCommand } from 'ckeditor5-premium-features';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

@Component({
    selector: 'app-text-editor',
    templateUrl: './text-editor.component.html',
    styleUrl: './text-editor.component.css'
})
export class TextEditorComponent {
    @Input() notes!: string;
    @Input() isReadOnly: boolean = false;
    @Output() sendNotes: EventEmitter<any> = new EventEmitter();
    @ViewChild('editor') editorElement!: ElementRef;

    private CKBOX_TOKEN_URL: string = '';
    private LICENSE_KEY: string = 'RXZ0OTJWTHpKd1l6bEw5VGUyYmhGdzgrbzFEZnFnbTFTbHZXUFdjd3l6RDkyMFV6M016c3BSTGZhak4vUEE9PS1NakF5TkRFd01URT0=';
    public classicEditor: any = ClassicEditor;
    public config: EditorConfig = {
        plugins: [
            Autoformat,
            Undo,
            Heading,
            FontFamily, FontSize, FontColor, FontBackgroundColor,
            Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Code,
            Link, AutoLink, BlockQuote, CodeBlock, Alignment, TodoList,
            CloudServices,
            ...(this.CKBOX_TOKEN_URL ? [CKBox] : []),
            Essentials,
            List, Indent, IndentBlock,
            ImageUpload, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar, Base64UploadAdapter, PictureEditing, ImageTextAlternative,
            MediaEmbed, Mention,
            Paragraph, PasteFromOffice,
            Table, TableColumnResize, TableToolbar, TableProperties, TableCellProperties, TextTransformation,
            ...(this.LICENSE_KEY ? [SlashCommand] : []),
        ],
        licenseKey: this.LICENSE_KEY,
        toolbar: {
            items: [
                'undo', 'redo',
                '|',
                'heading',
                '|',
                'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
                '|',
                'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code',
                '|',
                'ckbox', 'insertTable', 'blockQuote', 'codeBlock',
                '|',
                'bulletedList', 'numberedList', 'todoList', 'alignment', 'outdent', 'indent',
                '|',
                'uploadImage',
                '|',
                'toggleImageCaption',
                '|',
                'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'resizeImage',
                '|',
                'tableColumn', 'tableRow', 'mergeTableCells'
            ],
            shouldNotGroupWhenFull: true
        },
        heading: {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph',
                },
                {
                    model: 'heading1',
                    view: 'h1',
                    title: 'Heading 1',
                    class: 'ck-heading_heading1',
                },
                {
                    model: 'heading2',
                    view: 'h2',
                    title: 'Heading 2',
                    class: 'ck-heading_heading2',
                },
                {
                    model: 'heading3',
                    view: 'h3',
                    title: 'Heading 3',
                    class: 'ck-heading_heading3',
                },
                {
                    model: 'heading4',
                    view: 'h4',
                    title: 'Heading 4',
                    class: 'ck-heading_heading4',
                },
            ],
        },
        image: {
            resizeOptions: [
                {
                    name: 'resizeImage:original',
                    label: 'Default image width',
                    value: null,
                },
                {
                    name: 'resizeImage:50',
                    label: '50% page width',
                    value: '50',
                },
                {
                    name: 'resizeImage:75',
                    label: '75% page width',
                    value: '75',
                },
            ],
        },
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
        },
        ckbox: {
            tokenUrl: this.CKBOX_TOKEN_URL,
        }
    }

    ngOnChanges(change: any) {
        if (change.notes) this.notes = change.notes.currentValue;
        if (change.isReadOnly) this.isReadOnly = change.isReadOnly.currentValue;
    }

    onChange({ editor }: ChangeEvent) {
        const data = editor.getData();
        this.sendNotes.emit(data);
    }
}
