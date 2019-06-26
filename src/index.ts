import * as Shell from 'node-powershell';
import { WebClient } from '@slack/web-api'
import { readJSON } from 'fs-extra';
import { run } from './lib/run';
import { migrateVMStorage } from './lib/Migrate'
import { VMsType, DataJSON } from './types';
import { sendSlack } from './lib/Slack';

const LoadJSON = <P>(file: string): Promise<P> => readJSON(file);

const LoadVMsFile = async () => {
  const VMs: VMsType[] = [];
  const { data } = await LoadJSON<DataJSON>('/VMs.json');
  data.Hosts.map(host => host.VMs.map(vm => VMs.push(vm)));
  return VMs;
};

const URL = process.env.URL;
const username = process.env.USER;
const password = process.env.PASS;

/* type ModeType = 'VMs' | 'Storage'
const Mode: ModeType = 'Storage' */
export let SLACK_WEB: WebClient

const Start = async () => {
  // Initialize
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });
  if (process.env.SLACK_TOKEN) SLACK_WEB = new WebClient(process.env.SLACK_TOKEN);

  await run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false')
  await run(ps, `Connect-VIServer -Server ${URL} -Protocol https -Username ${username} -Password ${password}`);

  const VMs = await LoadVMsFile();

  for (const VM of VMs) await migrateVMStorage(ps, VM)

  if (SLACK_WEB) sendSlack('Migrations done')

  console.log('Done');
  await ps.dispose();
};

Start();
