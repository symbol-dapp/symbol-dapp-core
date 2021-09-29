/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {PlainCommand} from "../../lib";
import {JOURNAL} from "./Constants";
import {MessageType, Transaction, TransferTransaction} from "symbol-sdk";

export class CreateProjectCommand extends PlainCommand<string> {
    static readonly TYPE = 'CreateProject';
    static readonly VERSION = 1;

    public static of(name: string): CreateProjectCommand {
        return new CreateProjectCommand(name, JOURNAL, CreateProjectCommand.TYPE, CreateProjectCommand.VERSION, name);
    }

    public static fromTransaction(transaction: TransferTransaction): CreateProjectCommand {
        const command: PlainCommand<string> = JSON.parse(transaction.message.payload);
        return new CreateProjectCommand(command.id, command.journal, command.type, command.version, command.data, transaction.signer);
    }
}
