/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Account, Mosaic, NamespaceId, NetworkType, TransactionType, UInt64} from "symbol-sdk";
import {EPOCH_ADJUSTMENT, NETWORK} from "./commons/Constants";
import { CreatePlusDonationCommand } from "./commons/CreationPlusDonationCommand";

describe('AggregateCommand', () => {
    const PROJECT_NAME = 'Symbol-Dapp-Framework'
    const MOSAICS = [new Mosaic(new NamespaceId('symbol.xym'), UInt64.fromUint(100))];
    const PUBLIC_ACCOUNT = Account.generateNewAccount(NetworkType.TEST_NET).publicAccount;

    test('ensuring it contains the required spec', () => {
        const command = CreatePlusDonationCommand.of(PROJECT_NAME, PUBLIC_ACCOUNT);

        expect(command.id).toBe(PROJECT_NAME);
        expect(command.type).toBe('CreatePlusDonationCommand');
        expect(command.version).toBe(1);
        expect(command.data).toHaveLength(2);
    });

    test('toTransaction wraps the Command into a TransferTransaction', () => {
        const command = CreatePlusDonationCommand.of(PROJECT_NAME, PUBLIC_ACCOUNT);

        const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK);
        
        expect(transaction.type).toBe(TransactionType.AGGREGATE_COMPLETE);
    });
})
