# @jayree/sfdx-plugin-source

A Salesforce CLI plugin containing commands to generate and compare sfdx source snapshot files.

[![sfdx](https://img.shields.io/badge/cli-sfdx-brightgreen.svg)](https://developer.salesforce.com/tools/sfdxcli)
[![NPM](https://img.shields.io/npm/v/@jayree/sfdx-plugin-source.svg?label=@jayree/sfdx-plugin-source)](https://npmjs.org/package/@jayree/sfdx-plugin-source)
[![test-and-release](https://github.com/jayree/sfdx-plugin-source/actions/workflows/release.yml/badge.svg)](https://github.com/jayree/sfdx-plugin-source/actions/workflows/release.yml)
[![Downloads/week](https://img.shields.io/npm/dw/@jayree/sfdx-plugin-source.svg)](https://npmjs.org/package/@jayree/sfdx-plugin-source)
[![License](https://img.shields.io/npm/l/@jayree/sfdx-plugin-source.svg)](https://github.com/jayree-plugins/sfdx-plugin-source/blob/main/package.json)

## Install

```bash
sfdx plugins:install @jayree/sfdx-plugin-source
```

## Commands

<!-- commands -->
* [`sfdx jayree:source:snapshot:compare`](#sfdx-jayreesourcesnapshotcompare)
* [`sfdx jayree:source:snapshot:generate`](#sfdx-jayreesourcesnapshotgenerate)
* [`sfdx jayree:source:tracking:list`](#sfdx-jayreesourcetrackinglist)
* [`sfdx jayree:source:tracking:store:get`](#sfdx-jayreesourcetrackingstoreget)
* [`sfdx jayree:source:tracking:store:set`](#sfdx-jayreesourcetrackingstoreset)

### `sfdx jayree:source:snapshot:compare`

compares sfdx source snapshot files

```
USAGE
  $ sfdx jayree:source:snapshot:compare [--json] [--filepath <value>]

FLAGS
  --filepath=<value>  [default: ./sfdx-source-snapshot.json] path of the generated snapshot file

GLOBAL FLAGS
  --json  Format output as json.
```

_See code: [src/commands/jayree/source/snapshot/compare.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.1.0/src/commands/jayree/source/snapshot/compare.ts)_

### `sfdx jayree:source:snapshot:generate`

generates sfdx source snapshot files

```
USAGE
  $ sfdx jayree:source:snapshot:generate [--json] [--filepath <value>]

FLAGS
  --filepath=<value>  [default: ./sfdx-source-snapshot.json] path to save the generated snapshot file

GLOBAL FLAGS
  --json  Format output as json.
```

_See code: [src/commands/jayree/source/snapshot/generate.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.1.0/src/commands/jayree/source/snapshot/generate.ts)_

### `sfdx jayree:source:tracking:list`

list changes in a scratch org by remote revision counter number

```
USAGE
  $ sfdx jayree:source:tracking:list -o <value> [--json] [--api-version <value>] [-r <value>]

FLAGS
  -o, --target-org=<value>  (required) Username or alias of the target org.
  -r, --revision=<value>    start at a specific revision counter number
  --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --json  Format output as json.

EXAMPLES
  $ sfdx jayree:source:tracking:list
  $ sfdx jayree:source:tracking:list -u me@my.org
  $ sfdx jayree:source:tracking:list -u me@my.org -r 101
```

_See code: [src/commands/jayree/source/tracking/list.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.1.0/src/commands/jayree/source/tracking/list.ts)_

### `sfdx jayree:source:tracking:store:get`

get stored revision counter number

```
USAGE
  $ sfdx jayree:source:tracking:store:get -o <value> [--json]

FLAGS
  -o, --target-org=<value>  (required) Username or alias of the target org.

GLOBAL FLAGS
  --json  Format output as json.

EXAMPLES
  $ sfdx jayree:source:tracking:store:get
  $ sfdx jayree:source:tracking:store:get -u me@my.org
```

_See code: [src/commands/jayree/source/tracking/store/get.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.1.0/src/commands/jayree/source/tracking/store/get.ts)_

### `sfdx jayree:source:tracking:store:set`

store revision counter number

```
USAGE
  $ sfdx jayree:source:tracking:store:set -o <value> [--json] [--api-version <value>] [-r <value>]

FLAGS
  -o, --target-org=<value>  (required) Username or alias of the target org.
  -r, --revision=<value>    revision counter number (default: remote revision counter number)
  --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --json  Format output as json.

EXAMPLES
  $ sfdx jayree:source:tracking:store:set
  $ sfdx jayree:source:tracking:store:set -u me@my.org
  $ sfdx jayree:source:tracking:store:set -u MyTestOrg1 -r 101
```

_See code: [src/commands/jayree/source/tracking/store/set.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.1.0/src/commands/jayree/source/tracking/store/set.ts)_
<!-- commandsstop -->

## Hooks
### prerun

- Resets source tracking using `force:source:tracking:reset` before executing `force:source:pull` or `project:retrieve:start`.

> **_IMPORTANT:_** This hook will only run if  `SFDX_ENABLE_JAYREE_HOOKS_RESET_BEFORE_PULL=true` is set. It uses the stored `serverMaxRevisionCounter` as revision counter number (see: [`jayree:source:tracking:store:set`](#sfdx-jayreesourcetrackingstoreset)). If the hook doesn't find a stored value it asks if the current *local* revision counter number should be stored and used.
