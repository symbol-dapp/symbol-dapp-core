import { Mosaic, NamespaceId, PublicAccount, UInt64 } from 'symbol-sdk';
import { AggregateCommand } from '../../lib/AggregateCommand';
import {JOURNAL} from "./Constants";
import { CreateProjectCommand } from './CreateProjectCommand';
import { DonationCommand } from './DonationCommand';

export class CreatePlusDonationCommand extends AggregateCommand{
  static readonly TYPE = 'CreatePlusDonationCommand';
  static readonly VERSION = 1;

  public static of(name: string, signer: PublicAccount): CreatePlusDonationCommand {
    const create = CreateProjectCommand.of(name);
    const donation = DonationCommand.of(name, [new Mosaic(new NamespaceId('symbol.xym'), UInt64.fromUint(100))]);
    return new CreatePlusDonationCommand(name, JOURNAL, CreatePlusDonationCommand.TYPE, CreatePlusDonationCommand.VERSION, [create, donation], signer);
  }
}
