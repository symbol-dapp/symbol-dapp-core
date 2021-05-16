/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Address, NetworkType} from "symbol-sdk";
import {sha3_256} from "js-sha3";

export const EPOCH_ADJUSTMENT = 1573430400;
export const NETWORK = NetworkType.TEST_NET;
export const JOURNAL = Address.createFromPublicKey(sha3_256('symbol-dapp'), NETWORK)