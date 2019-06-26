export interface VMsType {
  name: string;
  originalStorage: string;
  tempStorage: string;
}

export interface Info {
  name: string;
  VMs: VMsType[];
}

export interface DataJSON {
  data: {
    Hosts: Info[];
  };
}
