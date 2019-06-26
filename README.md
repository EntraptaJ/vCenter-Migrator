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

**Environment variables:**

| Variable | Description |
| :--- | --- |
| `MODE` | Direction in which to migrate VM Storage to Original or Temporary datastore |
| `URL` | vCenter URL |
| `USER` | vCenter Username |
| `PASS` | vCenter Password |
| `SLACK_TOKEN` | Optional Slack Messages on each VM Migration, time taken to migrate, and message upon completion of all migrations |
| `SLACK_CHANNEL` | Optional Slack Channel to post in |
----


**.env Example:**
```
URL="vsphere.local"
USER="Administrator@vsphere.local"
PASS="password"
MODE=Original
SLACK_TOKEN=XYZNSJ
SLACK_CHANNEL=srv-change-management
```

**Basic usage**
```bash
$ docker run -d --env-file .env \
    -v "$PWD/VMs.json:/VMs.json" \
    kristianfjones/vsphere-migrator
```
