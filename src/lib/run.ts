import Shell from 'node-powershell';

/**
 * Add and exec a PowerShell command
 * @param ps node-PowerShell Instance
 * @param command Powershell Command to exec
 */
export const run = async (ps: Shell, command: string) => {
  // Add command to PowerShell Que
  await ps.addCommand(command);

  // Return the promise of invoking the command.
  return ps.invoke();
};
