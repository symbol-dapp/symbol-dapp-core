/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command} from "./Command";
import {Message, MessageType, Transaction, TransactionType, TransferTransaction} from "symbol-sdk";

type Handler<COMMAND extends Command<any>> = (command: COMMAND) => void

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

    register<C extends Command<any>>(type: string, handler: Handler<C>) {
        this.handlers.set(type, handler);
    }

    dispatch(transaction: Transaction) {
        if (transaction.type != TransactionType.TRANSFER) {
            this.dispatchingLog.push(new DispatchLog(transaction, false, 'Only Transfer Transactions Supported'))
            return;
        };
        const transferTransaction = transaction as TransferTransaction;
        const { error, command } = this.extractCommand(transferTransaction);
        if (error) {
            this.dispatchingLog.push(error);
            return;
        }
        const handler = this.handlers.get(command!.type);
        if(handler) {
            this.dispatchingLog.push(new DispatchLog(transaction, true,))
            handler(command);
        }
    }

    private extractCommand(transaction: TransferTransaction): {error?: DispatchLog, command?: Command<any> } {
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
            command: command
        }
    }
}
