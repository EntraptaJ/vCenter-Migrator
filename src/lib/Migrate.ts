import * as Shell from 'node-powershell';
import { SLACK_WEB } from '../'
import { sendSlack } from './Slack'
import { VMsType } from '../types'
import { run } from './run'

const diffMinutes = (start: Date, end: Date) => ((end.getTime() - start.getTime()) / 1000 / 60).toFixed(2);;
type VMDirection = 'Original' | 'Temporary';

let Direction: VMDirection = process.env.MODE as VMDirection;

/**
 * 
 * @param ps PowerShell Shell Instance
 * @param VM VMs.json VM entry
 */
export const migrateVMStorage = async (ps: Shell, { originalStorage, tempStorage, name }: VMsType) => {
  const startTime = new Date()
  const dataStore = Direction === 'Original' ? originalStorage : tempStorage;
  console.log(`Migrating ${name} to ${dataStore}`);
  await run(ps, `Get-VM "${name}" | Move-VM -Datastore "${dataStore}"`);
  const endTime = new Date()
  if (SLACK_WEB) await sendSlack(`Migrating ${name} to ${dataStore} took ${diffMinutes(startTime, endTime)} minutes`)
}

export const migrateVM = async (ps: Shell, {}: any) => {
  const ResourcePool = ''
}