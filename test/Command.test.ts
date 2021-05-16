/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command} from "../lib";
import {MessageType, TransferTransaction} from "symbol-sdk";
import {EPOCH_ADJUSTMENT, JOURNAL, NETWORK} from "./commons/Constants";

describe('Command', () => {
    const PROJECT_NAME = 'Symbol-Dapp-Framework'

    test('ensuring it contains the required spec', () => {
        const command = new CreateProjectCommand(PROJECT_NAME);

        expect(command.id).toBe(PROJECT_NAME);
        expect(command.type).toBe('CreateProject');
        expect(command.version).toBe(1);
        expect(command.name).toBe(PROJECT_NAME);
    });

    test('toTransaction wraps the Command into a TransferTransaction', () => {
        const command = new CreateProjectCommand(PROJECT_NAME);

        const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK) as TransferTransaction;

        expect(transaction.message.type).toBe(MessageType.PlainMessage);
        expect(transaction.message.payload).toBe(JSON.stringify({
            id: PROJECT_NAME,
            journal: command.journal,
            type: 'CreateProject',
            version: 1,
            name: PROJECT_NAME
        }))
    });
})

class CreateProjectCommand extends Command {
    static readonly TYPE = 'CreateProject';
    static readonly VERSION = 1;

    constructor(public readonly name: string) {
        super(name, JOURNAL, CreateProjectCommand.TYPE, CreateProjectCommand.VERSION)
    }
}