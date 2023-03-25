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

_See code: [src/commands/jayree/source/snapshot/compare.ts](https://github.com/jayree/sfdx-plugin-source/blob/v0.0.0/src/commands/jayree/source/snapshot/compare.ts)_

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

_See code: [src/commands/jayree/source/snapshot/generate.ts](https://github.com/jayree/sfdx-plugin-source/blob/v0.0.0/src/commands/jayree/source/snapshot/generate.ts)_
<!-- commandsstop -->
