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
* [`sfdx jayree project compare snapshot`](#sfdx-jayree-project-compare-snapshot)
* [`sfdx jayree project fix`](#sfdx-jayree-project-fix)
* [`sfdx jayree project generate snapshot`](#sfdx-jayree-project-generate-snapshot)
* [`sfdx jayree project list tracking`](#sfdx-jayree-project-list-tracking)
* [`sfdx jayree project store tracking get`](#sfdx-jayree-project-store-tracking-get)
* [`sfdx jayree project store tracking set`](#sfdx-jayree-project-store-tracking-set)

### `sfdx jayree project compare snapshot`

Compare sfdx source snapshot files.

```
USAGE
  $ sfdx jayree project compare snapshot [--json] [--flags-dir <value>] [--filepath <value>]

FLAGS
  --filepath=<value>  [default: ./sfdx-source-snapshot.json] Path of the generated snapshot file.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sfdx jayree source snapshot compare
```

_See code: [src/commands/jayree/project/compare/snapshot.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.3.65/src/commands/jayree/project/compare/snapshot.ts)_

### `sfdx jayree project fix`

Fix retrieved metadata.

```
USAGE
  $ sfdx jayree project fix [--json] [--flags-dir <value>] [-o <value>] [-t <value>...]

FLAGS
  -o, --target-org=<value>  Username or alias of the target org.
  -t, --task=<value>...     Task name(s) listed in sfdx-project.json.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sfdx jayree source fix
```

_See code: [src/commands/jayree/project/fix.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.3.65/src/commands/jayree/project/fix.ts)_

### `sfdx jayree project generate snapshot`

Generate sfdx source snapshot files.

```
USAGE
  $ sfdx jayree project generate snapshot [--json] [--flags-dir <value>] [--filepath <value>]

FLAGS
  --filepath=<value>  [default: ./sfdx-source-snapshot.json] Path to save the generated snapshot file.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sfdx jayree source snapshot generate
```

_See code: [src/commands/jayree/project/generate/snapshot.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.3.65/src/commands/jayree/project/generate/snapshot.ts)_

### `sfdx jayree project list tracking`

List changes in a scratch org by remote revision counter number.

```
USAGE
  $ sfdx jayree project list tracking -o <value> [--json] [--flags-dir <value>] [--api-version <value>] [-r <value>]

FLAGS
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
  -r, --revision=<value>     Start at a specific revision counter number.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sfdx jayree source tracking list

EXAMPLES
  $ sfdx jayree:source:tracking:list
  $ sfdx jayree:source:tracking:list -u me@my.org
  $ sfdx jayree:source:tracking:list -u me@my.org -r 101
```

_See code: [src/commands/jayree/project/list/tracking.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.3.65/src/commands/jayree/project/list/tracking.ts)_

### `sfdx jayree project store tracking get`

Get stored revision counter number.

```
USAGE
  $ sfdx jayree project store tracking get -o <value> [--json] [--flags-dir <value>]

FLAGS
  -o, --target-org=<value>  (required) Username or alias of the target org. Not required if the `target-org`
                            configuration variable is already set.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sfdx jayree source tracking store get

EXAMPLES
  $ sfdx jayree:source:tracking:store:get
  $ sfdx jayree:source:tracking:store:get -u me@my.org
```

_See code: [src/commands/jayree/project/store/tracking/get.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.3.65/src/commands/jayree/project/store/tracking/get.ts)_

### `sfdx jayree project store tracking set`

Store revision counter number.

```
USAGE
  $ sfdx jayree project store tracking set -o <value> [--json] [--flags-dir <value>] [--api-version <value>] [-r
  <value>]

FLAGS
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
  -r, --revision=<value>     Revision counter number (default: remote revision counter number).
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

ALIASES
  $ sfdx jayree source tracking store set

EXAMPLES
  $ sfdx jayree:source:tracking:store:set
  $ sfdx jayree:source:tracking:store:set -u me@my.org
  $ sfdx jayree:source:tracking:store:set -u MyTestOrg1 -r 101
```

_See code: [src/commands/jayree/project/store/tracking/set.ts](https://github.com/jayree/sfdx-plugin-source/blob/v1.3.65/src/commands/jayree/project/store/tracking/set.ts)_
<!-- commandsstop -->

## Hooks
### prerun

- Resets source tracking using `force:source:tracking:reset` before executing `force:source:pull` or `project:retrieve:start`.

> **_IMPORTANT:_** This hook will only run if  `SFDX_ENABLE_JAYREE_HOOKS_RESET_BEFORE_PULL=true` is set. It uses the stored `serverMaxRevisionCounter` as revision counter number (see: [`jayree:source:tracking:store:set`](#sfdx-jayreesourcetrackingstoreset)). If the hook doesn't find a stored value it asks if the current *local* revision counter number should be stored and used.

### scopedPreRetrieve

- Disables the `prettierFormat` hook. See [sfdx-plugin-prettier](https://github.com/jayree/sfdx-plugin-prettier) for more details.

### scopedPostRetrieve (plugin-source plugin) / postsourceupdate (legacy salesforce-alm plugin)

- Applies source fixes of the `jayree project fix` command, deletes and moves source files to separate package directories. See the configuration file [sfdx-project.json](sfdx-project.json) for examples. Set `"isActive": true,´ to apply this fix during `scopedPostRetrieve` hook.

> **_IMPORTANT:_** Since the hook is not able to update the (JSON) output of the command, an additional output is generated. Set the environment variable `SFDX_ENABLE_JAYREE_HOOKS_JSON_OUTPUT=true` and additional comma-separated JSON output will be appended, where the output must be parsed as an array, e.g. ``JSON.parse(`[${stdout}]`)``. See an example below:

```javascript
import execa from "execa";
import { CliUx } from "@oclif/core";

async function run() {
  const { stdout } = await execa("sfdx", [
    "force:source:retrieve",
    "--metadata",
    "Group:*",
    "--json"
  ]);
  const parsedStdout = JSON.parse(`[${stdout}]`);
  CliUx.ux.styledJSON(
    parsedStdout.length > 1
      ? {
          ...parsedStdout[0],
          result: {
            ...parsedStdout[0].result,
            fixedFiles: parsedStdout[1].fixedFiles
          }
        }
      : parsedStdout[0]
  );
}

run();
```

- Calls `prettierFormat` hook. See [sfdx-plugin-prettier](https://github.com/jayree/sfdx-plugin-prettier) for more details.
