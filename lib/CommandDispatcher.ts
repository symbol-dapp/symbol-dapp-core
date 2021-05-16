/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command} from "./Command";
import {Transaction, TransferTransaction} from "symbol-sdk";

type Handler<COMMAND extends Command> = (command: COMMAND) => void

export class CommandDispatcher {
    public readonly handlers = new Map<string, Handler<any>>();

    register<C extends Command>(type: string, handler: Handler<C>) {
        this.handlers.set(type, handler);
    }

    dispatch(transaction: Transaction) {
        const message = (transaction as TransferTransaction).message.payload;
        const command: Command = JSON.parse(message);
        const handler = this.handlers.get(command.type);
        if(handler) handler(command);
    }
}