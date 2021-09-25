/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CommandDispatcher, DispatchLog, Handler} from "../lib";
import {CreateProjectCommand} from "./commons/CreateProjectCommand";
import {EPOCH_ADJUSTMENT, NETWORK} from "./commons/Constants";
import { Account, AggregateTransaction, Deadline, EncryptedMessage, Message, NetworkType, PlainMessage } from "symbol-sdk";
import { TransferTransaction } from "symbol-sdk/dist/src/model/transaction/TransferTransaction";
import { RawCommand } from "../lib/RawCommand";

describe('CommandDispatcher', () => {

    test('Registers a Command Handler', () => {
        const commandDispatcher = new CommandDispatcher();
        const handler = (command: RawCommand<string>) => {
        };
        commandDispatcher.register(CreateProjectCommand.TYPE, handler);

        expect(commandDispatcher.handlers.has(CreateProjectCommand.TYPE)).toBeDefined();
    });

    test('Command Handler dispatches the Command Wrapped into the Transaction into the CommandHandler', () => {
        const commandDispatcher = new CommandDispatcher();
        let beingCalled = false;
        let expectedCommandParameters = false;
        const handler  = (_: RawCommand<string>) => {
            beingCalled = true;
            if (_.type === CreateProjectCommand.TYPE &&
                _.version === CreateProjectCommand.VERSION &&
                _.id === 'Symbol-Dapp' &&
                _.data === 'Symbol-Dapp'
            ) {
                expectedCommandParameters = true;
            }
        };
        commandDispatcher.register(CreateProjectCommand.TYPE, handler);
        const transaction = CreateProjectCommand.of('Symbol-Dapp').toTransaction(EPOCH_ADJUSTMENT, NETWORK);

        commandDispatcher.dispatch(transaction);

        expect(beingCalled).toBeTruthy();
        expect(expectedCommandParameters).toBeTruthy();
        expect(commandDispatcher.dispatchingLog[0])
            .toStrictEqual(new DispatchLog(transaction, true,))
    });

    describe('Command Handler ignore non Commands Transactions', () => {
        test('Transaction not being a Transfer Transaction', () => {
            const commandDispatcher = new CommandDispatcher();
    
            const aggregateTransaction = AggregateTransaction.createComplete(
                Deadline.create(EPOCH_ADJUSTMENT),
                [],
                NETWORK,
                []
            );
    
            expect(() => commandDispatcher.dispatch(aggregateTransaction)).not.toThrow();
            expect(commandDispatcher.dispatchingLog[0])
                .toStrictEqual(new DispatchLog(aggregateTransaction, false, 'Only Transfer Transactions Supported'))
        });

        test('Transfer Transaction not containing any message', () => {
            const commandDispatcher = new CommandDispatcher();
            const account = Account.generateNewAccount(NetworkType.TEST_NET);
            
            const transaction = TransferTransaction.create(
                Deadline.create(EPOCH_ADJUSTMENT),
                account.address,
                [],
                PlainMessage.create(''),
                NETWORK
            );
    
            expect(() => commandDispatcher.dispatch(transaction)).not.toThrow();
            expect(commandDispatcher.dispatchingLog[0])
                .toStrictEqual(new DispatchLog(transaction, false, 'Transfer Transaction does not contain a Command payload'))
        });

        test('Transfer Transaction containing a encrypted message', () => {
            const commandDispatcher = new CommandDispatcher();
            const account = Account.generateNewAccount(NetworkType.TEST_NET);
            
            const transaction = TransferTransaction.create(
                Deadline.create(EPOCH_ADJUSTMENT),
                account.address,
                [],
                EncryptedMessage.create('encrypted message', account.publicAccount, account.privateKey),
                NETWORK
            );
    
            expect(() => commandDispatcher.dispatch(transaction)).not.toThrow();
            expect(commandDispatcher.dispatchingLog[0])
                .toStrictEqual(new DispatchLog(transaction, false, 'Encrypted Payloads Not Supported'));
        });

        describe('Command Schema Validation', () => {
            ['id', 'type', 'version', 'data',]
                .forEach(key => test(`should not dispatch when ${key} is missing`, () => {
                    const commandDispatcher = new CommandDispatcher();
                    const command = CreateProjectCommand.of('Symbol-Dapp');
                    delete (command as any)[key];
                    const transaction = command.toTransaction(EPOCH_ADJUSTMENT, NETWORK);
                    
                    expect(() => commandDispatcher.dispatch(transaction)).not.toThrow();
                    expect(commandDispatcher.dispatchingLog[0])
                        .toStrictEqual(new DispatchLog(transaction, false, `Invalid Command Payload`))
            }))
        })
    })
})
