import fsp from 'fs-promise';
import { spawn } from 'child-process-promise';

const logger = console;

/**
 * Wait for spawn to complete.
 *
 * @param {Promise} promise the promise to wait for
 *
 * @returns {undefined}
 */
async function waitFor(promise) {
  try {
    const child = promise.childProcess;

    child.stdout.on('data', (data) => {
      logger.log(data.toString());
    });
    child.stderr.on('data', (data) => {
      logger.log(data.toString());
    });

    return promise;
  } catch (error) {
    logger.error(error, promise.child);

    return promise;
  }
}

/**
 * Retrieves stack Ouputs from AWS.
 *
 * @returns {undefined}
 */
export default async function deploy() {
  try {
    this.logger.log('Deploying Application to ElasticBeanstalk...');

    const configPath = `${process.cwd()}/.serverless/stack-config.json`;

    const config = await fsp.readJson(configPath);

    const applicationEnvironment = config[this.config.variables.applicationEnvironmentName];

    process.env.PATH = `/root/.local/bin:${process.env.PATH}`;


    await waitFor(spawn('git', ['add', 'config/config.json']));

    await waitFor(spawn('eb', ['deploy', applicationEnvironment, '--process', '--staged']));
  } catch (error) {
    this.logger.log(error);

    throw error;
  }
}
