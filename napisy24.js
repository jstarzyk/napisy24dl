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
let t
let episode
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
    console.info(`Using filter ${filterSelection[seasonIndex] + 1} for season ${seasonIndex + 1}`)
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

function selectFilters() {
    filterSelection = Array(seasons.length)
    const allowedInput = [...filters.map((f, i) => (i + 1).toString()), null]
    const filterDisplay = filters.map((f, i) => `${i + 1} - ${f['name']}`).join(', ')
    const lastSelectedSeason = seasonSelection.lastIndexOf(true)
    let rememberFilter
    let filterIndex
    for (let i = 0; i < seasonSelection.length; i++) {
        if (!seasonSelection[i]) {
            continue
        }
        else if (rememberFilter) {
            filterSelection[i] = filterIndex
        }
        else {
            let input
            while (!allowedInput.contains(input)) {
                input = prompt(`Choose filter number for season ${i + 1} (${filterDisplay})`)
            }
            if (input === null) {
                seasonSelection[i] = false
            }
            else {
                filterIndex = Number.parseInt(input) - 1
                filterSelection[i] = filterIndex
                if (i !== lastSelectedSeason && rememberFilter === undefined) {
                    rememberFilter = ['y', ''].contains(prompt('Remember filter? [Y/n]').toLowerCase())
                }
            }
        }
    }
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
        selectFilters()
        next()
    }
}

start()
