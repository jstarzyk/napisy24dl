const filters = [
    {'name': 'Blu-ray', 'patterns': ['bluray', 'blu-ray', 'bdrip', 'brrip']},
    {'name': 'Streaming', 'patterns': ['web']},
    {'name': 'TV', 'patterns': ['hdtv']}
]

const formatIndex = 2

let seasons
let seasonSelection
let tableEpisodes
let tableEntries
let toggleSubtitles
let seasonIndex = -1
let episodeIndex = -1
let filterSelection

function download() {
    const [seasonNumber, episodeNumber] = [seasonIndex, episodeIndex].map(i => i + 1).map(n => n.toString()).map(s => s.padStart(2, '0'))
    const subtitles = Array.from(tableEntries).filter(e => e.attributes['data-napis-id'])
    let subtitleName
    const filterPatterns = filters[filterSelection[seasonIndex]]['patterns']
    let subtitleIndex = subtitles.findIndex(s => {
        subtitleName = s.firstChild.firstChild.children[0].firstChild.attributes['data-wydanie'].value
        return filterPatterns.some(p => subtitleName.toLowerCase().includes(p))
    })
    if (subtitleIndex === -1 && subtitles.length === 1) {
        console.warn(`The only available subtitle for S${seasonNumber}E${episodeNumber} doesn't match the specified filter`)
        subtitleIndex = 0
    }
    else if (subtitleIndex === -1) {
        console.warn(`Failed to download subtitle for S${seasonNumber}E${episodeNumber}`)
        return
    }
    const downloads = Array.from(subtitles[subtitleIndex].firstChild.firstChild.children[5].children).filter(e => e.tagName === 'A')
    console.info(`Downloading subtitle ${subtitleName} for S${seasonNumber}E${episodeNumber}`)
    downloads[formatIndex].click()
}

function tryDownload() {
    if (tableEntries.length > tableEpisodes.length) {
        download()
        toggleSubtitles.click()
        tryNext()
    }
    else {
        setTimeout(tryDownload, 500)
    }
}

function tryNext() {
    if (tableEntries.length === tableEpisodes.length) {
        next()
    }
    else {
        setTimeout(tryNext, 500)
    }
}

function next() {
    if (episodeIndex >= 0 && episodeIndex + 1 < tableEpisodes.length) {
        episodeIndex++
        nextEpisode()
    }
    else {
        seasonIndex = seasonSelection.indexOf(true, seasonIndex + 1)
        if (seasonIndex !== -1) {
            nextSeason()
        }
    }
}

function nextSeason() {
    console.info(`Using filter ${filterSelection[seasonIndex] + 1} for season ${seasonIndex + 1}`)
    tableEntries = seasons[seasonIndex].children[1].children
    tableEpisodes = Array.from(tableEntries)
    episodeIndex = 0
    nextEpisode()
}

function nextEpisode() {
    toggleSubtitles = tableEpisodes[episodeIndex].children[4].children[1]
    toggleSubtitles.click()
    tryDownload()
}

function selectFilters() {
    filterSelection = Array(seasons.length)
    const allowedInput = [...filters.map((f, i) => (i + 1).toString()), null]
    const filterDisplay = filters.map((f, i) => `${i + 1} - ${f['name']}`).join(', ')
    const lastSelectedSeason = seasonSelection.lastIndexOf(true)
    let rememberFilter
    let filterIndex
    for (let i of seasonSelection.map((y, i) => y ? i : null).filter(s => s !== null)) {
        filterIndex = rememberFilter ? filterIndex : getFilterIndex(i, allowedInput, filterDisplay)
        filterSelection[i] = filterIndex
        seasonSelection[i] = filterIndex === -1 ? false : seasonSelection[i]
        if (rememberFilter === undefined && filterIndex !== -1 && i !== lastSelectedSeason) {
            rememberFilter = ['y', ''].contains(prompt('Remember filter? [Y/n]').toLowerCase())
        }
    }
}

function getFilterIndex(i, allowedInput, filterDisplay) {
    let input
    while (!allowedInput.contains(input)) {
        input = prompt(`Choose filter number for season ${i + 1} (${filterDisplay})`)
    }
    return input === null ? -1 : Number.parseInt(input) - 1
}

function selectSeasons() {
    seasonSelection = Array(seasons.length).fill(false)
    let input
    while (input !== null && !seasonSelection.some(s => s)) {
        input = prompt(`Choose seasons (max ${seasons.length})`)
        input.split(',').map(str => parseRange(str)).filter(range => range).forEach(([start, end]) => seasonSelection.fill(true, start, end))
    }
    console.info('Selected seasons: ' + (seasonSelection.map((y, i) => y ? i + 1 : null).filter(s => s !== null).join(', ') || 'none'))
}

function parseRange(str) {
    let results = /^(\d+)-(\d+)$|^(\d+)$/.exec(str)
    if (results === null) {
        return
    }
    results = results.slice(1).map(t => Number.parseInt(t))
    let [start, end] = Number.isNaN(results[2]) ? results.slice(0, 2).sort() : [results[2], results[2]]
    if (start <= seasons.length && end !== 0) {
        start = Math.max(1, start) - 1
        end = Math.min(seasons.length, end)
        return [start, end]
    }
}

function start() {
    seasons = Array.from(document.querySelectorAll('table')).filter(e => e.id === 'translationsTable')
    if (seasons.length > 0) {
        selectSeasons()
        selectFilters()
        next()
    }
}

start()
