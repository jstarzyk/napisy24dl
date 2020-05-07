const filterBluRay = ['bluray', 'bdrip', 'brrip']
const filterStreaming = ['web']
const filterTV = ['hdtv']
const filters = [filterBluRay, filterStreaming, filterTV]

let filterIndex = -1
let rememberFilter = false

let formatIndex = 2

const seasons = Array.from(document.querySelectorAll('table')).filter(e => e.id === 'translationsTable')
let episodes
let entries

let toggleSubtitles
// let expanded = false

let t
let episode
let numberOfEpisodes

let seasonIndex = 0
let episodeIndex = 0

function download() {
    let subtitles = Array.from(entries).filter(e => e.attributes['data-napis-id'])
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
    if (subtitleIndex !== -1) {
        let downloads = Array.from(subtitles[subtitleIndex].firstChild.firstChild.children[5].children).filter(e => e.tagName === 'A')
        downloads[formatIndex].click()
        console.log('Downloading subtitle ' + subtitleName)
    }
    else {
        console.log(`Failed to download subtitle for S${(seasonIndex + 1).padStart(2, '0')}E${(episodeIndex + 1).padStart(2, '0')}`)
    }
}

function tryDownload() {
    if (entries.length > episodes.length) {
//         if (!expanded) {
//             expanded = true
            clearTimeout(t)
            download(episode)
            toggleSubtitles.click()
            setTimeout(next, 500)
//             next()
//         }
//         else {
//             t = setTimeout(tryDownload, 100)
//         }
    }
    else {
//         expanded = false
        t = setTimeout(tryDownload, 500)
    }
}

function next() {
    if (episodeIndex + 1 < episodes.length) {
        episodeIndex++
        nextEpisode()
    }
    else if (seasonIndex + 1 < seasons.length) {
        seasonIndex++
        episodeIndex = 0
        nextSeason()
    }
}

function nextSeason() {
    if (!rememberFilter) {
        let filterNumber = ''
        while (!['1', '2', '3'].contains(filterNumber)) {
            filterNumber = prompt(`Choose filter number for season ${seasonIndex + 1} (1 - BluRay, 2 - Streaming, 3 - TV)`)
        }
        console.log(`Using filter ${filterNumber} for season ${seasonIndex + 1}`)
        filterIndex = Number.from(filterNumber) - 1
        rememberFilter = prompt('Remember filter? [y/n]').toLowerCase() === 'y'
    }
    entries = seasons[seasonIndex].children[1].children
    episodes = Array.from(entries)
    nextEpisode()
}

function nextEpisode() {
    episode = episodes[episodeIndex]
    toggleSubtitles = episode.children[4].firstChild
    if (toggleSubtitles.style.display === 'none') {
        next()
    }
    else {
        toggleSubtitles.click()
        tryDownload()
    }
}

if (seasons.length > 0) {
    nextSeason()
}
