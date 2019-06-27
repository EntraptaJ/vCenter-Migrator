# vCenter VM Migration Script

This is a Docker run Node.JS script that takes a JSON file as an input that has VMHosts and VMs. The script transfers all VMs from either original store or temporary data store. It also has the ability to create a resource pool on a host and migrate all VMs from a host to the new temporary resource pool and back again if the direction is Original

## VMs.json Format

Example

```json
{
  "data": {
    "Hosts": [
      {
        "name": "vmhost1.srv.kristianjones.xyz",
        "temporaryHost": "vmhost1.srv.kristianjones.xyz",
        "VMs": [
          { "name": "GNS3", "originalStorage": "vmh1.vdsk1", "tempStorage": "VMHost1.vDSK2" },
          { "name": "Hello-World", "originalStorage": "VMHost1.vDSK2", "tempStorage": "vmh1.vdsk1" },
          { "name": "PRTG", "originalStorage": "vmh1.vdsk1", "tempStorage": "VMHost1.vDSK2" }
        ]
      }
    ]
  }
}

```

## Usage

**Environment variables:**

| Variable | Description |
| :--- | --- |
| `TYPE` | The type of things to migrate. Just the VMs storage or VMs to and from a separate host "VMs" or "Storage: |
| `MODE` | Direction in which to migrate VMs to Original or Temporary datastore "Original" or "Temporary" |
| `URL`  | vCenter URL |
| `USER` | vCenter Username |
| `PASS` | vCenter Password |
| `SLACK_TOKEN` | Optional Slack Messages on each VM Migration, time taken to migrate, and message upon completion of all migrations |
| `SLACK_CHANNEL` | Optional Slack Channel to post in |


**.env Example:**
```
URL="vsphere.local"
USER="Administrator@vsphere.local"
PASS="password"
TYPE=VMs
MODE=Original
SLACK_TOKEN=XYZNSJ
SLACK_CHANNEL=srv-change-management
```

**Basic usage**
```bash
$ docker run -d -v "$PWD/VMs.json:/VMs.json" \
  --env-file .env kristianfjones/vsphere-migrator
```
