import * as Shell from 'node-powershell';
import { run } from './lib/run';
import { readJSON } from 'fs-extra';
import { VMsType, DataJSON } from './types';

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

type VMDirection = 'Original' | 'Temporary';
let Direction: VMDirection = process.env.MODE as VMDirection;

const Start = async () => {
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });

  await run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false')
  await run(ps, `Connect-VIServer -Server ${URL} -Protocol https -Username ${username} -Password ${password}`);

  const VMs = await LoadVMsFile();

  for (const { name, originalStorage, tempStorage } of VMs) {
    const dataStore = Direction === 'Original' ? originalStorage : tempStorage;
    console.log(`Migrating ${name} to ${dataStore}`);
    await run(ps, `Get-VM ${name} | Move-VM -Datastore ${dataStore}`);
  }

  console.log('Done');
  await ps.dispose();
};

Start();
