/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {MosaicCommand} from "../../lib";
import {JOURNAL} from "./Constants";
import {Mosaic, TransferTransaction} from "symbol-sdk";

export class DonationCommand extends MosaicCommand<string> {
    static readonly TYPE = 'Donation';
    static readonly VERSION = 1;

    public static of(name: string, mosaics: Mosaic[]): DonationCommand {
        return new DonationCommand(name, JOURNAL, DonationCommand.TYPE, DonationCommand.VERSION, name, mosaics);
    }

    public static fromTransaction(transaction: TransferTransaction): DonationCommand {
        const command: MosaicCommand<string> = JSON.parse(transaction.message.payload);
        return new DonationCommand(command.id, command.journal, command.type, command.version, command.data, transaction.mosaics, transaction.signer);
    }
}
