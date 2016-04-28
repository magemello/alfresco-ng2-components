import { DocumentList } from './document-list';
import { ContentActionModel } from './../models/content-action.model';
export declare class DocumentActionList {
    private documentList;
    constructor(documentList: DocumentList);
    registerAction(action: ContentActionModel): void;
}
