import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';
import { ProductImporter } from '../../../../lib/ProductImporter';
import {getJsforceConnection } from '../../../../lib/jsforceHelper';
import { Connection } from 'jsforce';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('enxoo', 'org');

export default class Org extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  protected static flagsConfig = {
    // flag with a value (-p, --product=VALUE)
    products: flags.array({char: 'p', required: true, description: messages.getMessage('productsFlagDescription')}),
    b2b: flags.boolean({char: 'b', required: false, description: messages.getMessage('b2bFlagDescription')}),
    related: flags.boolean({char: 'r', required: false, description: messages.getMessage('relatedFlagDescription')}),
    dir: flags.string({char: 'd', required: true, description: messages.getMessage('dirFlagDescription')}),
    currencies: flags.array({char: 'c', required: false, description: messages.getMessage('currenciesFlagDescription')})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    let conn: Connection;
    conn = await getJsforceConnection(this.org.getConnection().getConnectionOptions());
    let userName = this.org.getUsername();

    conn.bulk.pollInterval = 5000; // 5 sec
    conn.bulk.pollTimeout = 6000000; //6000 sec
    const [products, b2b, dir, currencies] = [this.flags.products, this.flags.b2b, this.flags.dir, this.flags.currencies]

    this.ux.log('*** Begin Importing ' + (products[0] === '*ALL' ? 'all' : products) + ' products ***');

    const importer = new ProductImporter(products, b2b, dir, userName, currencies);
    await importer.all(conn);

    this.ux.log('*** Finished ***');
    
    return null;
  }
}
