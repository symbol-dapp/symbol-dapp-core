/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Address,
    Deadline,
    Mosaic,
    NamespaceId,
    NetworkType,
    PlainMessage,
    Transaction,
    TransferTransaction,
    UInt64
} from "symbol-sdk";

export abstract class Command<DATA> {
    constructor(public readonly id: string,
                public readonly journal: Address,
                public readonly type: string,
                public readonly version: number,
                public readonly data: DATA,
                public readonly signer: Address | undefined = undefined) {
    }

    abstract toTransaction(epochAdjustment: number, networkType: NetworkType): Transaction;
}
