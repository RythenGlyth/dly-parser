#!/usr/bin/env node

import program from 'caporal'
import columnify from 'columnify'
import fs from 'fs'
import path from 'path'
import { DLYContainerProviderFS } from './container_provider'
import { DLYContainer, FileHeader } from './dly'
import { formatBytes } from './utils'

//const program = new Command();

program
    .name('dly-parser')
    .version('1.0.0')
    .description('DLY container parser')

    .command('info', 'Show information about the container')
    .argument('<container...>', 'DLY-Container File(s) to parse')
    .action(async (args, options) => {
        for(let dlypath of args.container) {
            let provider = new DLYContainerProviderFS(dlypath)
            let dly = new DLYContainer(provider)
            try {
                const header = await dly.parseHeader()
                console.log(`Container: ${dlypath}`)
                console.log(`Size: ${formatBytes(await provider.size())}`)
                console.log(`Format-Version: ${header.archiveVersion & 0x0000FFFF}.${(header.archiveVersion & 0xFFFF0000) >> 16}`)
                console.log(`Files: ${await dly.getFilesCount()}`)

                console.log("")
                console.log("")
            } catch (e) {
                console.error(`Error parsing header of ${dlypath}: `, e)
                return
            }
        }
    })

    .command('list', 'List files in the container')
    .alias('ls').alias('dir')
    .help('List files in the container')
    .help('By default, only the file names are shown.')
    .argument('<container...>', 'DLY-Container File(s) to parse')
    .option('-f, --full', 'Show full file information')
    .option('-e, --extension <extensions>', 'Only show files with the given extension', program.LIST)
    .option('-i, --index <indices>', 'Only show files with the given index', program.LIST + program.INT)
    .option('-r, --regex <regex>', 'Only show files matching the regex')
    .option('-R, --regex-flag <flags>', 'Flags for the regex')
    .action(async (args, options) => {
        for(let dlypath of args.container) {
            let provider = new DLYContainerProviderFS(dlypath)
            let dly = new DLYContainer(provider)
            try {
                const header = await dly.parseHeader()
                console.log(`Container: ${dlypath}`)
                let filesCount = await dly.getFilesCount()

                let regex = options.regex ? new RegExp(options.regex, options.regexFlag) : undefined

                let files = await dly.parseFileHeaders(0, filesCount)
                let filtered: (FileHeader & { index: number })[] = []
                for(let i = 0; i < files.length; i++) {
                    if(options.extension && !options.extension.includes(files[i].name.split('.').pop())) {
                        continue
                    }
                    if(options.index && !options.index.includes(i)) {
                        continue
                    }
                    if(regex && !regex.test(files[i].name)) {
                        continue
                    }
                    filtered.push({...files[i], index: i})
                }
                console.log(`File count: ${filtered.length}/${filesCount}`)
                console.log(`Files:`)
                console.log("")
                if(options.full) {
                    console.log(columnify(filtered, {
                        columns: ["index", "startOffset", "length", "name"],
                        config: {
                            index: {maxWidth: 5},
                            startOffset: {maxWidth: 15},
                            length: {
                                maxWidth: 20,
                                dataTransform: (data) => formatBytes(parseInt(data))
                            },
                            name: {
                                maxWidth: 50
                            }
                        }
                    }))
                    // console.log("Index\tSize\tStartOffset\tName")
                    // for(let i = 0; i < files.length; i++) {
                    //     let file = files[i]
                    //     console.log(`${i}\t${formatBytes(file.length)}\t${file.startOffset}\t${file.name}`)
                    // }
                } else {
                    console.log(filtered.map(f => f.name).join("\t"))
                }
                console.log("")
                console.log("")
            } catch (e) {
                console.error(`Error parsing ${dlypath}: `, e)
                return
            }
        }
    })

    .command('extract', 'Extract files from the container')
    .help('Extract files from the container')
    .help('You can use filters to extract only specific files. By default, files are extracted if they match any given filters.')
    .argument('<container...>', 'DLY-Container File(s) to parse')
    .option('-o, --output <output>', 'Output directory. \n If more than one container is specified, its name is added. Also, the filename is appended', undefined, undefined, true)
    .option('-a, --all', 'Extract all files')
    .option('-n, --name <names>', 'Extract files with exactly the given name', program.LIST)
    .option('-e, --extension <extensions>', 'Extract files with the given extension', program.LIST)
    .option('-i, --index <indices>', 'Extract files with the given index', program.LIST + program.INT)
    .option('-r, --regex <regex>', 'Extract files matching the regex')
    .option('-l, --filter-all', 'Filter files that match ALL given filters')
    .option('-F, --force', 'Overwrite existing files')

    .action(async (args, options) => { 
        for(let dlypath of args.container) {
            let provider = new DLYContainerProviderFS(dlypath)
            let dly = new DLYContainer(provider)
            try {
                const header = await dly.parseHeader()

                let filesCount = await dly.getFilesCount()

                let regex = options.regex ? new RegExp(options.regex, options.regexFlag) : undefined

                let files = await dly.parseFileHeaders(0, filesCount)
                let filtered: (FileHeader & { index: number })[] = []

                for(let i = 0; i < files.length; i++) {
                    if(
                        (
                            // All filters are true
                            options.filterAll && (
                                (options.name && !options.name.includes(files[i].name)) ||
                                (options.extension && !options.extension.includes(files[i].name.split('.').pop())) ||
                                (options.index && !options.index.includes(i)) ||
                                (regex && !regex.test(files[i].name))
                            )
                        ) || (
                            // Any filter is true
                            (!options.filterAll) && !(
                                (options.name && options.name.includes(files[i].name)) ||
                                (options.extension && options.extension.includes(files[i].name.split('.').pop())) ||
                                (options.index && options.index.includes(i)) ||
                                (regex && regex.test(files[i].name)) ||
                                options.all
                            )
                        )
                    ) {
                        continue
                    }
                    filtered.push({...files[i], index: i})
                }
                const outputDir = path.join(options.output, args.container.length > 1 ? path.basename(dlypath, path.extname(dlypath)) : "")
                fs.mkdirSync(outputDir, {recursive: true})
                for(let file of filtered) {
                    let output = path.join(outputDir, file.name)
                    if(fs.existsSync(output) && !options.force) {
                        console.error(`File ${output} already exists. Use --force to overwrite.`)
                        continue
                    }
                    let stream = await file.readFile()
                    await new Promise((resolve, reject) => {
                        stream.pipe(fs.createWriteStream(output))
                        .on('finish', resolve)
                        .on('error', reject)
                    })
                }

                console.log(`Extracted ${filtered.length} files from ${dlypath} to ${outputDir}`)

            } catch (e) {
                console.error(`Error parsing ${dlypath}: `, e)
                return
            }
        }
    })
    
program
    .parse(process.argv)