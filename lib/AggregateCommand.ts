/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  NetworkType,
  PublicAccount,
  Transaction,
  UInt64,
} from "symbol-sdk";
import { Command } from ".";

export abstract class AggregateCommand extends Command<Command<any>[]> {
  constructor(public readonly id: string,
              public readonly journal: Address,
              public readonly type: string,
              public readonly version: number,
              public readonly data: Command<any>[],
              public readonly signer: PublicAccount) {
    super(id, journal, type, version, data, signer);
  }

  private account = Account.createFromPrivateKey('ABB4960660ED05F49A9D07C2D061C2BE304859C98652B8E2E3C37010C87D7A6A', NetworkType.TEST_NET);

  public toTransaction(epochAdjustment: number, networkType: NetworkType): Transaction {
      return AggregateTransaction.createComplete(
        Deadline.create(epochAdjustment),
        this.data
          .map(commands => commands.toTransaction(epochAdjustment, networkType).toAggregate(this.signer)),
        networkType,
        [],
        UInt64.fromUint(200000)
      );
  }
}
