/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command} from "./Command";
import {AggregateTransaction, Message, MessageType, Transaction, TransactionType, TransferTransaction} from "symbol-sdk";
import { RawCommand } from "./RawCommand";

export type Handler<C> = (command: RawCommand<C>) => void

export class DispatchLog {
    constructor(
        public readonly transaction: Transaction,
        public readonly processed: boolean,
        public readonly reason?: string,) {
    }
}

export class CommandDispatcher {
    public readonly handlers = new Map<string, Handler<any>>();
    public readonly dispatchingLog = [] as DispatchLog[];

    register<C>(type: string, handler: Handler<C>) {
        this.handlers.set(type, handler);
    }

    dispatch(transaction: Transaction): boolean {
        if (transaction.type != TransactionType.TRANSFER && transaction.type != TransactionType.AGGREGATE_BONDED && transaction.type != TransactionType.AGGREGATE_COMPLETE) {
            this.dispatchingLog.push(new DispatchLog(transaction, false, 'Only Transfer or Aggregate Transactions Supported'))
            return false;
        };
        if (transaction.type === TransactionType.TRANSFER) {
            return this.dispatchSingle(transaction as TransferTransaction);
        }
        if (transaction.type === TransactionType.AGGREGATE_BONDED || transaction.type === TransactionType.AGGREGATE_COMPLETE) {
            const transactions = (transaction as AggregateTransaction).innerTransactions;
            var oneReturned = false;
            transactions.forEach(transaction => {
                if (transaction.type === TransactionType.TRANSFER) {
                    const result = this.dispatchSingle(transaction as TransferTransaction)
                    if (result) {
                        oneReturned = true;
                    }
                }
            });
            return oneReturned;
        }
        return false;
    }

    private dispatchSingle(transaction: TransferTransaction): boolean {
        const { error, command } = this.extractCommand(transaction);
        if (error) {
            this.dispatchingLog.push(error);
            return false;
        }
        const handler = this.handlers.get(command!.type);
        if(handler) {
            this.dispatchingLog.push(new DispatchLog(transaction, true,))
            handler(command!);
            return true;
        }
        return false;
    }

    private extractCommand(transaction: TransferTransaction): {error?: DispatchLog, command?: RawCommand<any> } {
        if (transaction.message.type == MessageType.EncryptedMessage) {
            return {
                error: new DispatchLog(transaction, false, 'Encrypted Payloads Not Supported'),
                command: undefined
            }
        }
        if (transaction.message.payload === '') {
            return {
                error: new DispatchLog(transaction, false, 'Transfer Transaction does not contain a Command payload'),
                command: undefined
            }
        }
        try {
            const command = JSON.parse(transaction.message.payload);
            const keys = Object.keys(command);
            if(['id', 'type', 'version', 'data'].some(key => !keys.includes(key))) {
                return {
                    error: new DispatchLog(transaction, false, 'Invalid Command Payload'),
                    command: undefined
                }
            }
            return {
                error: undefined,
                command: {...command, signer: transaction.signer! }
            }
        } catch (e) {
            return {
                error: new DispatchLog(transaction, false, 'Transfer Transaction does not contain a Command payload'),
                command: undefined
            }
        }  
    }
}
