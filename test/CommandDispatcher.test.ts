/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CommandDispatcher} from "../lib";
import {CreateProjectCommand} from "./commons/CreateProjectCommand";
import {EPOCH_ADJUSTMENT, NETWORK} from "./commons/Constants";

describe('CommandDispatcher', () => {

    test('Registers a Command Handler', () => {
        const commandDispatcher = new CommandDispatcher();
        const handler = (_: CreateProjectCommand) => {
        };
        commandDispatcher.register(CreateProjectCommand.TYPE, handler);

        expect(commandDispatcher.handlers.has(CreateProjectCommand.TYPE)).toBeDefined();
    });

    test('Command Handler dispatches the Command Wrapped into the Transaction into the CommandHandler', () => {
        const commandDispatcher = new CommandDispatcher();
        let beingCalled = false;
        let expectedCommandParameters = false;
        const handler = (_: CreateProjectCommand) => {
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
    })
})
