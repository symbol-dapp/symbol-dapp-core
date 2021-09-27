/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Account, AggregateTransaction, Deadline, EncryptedMessage, NetworkType, PlainMessage, TransferTransaction } from "symbol-sdk";
import {CommandDispatcher, DispatchLog, Handler} from "../lib";
import {CreateProjectCommand} from "./commons/CreateProjectCommand";
import {EPOCH_ADJUSTMENT, NETWORK} from "./commons/Constants";
import { RawCommand } from "../lib/RawCommand";

describe('CommandDispatcher', () => {
    const ACCOUNT = Account.generateNewAccount(NetworkType.TEST_NET);

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

        const dispatched = commandDispatcher.dispatch(transaction);

        expect(dispatched).toBeTruthy();
        expect(beingCalled).toBeTruthy();
        expect(expectedCommandParameters).toBeTruthy();
        expect(commandDispatcher.dispatchingLog[0])
            .toStrictEqual(new DispatchLog(transaction, true,))
    });


    test('Command Handler dispatches the Command Wrapped into a Aggregate Transaction into the CommandHandler', () => {
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
        
        const aggregateTransaction = AggregateTransaction.createBonded(
            Deadline.create(EPOCH_ADJUSTMENT),
            [transaction.toAggregate(ACCOUNT.publicAccount)],
            NetworkType.TEST_NET,
        );

        const dispatched = commandDispatcher.dispatch(aggregateTransaction);

        expect(dispatched).toBeTruthy();
        expect(beingCalled).toBeTruthy();
        expect(expectedCommandParameters).toBeTruthy();
        expect(commandDispatcher.dispatchingLog).toHaveLength(1);
    });

    describe('Command Handler ignore non Commands Transactions', () => {
        test.skip('Transaction not being a Transfer Transaction', () => {
            const commandDispatcher = new CommandDispatcher();
    
            const aggregateTransaction = AggregateTransaction.createComplete(
                Deadline.create(EPOCH_ADJUSTMENT),
                [],
                NETWORK,
                []
            );
    
            expect(() => {
                const dispatched = commandDispatcher.dispatch(aggregateTransaction);
                expect(dispatched).toBeFalsy();
            }).not.toThrow();
            expect(commandDispatcher.dispatchingLog[0])
                .toStrictEqual(new DispatchLog(aggregateTransaction, false, 'Only Transfer or Aggregate Transactions Supported'))
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
