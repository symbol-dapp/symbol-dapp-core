import { PublicAccount } from "symbol-sdk";

export interface RawCommand<DATA> {
    id: string,
    type: string,
    version: number,
    data: DATA,
    signer: PublicAccount
}