const filterBluRay = ['bluray', 'blu-ray', 'bdrip', 'brrip']
const filterStreaming = ['web']
const filterTV = ['hdtv']
const filters = [filterBluRay, filterStreaming, filterTV]

let rememberFilter = false

let filterIndex
const formatIndex = 2

let seasons
let seasonSelection
let tableEpisodes
let tableEntries

let t
let episode
let toggleSubtitles

let seasonIndex = -1
let episodeIndex = -1

function download() {
    let [seasonNumber, episodeNumber] = [seasonIndex, episodeIndex].map(i => i + 1).map(n => n.toString()).map(s => s.padStart(2, '0'))
    let subtitles = Array.from(tableEntries).filter(e => e.attributes['data-napis-id'])
    let subtitleName
    let subtitleIndex = subtitles.findIndex(s => {
        subtitleName = s.firstChild.firstChild.children[0].firstChild.attributes['data-wydanie'].value
        for (let i = 0; i < filters[filterIndex].length; i++) {
            if (subtitleName.toLowerCase().includes(filters[filterIndex][i])) {
                return true
            }
        }
        return false
    })
    if (subtitleIndex === -1 && subtitles.length === 1) {
        console.warn(`The only available subtitle for S${seasonNumber}E${episodeNumber} doesn't match the specified filter`)
        subtitleIndex = 0
    }
    else if (subtitleIndex === -1) {
        console.warn(`Failed to download subtitle for S${seasonNumber}E${episodeNumber}`)
        return
    }
    let downloads = Array.from(subtitles[subtitleIndex].firstChild.firstChild.children[5].children).filter(e => e.tagName === 'A')
    console.info(`Downloading subtitle ${subtitleName} for S${seasonNumber}E${episodeNumber}`)
    downloads[formatIndex].click()
}

function tryDownload() {
    if (tableEntries.length > tableEpisodes.length) {
        download(episode)
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
    if (!rememberFilter) {
        let input
        while (!['1', '2', '3', null].contains(input)) {
            input = prompt(`Choose filter number for season ${seasonIndex + 1} (1 - BluRay, 2 - Streaming, 3 - TV)`)
        }
        if (input === null) {
            return next()
        }
        else {
            filterIndex = Number.parseInt(input) - 1
            rememberFilter = ['y', ''].contains(prompt('Remember filter? [Y/n]').toLowerCase())
        }
    }
    console.info(`Using filter ${filterIndex + 1} for season ${seasonIndex + 1}`)
    tableEntries = seasons[seasonIndex].children[1].children
    tableEpisodes = Array.from(tableEntries)
    episodeIndex = 0
    nextEpisode()
}

function nextEpisode() {
    episode = tableEpisodes[episodeIndex]
    toggleSubtitles = episode.children[4].children[1]
    toggleSubtitles.click()
    tryDownload()
}

function selectSeasons() {
    seasonSelection = Array(seasons.length).fill(false)
    let input
    while (true) {
        input = prompt(`Choose seasons (max ${seasons.length})`)
        if (input === null) {
            break
        }
        let results = input.split(',').map(r => /^(\d+)-(\d+)$|^(\d+)$/.exec(r)).filter(r => r !== null)
        results.forEach(r => r.splice(0, 1))
        results.forEach(r => {
            r = r.map(_r => Number.parseInt(_r))
            let start, end
            if (!Number.isNaN(r[2])) {
                start = end = r[2]
            }
            else {
                [start, end] = r[0] <= r[1] ? [r[0], r[1]] : [r[1], r[0]]
            }
            if (start > seasons.length || end === 0) {
                return
            }
            else {
                start = Math.max(1, start) - 1
                end = Math.min(seasons.length, end)
                seasonSelection.fill(true, start, end)
            }
        })
        if (seasonSelection.some(s => s)) {
            break
        }
    }
    console.info('Selected seasons: ' + (seasonSelection.map((y, i) => y ? i + 1 : null).filter(s => s !== null).join(', ') || 'none'))
}

function start() {
    seasons = Array.from(document.querySelectorAll('table')).filter(e => e.id === 'translationsTable')
    if (seasons.length > 0) {
        selectSeasons()
        next()
    }
}

start()
