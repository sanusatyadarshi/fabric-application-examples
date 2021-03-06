
import { Context } from 'fabric-contract-api';

// Utility classes
import ISerializer from '../ledger-api/serializer';
import StateSerializerFactory from '../ledger-api/StateSerializerFactory';
import { CommercialPaper } from './paper';
import { PaperList } from './paperlist';

/**
 * Define custom context for commercial paper by extending Fabric ContractAPI's Context class
 */
export default class CommercialPaperContext extends Context {

    public cpList: PaperList;
    public transactionSerializer: ISerializer;

    constructor() {
        super();
        this.cpList = new PaperList(this);
        this.transactionSerializer = StateSerializerFactory.getTransactionSerializer();
    }

    /** should be pushed into 'chaincode from contract' class so that the code just returned what it needs to */
    public returnPaper(paper: CommercialPaper): Buffer {
        return this.transactionSerializer.toBuffer(paper);
    }
}
