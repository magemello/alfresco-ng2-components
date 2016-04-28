import {DocumentList} from './src/components/document-list';
import {DocumentAction} from './src/components/document-action';
import {DocumentActionList} from './src/components/document-action-list';
import {QuickDocumentAction} from './src/components/quick-document-action';
import {QuickDocumentActionList} from './src/components/quick-document-action-list';
import {FolderAction} from './src/components/folder-action';
import {FolderActionList} from './src/components/folder-action-list';
import {QuickFolderAction} from './src/components/quick-folder-action';
import {QuickFolderActionList} from './src/components/quick-folder-action-list';

export * from './src/components/document-list';
export * from './src/components/document-action';
export * from './src/components/document-action-list';
export * from './src/components/quick-document-action';
export * from './src/components/quick-document-action-list';
export * from './src/components/folder-action';
export * from './src/components/folder-action-list';
export * from './src/components/quick-folder-action'
export * from './src/components/quick-folder-action-list';

export default {
    directives: [
        DocumentList,
        DocumentAction,
        DocumentActionList,
        QuickDocumentAction,
        QuickDocumentActionList,
        FolderAction,
        FolderActionList,
        QuickFolderAction,
        QuickFolderActionList
    ],
    providers: []
}

export const DOCUMENT_LIST_DIRECTIVES: [any] = [
    DocumentList,
    DocumentAction,
    DocumentActionList,
    QuickDocumentAction,
    QuickDocumentActionList,
    FolderAction,
    FolderActionList,
    QuickFolderAction,
    QuickFolderActionList
];
