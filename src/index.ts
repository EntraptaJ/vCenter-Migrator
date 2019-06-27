import Shell from 'node-powershell';
import { createTypedSlackWebClient, TypedWebClient } from 'typed-slack-client'
import { readJSON } from 'fs-extra';
import { run } from './lib/run';
import { migrateVMStorage, migrateVM } from './lib/Migrate'
import { VMsType, DataJSON, HostType } from './types';
import { sendSlack } from './lib/Slack';

const LoadJSON = <P>(file: string): Promise<P> => readJSON(file);

const LoadVMsFile = async () => {
  const VMs: VMsType[] = [];
  const Hosts: HostType[] = []
  const { data } = await LoadJSON<DataJSON>('/VMs.json');
  data.Hosts.map(({ name, temporaryHost, ...host }) => {
    Hosts.push({ name, temporaryHost  })
    host.VMs.map(vm => VMs.push(vm))
  });
  return { VMs, Hosts };
};

const URL = process.env.URL;
const username = process.env.USER;
const password = process.env.PASS;

type ModeType = 'VMs' | 'Storage'
let Mode = process.env.TYPE as ModeType

export let SLACK_WEB: TypedWebClient

const Start = async () => {
  // Initialize
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });
  if (process.env.SLACK_TOKEN) SLACK_WEB = createTypedSlackWebClient(process.env.SLACK_TOKEN)

  await run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false')
  await run(ps, `Connect-VIServer -Server ${URL} -Protocol https -Username ${username} -Password ${password}`);

  const { VMs, Hosts } = await LoadVMsFile();

  if (Mode === 'Storage') for (const VM of VMs) await migrateVMStorage(ps, VM)
  else if (Mode === 'VMs') for (const Host of Hosts) await migrateVM(ps, Host)

  if (SLACK_WEB) sendSlack('Migrations done')

  console.log('Done');
  await ps.dispose();
};

Start();
