# vCenter VM Migration Script

This is a NodeJS script that takes a JSON file as an input that has VMHosts and VMs. The script transfers all VMs from either original store or temporary data store. Soon I will add the ability to migrate VMs to seperate hosts

## VMs.json Format

Example

```json
{
  "data": {
    "Hosts": [
      {
        "name": "172.28.11.45",
        "VMs": [{ "name": "GNS3", "originalStorage": "VMHost1.vDSK2", "tempStorage": "vmh1.vdsk1" }]
      },
      {
        "name": "172.28.11.46",
        "VMs": [
          { "name": "Hello-World", "originalStorage": "VMHost1.vDSK2", "tempStorage": "vmh1.vdsk1" },
          { "name": "PRTG", "originalStorage": "vmh1.vdsk1", "tempStorage": "VMHost1.vDSK2" }
        ]
      }
    ]
  }
}
```

## Usage

MODE 'Original' | 'Temporary'

docker run -it -e USER="Administrator@vsphere.local" -e PASS="password" -e URL="vsphere.local" -e MODE="Original" -v "$PWD/VMs.json:./VMs.json" kristianfjones/vsphere-migrator
