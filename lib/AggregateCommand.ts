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

export abstract class AggregateCommand {
  constructor(public readonly commands: Command<any>[],
              public readonly signer: PublicAccount) {
  }

  public toTransaction(epochAdjustment: number, networkType: NetworkType): Transaction {
      return AggregateTransaction.createComplete(
        Deadline.create(epochAdjustment),
        this.commands.map(command => command.toTransaction(epochAdjustment, networkType).toAggregate(this.signer)),
        networkType,
        [],
        UInt64.fromUint(15000)
      );
  }
}
