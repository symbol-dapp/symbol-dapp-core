/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Account, MessageType, NetworkType, Transaction, TransferTransaction} from "symbol-sdk";
import {EPOCH_ADJUSTMENT, GENERATION_HASH, NETWORK} from "./commons/Constants";
import {CreateProjectCommand} from "./commons/CreateProjectCommand";

describe('Command', () => {
    const PROJECT_NAME = 'Symbol-Dapp-Framework'

    test('ensuring it contains the required spec', () => {
        const command = CreateProjectCommand.of(PROJECT_NAME);

        expect(command.id).toBe(PROJECT_NAME);
        expect(command.type).toBe('CreateProject');
        expect(command.version).toBe(1);
        expect(command.data).toBe(PROJECT_NAME);
    });

    test('toTransaction wraps the Command into a TransferTransaction', () => {
        const command = CreateProjectCommand.of(PROJECT_NAME);

        const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK) as TransferTransaction;

        expect(transaction.message.type).toBe(MessageType.PlainMessage);
        expect(transaction.message.payload).toBe(JSON.stringify({
            id: PROJECT_NAME,
            type: 'CreateProject',
            version: 1,
            data: PROJECT_NAME
        }))
    });

    test('fromTransaction transforms Transaction to CreateProjectCommand', () => {
        const account = Account.generateNewAccount(NetworkType.TEST_NET);
        const command = CreateProjectCommand.of(PROJECT_NAME);
        const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK);

        const signedTransaction = TransferTransaction.createFromPayload(account.sign(transaction, GENERATION_HASH).payload, false);

        const commandFromTransaction = CreateProjectCommand.fromTransaction(signedTransaction as TransferTransaction);

        expect(commandFromTransaction.version).toBe(CreateProjectCommand.VERSION);
        expect(commandFromTransaction.type).toBe(CreateProjectCommand.TYPE);
        expect(commandFromTransaction.id).toBe(PROJECT_NAME);
        expect(commandFromTransaction.data).toBe(PROJECT_NAME);
        expect(commandFromTransaction.signer?.pretty()).toBe(account.address.pretty());
    })
})
