import * as Shell from 'node-powershell';
import { readJSON } from 'fs-extra';
import { run } from './lib/run';
import { migrateVMStorage } from './lib/Migrate'
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

/* type ModeType = 'VMs' | 'Storage'
const Mode: ModeType = 'Storage' */

const Start = async () => {
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });

  await run(ps, 'Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false')
  await run(ps, `Connect-VIServer -Server ${URL} -Protocol https -Username ${username} -Password ${password}`);

  const VMs = await LoadVMsFile();

  for (const VM of VMs) await migrateVMStorage(ps, VM)

  console.log('Done');
  await ps.dispose();
};

Start();
