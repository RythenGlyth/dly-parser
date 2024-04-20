# DLY-Parser

A tool and Node.js package to parse immanens' DLY container files.

# Command Line Usage

Install the package globally:

```sh
npm install -g dly-parser
```

Then you can use the `dly-parser` command:

```sh
dly-parser --help
```

## Examples

View information about a DLY container:
```sh
dly-parser info path/to/container.dly
```

List files in a DLY container:
```sh
dly-parser list path/to/container.dly # List all files

dly-parser list path/to/container.dly --full # Show more information about each file

dly-parser list path/to/container.dly --extension pdf # Only files with the .pdf extension

dly-parser list path/to/container.dly --regex ".*\.(pdf|jpg)" # Only files with the .pdf or .jpg extension
```

Extract files from a DLY container:
```sh
dly-parser extract path/to/container.dly -o path/to/output/directory --all # Extract all files

dly-parser extract path/to/container.dly -o path/to/output/directory --extension pdf # Only extract files with the .pdf extension

dly-parser extract path/to/container.dly -o path/to/output/directory --regex ".*\.(pdf|jpg)" # Only extract files with the .pdf or .jpg extension

dly-parser extract path/to/container.dly -o path/to/output/directory --index 0,1,2 # Only extract files at the specified indices

dly-parser extract path/to/container.dly -o path/to/output/directory --index 0,1,2 --extension pdf # Only extract files that are at the specified indices or have the .pdf extension

dly-parser extract path/to/container.dly -o path/to/output/directory --index 0,1,2 --extension pdf --filter-all # Only extract files that are at the specified indices and have the .pdf extension
```

# Node.js Usage

Install the package as a dependency:

```sh
npm install dly-parser
```

Then you can use the package in your code:

```js
import { DLYContainer, DLYContainerProviderFS } from 'dly-parser';

const container = new DLYContainer(new DLYContainerProviderFS('path/to/container.dly'));
const header = await dly.parseHeader()
console.log(`Format-Version: ${header.archiveVersion & 0x0000FFFF}.${(header.archiveVersion & 0xFFFF0000) >> 16}`)
```

Have a look at the [cli.ts](src/cli.ts) file as an example.

# Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.