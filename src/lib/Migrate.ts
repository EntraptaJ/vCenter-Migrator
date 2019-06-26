import * as Shell from 'node-powershell';
import { VMsType } from '../types'
import { run } from './run'

type VMDirection = 'Original' | 'Temporary';

let Direction: VMDirection = process.env.MODE as VMDirection;


export const migrateVMStorage = async (ps: Shell, { originalStorage, tempStorage }: VMsType) => {
  const dataStore = Direction === 'Original' ? originalStorage : tempStorage;
  console.log(`Migrating ${name} to ${dataStore}`);
  await run(ps, `Get-VM "${name}" | Move-VM -Datastore "${dataStore}"`);
}

export const migrateVM = async (ps: Shell, {}: any) => {
  const ResourcePool = ''
}