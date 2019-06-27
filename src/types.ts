export interface VMsType {
  name: string;
  originalStorage: string;
  tempStorage: string;
}

export interface Info {
  name: string;
  temporaryHost: string
  VMs: VMsType[];
}

export interface HostType {
  name: string
  temporaryHost: string
}

export interface DataJSON {
  data: {
    Hosts: Info[];
  };
}
