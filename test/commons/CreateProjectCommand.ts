/*
 * Copyright (c) 2021 Aleix Morgadas <aleix@symboldapp.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command} from "../../lib";
import {JOURNAL} from "./Constants";

export class CreateProjectCommand extends Command {
    static readonly TYPE = 'CreateProject';
    static readonly VERSION = 1;

    constructor(public readonly name: string) {
        super(name, JOURNAL, CreateProjectCommand.TYPE, CreateProjectCommand.VERSION)
    }
}