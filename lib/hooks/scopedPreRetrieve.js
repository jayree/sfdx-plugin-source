import { env } from '@salesforce/kit';
import Debug from 'debug';
// eslint-disable-next-line @typescript-eslint/require-await
export const scopedPreRetrieve = async function (options) {
    const debug = Debug([this.config.bin, '@jayree/sfdx-plugin-source', 'hooks', 'scopedPreRetrieve'].join(':'));
    debug(`called by: ${options.Command.id}`);
    env.setBoolean('SFDX_DISABLE_PRETTIER', true);
    debug('set: SFDX_DISABLE_PRETTIER=true');
};
//# sourceMappingURL=scopedPreRetrieve.js.map