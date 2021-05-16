/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Address, Deadline, NetworkType, PlainMessage, Transaction, TransferTransaction} from "symbol-sdk";

export abstract class Command {
    constructor(public readonly id: String,
                public readonly journal: Address,
                public readonly type: String,
                public readonly version: number) {
    }

    public toTransaction(epochAdjustment: number, networkType: NetworkType): Transaction {
        return TransferTransaction.create(
            Deadline.create(epochAdjustment),
            this.journal,
            [],
            PlainMessage.create(JSON.stringify(this)),
            networkType,
        )
    }
}