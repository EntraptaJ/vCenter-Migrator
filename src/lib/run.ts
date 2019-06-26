import * as Shell from 'node-powershell';

/**
 * Add and exec a PowerShell command
 * @param ps node-PowerShell Instance
 * @param command Powershell Command to exec
 */
export const run = async (ps: Shell, command: string) => {
  await ps.addCommand(command);
  return ps.invoke();
};
