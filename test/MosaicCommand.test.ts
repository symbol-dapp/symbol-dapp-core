/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Account, MessageType, Mosaic, NamespaceId, NetworkType, Transaction, TransferTransaction, UInt64} from "symbol-sdk";
import {EPOCH_ADJUSTMENT, GENERATION_HASH, NETWORK} from "./commons/Constants";
import { DonationCommand } from "./commons/DonationCommand";

describe('MosaicCommand', () => {
    const PROJECT_NAME = 'Symbol-Dapp-Framework'
    const MOSAICS = [new Mosaic(new NamespaceId('symbol.xym'), UInt64.fromUint(100))];

    test('ensuring it contains the required spec', () => {
        
        const command = DonationCommand.of(PROJECT_NAME, MOSAICS);

        expect(command.id).toBe(PROJECT_NAME);
        expect(command.type).toBe('Donation');
        expect(command.version).toBe(1);
        expect(command.data).toBe(PROJECT_NAME);
        expect(command.mosaics).toStrictEqual(MOSAICS);
    });

    test('toTransaction wraps the Command into a TransferTransaction', () => {
        const command = DonationCommand.of(PROJECT_NAME, MOSAICS);

        const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK) as TransferTransaction;

        expect(transaction.message.type).toBe(MessageType.PlainMessage);
        expect(transaction.message.payload).toBe(JSON.stringify({
            id: PROJECT_NAME,
            type: 'Donation',
            version: 1,
            data: PROJECT_NAME
        }))
    });

    test('fromTransaction transforms Transaction to DonationCommand', () => {
        const account = Account.generateNewAccount(NetworkType.TEST_NET);
        const command = DonationCommand.of(PROJECT_NAME, MOSAICS);
        const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK);

        const signedTransaction = TransferTransaction.createFromPayload(account.sign(transaction, GENERATION_HASH).payload, false);

        const commandFromTransaction = DonationCommand.fromTransaction(signedTransaction as TransferTransaction);

        expect(commandFromTransaction.version).toBe(DonationCommand.VERSION);
        expect(commandFromTransaction.type).toBe(DonationCommand.TYPE);
        expect(commandFromTransaction.id).toBe(PROJECT_NAME);
        expect(commandFromTransaction.data).toBe(PROJECT_NAME);
        expect(commandFromTransaction.mosaics).toHaveLength(1);
        expect(commandFromTransaction.signer?.address.pretty()).toBe(account.address.pretty());
    })
})
