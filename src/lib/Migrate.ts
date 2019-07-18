import Shell from 'node-powershell';
import { SLACK_WEB } from '../';
import { sendSlack, updateSlack, progressAttachment, successAttachment, errorAttachment } from './Slack';
import { VMsType, HostType } from '../types';
import { run } from './run';
import { MessageAttachment } from '@slack/types';

const diffMinutes = (start: Date, end: Date) => ((end.getTime() - start.getTime()) / 1000 / 60).toFixed(2);

type VMDirection = 'Original' | 'Temporary';

let Direction: VMDirection = process.env.MODE as VMDirection;

let MSGID: string;



const checkExists = async (ps: Shell, name: string, type: 'VMs' | 'Storage') => {
  const searchResponse = await run(ps, `${type === 'VMs' ? 'Get-VM' : 'Get-Datastore'} -Name "${name}" -ErrorAction Ignore`)
  return searchResponse.length > 0
}

/**
 * Migrates the storage of VM to or from Original or Temporary datastore depending on global mode
 * @param ps PowerShell Shell Instance
 * @param VM VMs.json VM entry
 */
export const migrateVMStorage = async (ps: Shell, { originalStorage, tempStorage, name }: VMsType) => {
  // Current time
  const startTime = new Date();

  // If direction is original then return the name of original storage otherwise return temp. Not full proof but it works.
  const dataStore = Direction === 'Original' ? originalStorage : tempStorage;

  const vmExists = await checkExists(ps, name, 'VMs');
  const dsExists = await checkExists(ps, dataStore, 'Storage');

  const actionMessage = `Migrating ${name} to ${dataStore}`;

  // If Slack is enabled then post a message notifiying that Migration is about to commence.
  if (SLACK_WEB) MSGID = (await sendSlack(actionMessage, [progressAttachment('Migrating VM…')])).message.ts;

  console.log(actionMessage);

  if (!vmExists || !dsExists) {
    const responses: MessageAttachment[] = []
    if (!vmExists) {
      console.error(`VM ${name} doesn't exist.`)
      if (SLACK_WEB) responses.push(errorAttachment(`VM ${name} does not exist in vCenter`))
    }
    if (!dsExists) {
      console.error(`Datastore ${dataStore} doesn't exist.`)
      if (SLACK_WEB) responses.push(errorAttachment(`Datastore ${dataStore} does not exist in vCenter`))
    }
    if (SLACK_WEB) updateSlack(MSGID, actionMessage, responses)
    return;
  }

  // Move VM name to the dataStore.
  await run(ps, `Get-VM "${name}" | Move-VM -Datastore "${dataStore}"`);

  // Get current time to calculate the total time migration took
  const endTime = new Date();
  if (SLACK_WEB)
    await updateSlack(MSGID, actionMessage, [
      successAttachment(`VM Migrated, took ${diffMinutes(startTime, endTime)} minutes`),
    ]);
};

/**
 * Migrates all VMs on a Host or resource pool to host or resource pool
 * @param ps PowerShell Session
 * @param Host Host Object
 */
export const migrateVM = async (ps: Shell, { name, temporaryHost }: HostType) => {
  const poolName = `${name}-tmp`;
  const destName = Direction === 'Original' ? name : poolName;
  const sourceName = Direction === 'Temporary' ? name : poolName;
  if (Direction === 'Temporary') {
    console.log(`Creating Resource pool ${poolName} on Host ${temporaryHost}`);
    await run(ps, `New-ResourcePool -Name "${poolName}" -Location ${temporaryHost}`);
  }

  // Reusable message text
  const actionMessage = `Migrating ${sourceName} VMs to ${destName}`;

  // If slack is enabled them post a message with progress spinner.
  if (SLACK_WEB) MSGID = (await sendSlack(actionMessage, [progressAttachment('Migrating VMs…')])).message.ts;

  console.log(actionMessage);

  // Get all VMs from source and migrate them to destination
  await run(ps, `Get-VM -Location "${sourceName}" | Move-VM -Destination "${destName}"`);

  // If returning VMs to VMHost then delete the temp resource pool after verfifying it is empty
  if (Direction === 'Original') {
    const poolVMs = await run(ps, `Get-VM -Location ${poolName}`);
    if (poolVMs.length === 0) await run(ps, `Remove-ResourcePool -ResourcePool ${poolName} -Confirm:$false`);
  }

  // If Slack is enabled then update the message with success attachment
  if (SLACK_WEB) await updateSlack(MSGID, actionMessage, [successAttachment(`VMs Migrated`)]);
  console.log(`VMs Migrated from ${sourceName} to ${destName}`);
};
