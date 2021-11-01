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
  PublicAccount,
  Transaction,
  TransferTransaction,
  UInt64
} from "symbol-sdk";
import { Command } from ".";

export abstract class MosaicCommand<DATA> extends Command<DATA> {
  constructor(public readonly id: string,
              public readonly journal: Address,
              public readonly type: string,
              public readonly version: number,
              public readonly data: DATA,
              public readonly mosaics: Mosaic[],
              public readonly signer: PublicAccount | undefined = undefined) {
    super(id, journal, type, version, data, signer);
  }

  public toTransaction(epochAdjustment: number, networkType: NetworkType): Transaction {
      const command = Object.assign({}, this, {journal: undefined, singer: undefined, mosaics: undefined });
      return TransferTransaction.create(
          Deadline.create(epochAdjustment),
          this.journal,
          this.mosaics,
          PlainMessage.create(JSON.stringify(command)),
          networkType,
      )
  }
}
