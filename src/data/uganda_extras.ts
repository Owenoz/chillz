// ── Uganda Radio Stations ─────────────────────────────────────
export interface RadioStation {
  id: string
  name: string
  frequency: string
  genre: string
  logo: string
  stream_url: string    // HLS m3u8 or MP3 direct stream
  embed_url?: string    // YouTube embed fallback
  description: string
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cbs-fm',
    name: 'CBS FM 88.8',
    frequency: '88.8 FM',
    genre: 'Luganda · Talk · News',
    logo: 'https://upload.wikimedia.org/wikipedia/en/1/1c/CBS_Radio_Buganda_logo.png',
    stream_url: 'https://stream.zeno.fm/t8exubpsgtzuv',
    embed_url: 'https://www.youtube.com/embed/live_stream?channel=UCQ0KFnkRGEQIMXbIRBMQ6wA',
    description: "Radio ya Ssabassajja — Uganda's biggest Luganda radio station",
  },
  {
    id: 'akaboozi',
    name: 'Akaboozi FM 87.9',
    frequency: '87.9 FM',
    genre: 'Luganda · News · Entertainment',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Akaboozi_fm.jpg/320px-Akaboozi_fm.jpg',
    stream_url: 'https://stream.zeno.fm/4qm4yrnkszquv',
    embed_url: 'https://www.youtube.com/embed/live_stream?channel=UCi3ORxPKXBBp-7Z_WCDPNzg',
    description: 'Akaboozi FM — Voice of the people in Luganda',
  },
  {
    id: 'sanyu-fm',
    name: 'Sanyu FM 88.2',
    frequency: '88.2 FM',
    genre: 'English · Music · Entertainment',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Sanyu_FM_logo.jpg/320px-Sanyu_FM_logo.jpg',
    stream_url: 'https://stream.zeno.fm/4njutfmcmyzuv',
    embed_url: 'https://www.youtube.com/embed/live_stream?channel=UCOSMbFR_HJaEinYEfTYhUSg',
    description: 'Sanyu FM — The Urban Beat of Kampala',
  },
  {
    id: 'capital-fm',
    name: 'Capital FM 91.3',
    frequency: '91.3 FM',
    genre: 'English · Music · Talk',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Capital_Radio_Uganda.jpg/320px-Capital_Radio_Uganda.jpg',
    stream_url: 'https://stream.zeno.fm/fx9wy9ycmyzuv',
    embed_url: 'https://www.youtube.com/embed/live_stream?channel=UCvn4Z3RyAeNn_OWIPSGlj2A',
    description: 'Capital FM 91.3 — Number 1 Hit Music Station',
  },
  {
    id: 'kfm',
    name: 'KFM 93.3',
    frequency: '93.3 FM',
    genre: 'English · News · Talk',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/KFM_Logo.png/320px-KFM_Logo.png',
    stream_url: 'https://stream.zeno.fm/uw1y2jmcmyzuv',
    embed_url: 'https://www.youtube.com/embed/live_stream?channel=UCU9TgAO4OHXM8i4h7lJpwlA',
    description: 'KFM 93.3 — Kampala FM, informing Uganda since 1994',
  },
  {
    id: 'radio-simba',
    name: 'Radio Simba 97.3',
    frequency: '97.3 FM',
    genre: 'Luganda · Music',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Radio_Simba_logo.jpg/320px-Radio_Simba_logo.jpg',
    stream_url: 'https://stream.zeno.fm/xhfr0vxgmyzuv',
    description: 'Radio Simba — Lion of the airwaves',
  },
  {
    id: 'galaxy-fm',
    name: 'Galaxy FM 100.2',
    frequency: '100.2 FM',
    genre: 'English · Luganda · Entertainment',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Galaxy_FM_logo.png/320px-Galaxy_FM_logo.png',
    stream_url: 'https://stream.zeno.fm/c6zs0k8yqhzuv',
    description: 'Galaxy FM — Your entertainment destination',
  },
  {
    id: 'crooze-fm',
    name: 'Crooze FM 90.4',
    frequency: '90.4 FM',
    genre: 'English · Music · Youth',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Crooze_FM_logo.png/320px-Crooze_FM_logo.png',
    stream_url: 'https://stream.zeno.fm/8njuczmcmyzuv',
    description: 'Crooze FM — Western Uganda\'s biggest radio',
  },
  {
    id: 'bukedde-fm',
    name: 'Bukedde FM 100.5',
    frequency: '100.5 FM',
    genre: 'Luganda · News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bukedde_TV_1.png/320px-Bukedde_TV_1.png',
    stream_url: 'https://stream.hydeinnovations.com/bukeddefm/index.m3u8',
    description: 'Bukedde FM — News and talk in Luganda from New Vision',
  },
  {
    id: 'xfm',
    name: 'XFM 94.8',
    frequency: '94.8 FM',
    genre: 'English · Music · Youth',
    logo: '',
    stream_url: 'https://stream.zeno.fm/mbqr8z98myzuv',
    description: 'XFM 94.8 — Kampala\'s youth radio',
  },
]

// ── Uganda Church / Gospel Streams ───────────────────────────
export interface Church {
  id: string
  name: string
  location: string
  denomination: string
  logo: string
  youtube_channel_id: string  // YouTube channel ID for live embeds
  youtube_handle: string
  description: string
}

export const CHURCHES: Church[] = [
  {
    id: 'watoto',
    name: 'Watoto Church',
    location: 'Kampala',
    denomination: 'Pentecostal',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Watoto_church_logo.png/320px-Watoto_church_logo.png',
    youtube_channel_id: 'UCBM7mo6IiBahvJ4l5DknLNQ',
    youtube_handle: '@WatotoChurch',
    description: 'Watoto Church Kampala — 35,000+ members across 18 locations',
  },
  {
    id: 'miracle-centre',
    name: 'Miracle Centre Cathedral',
    location: 'Kampala',
    denomination: 'Pentecostal',
    logo: '',
    youtube_channel_id: 'UCWsEZ6sDCDSNpUCXMuFpxbg',
    youtube_handle: '@MiracleCentreCathedral',
    description: 'Miracle Centre Cathedral — Bishop Robert Kayanja',
  },
  {
    id: 'kingdom-kampala',
    name: 'Kingdom Kampala',
    location: 'Kampala',
    denomination: 'Charismatic',
    logo: '',
    youtube_channel_id: 'UCGDLDAfEKTHFYNyFOhpSGag',
    youtube_handle: '@KingdomKampala',
    description: 'Kingdom Kampala International Church',
  },
  {
    id: 'victory-cc',
    name: 'Victory Christian Centre',
    location: 'Kampala',
    denomination: 'Charismatic',
    logo: '',
    youtube_channel_id: 'UCrKFOuDQhGGcyxVRauIBBtQ',
    youtube_handle: '@VictoryChristianCentreUganda',
    description: 'Victory Christian Centre — Bishop Joseph Serwadda',
  },
  {
    id: 'namirembe-cathedral',
    name: 'Namirembe Cathedral',
    location: 'Kampala',
    denomination: 'Anglican',
    logo: '',
    youtube_channel_id: 'UCuMzNJMJBomT0n2c8YUqVKg',
    youtube_handle: '@NamirembeAnglican',
    description: 'Namirembe Anglican Cathedral — historic church of Uganda',
  },
  {
    id: 'rubaga-cathedral',
    name: 'Rubaga Cathedral',
    location: 'Kampala',
    denomination: 'Catholic',
    logo: '',
    youtube_channel_id: 'UCeMfXOSsW2AASX1SuylG_xQ',
    youtube_handle: '@RubagaCathedral',
    description: 'Metropolitan Rubaga Cathedral — Catholic Archdiocese of Kampala',
  },
  {
    id: 'arise-shine',
    name: 'Arise & Shine Ministries',
    location: 'Kampala',
    denomination: 'Pentecostal',
    logo: '',
    youtube_channel_id: 'UCsGwi3rMV1RCU6aVNyBiRXA',
    youtube_handle: '@AriseAndShineMinistries',
    description: 'Arise & Shine Ministries Uganda',
  },
  {
    id: 'living-hope',
    name: 'Living Hope Church',
    location: 'Kampala',
    denomination: 'Charismatic',
    logo: '',
    youtube_channel_id: 'UCQRmDUerSE59ZhpLWaxrRXA',
    youtube_handle: '@LivingHopeChurchUg',
    description: 'Living Hope Church Uganda',
  },
]

// ── Uganda Premier League Clubs ───────────────────────────────
export interface UPLTeam {
  name: string
  short: string
  badge: string
  city: string
}

export const UPL_TEAMS: UPLTeam[] = [
  { name: 'Vipers SC',         short: 'VIP', badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Vipers_SC_badge.png/200px-Vipers_SC_badge.png', city: 'St. Mary\'s Stadium, Kitende' },
  { name: 'KCCA FC',           short: 'KCC', badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/KCCA_FC_logo.png/200px-KCCA_FC_logo.png', city: 'Lugogo, Kampala' },
  { name: 'Express FC',        short: 'EXP', badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Express_FC.png/200px-Express_FC.png', city: 'Mutesa II Stadium, Kampala' },
  { name: 'SC Villa',          short: 'VIL', badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Sports_Club_Villa.png/200px-Sports_Club_Villa.png', city: 'Nakivubo, Kampala' },
  { name: 'UPDF FC',           short: 'UPD', badge: '', city: 'UPDF Ground, Bombo' },
  { name: 'Wakiso Giants',     short: 'WAK', badge: '', city: 'Wakiso' },
  { name: 'URA FC',            short: 'URA', badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/17/URA_FC.png/200px-URA_FC.png', city: 'Mandela Stadium, Namboole' },
  { name: 'Police FC',         short: 'POL', badge: '', city: 'MTN Omondi Stadium' },
  { name: 'Mbarara City FC',   short: 'MBC', badge: '', city: 'Kakyeka Stadium, Mbarara' },
  { name: 'BUL FC',            short: 'BUL', badge: '', city: 'Kakindu Stadium, Jinja' },
  { name: 'Onduparaka FC',     short: 'OND', badge: '', city: 'Greenlight Stadium, Arua' },
  { name: 'Maroons FC',        short: 'MAR', badge: '', city: 'Luzira Prison Ground' },
  { name: 'Soltilo Bright Stars', short: 'SBS', badge: '', city: 'Star Academy, Jinja' },
  { name: 'Kitara FC',         short: 'KIT', badge: '', city: 'Hoima' },
  { name: 'Mbale Heroes',      short: 'MBH', badge: '', city: 'Mbale' },
  { name: 'Lugazi FC',         short: 'LUG', badge: '', city: 'Lugazi' },
]

// ── Africa / Nollywood movie categories ──────────────────────
export const AFRICA_CATEGORIES = [
  { key: 'nollywood', label: 'Nollywood', flag: '🇳🇬', query: 'nollywood nigeria movie 2023 2024 site:youtube.com', color: '#16a34a' },
  { key: 'bongo',     label: 'Bongo',     flag: '🇹🇿', query: 'bongo movie tanzania swahili 2023', color: '#ca8a04' },
  { key: 'uganda',    label: 'Uganda',    flag: '🇺🇬', query: 'uganda movie luganda 2023 full movie', color: '#dc2626' },
  { key: 'kenya',     label: 'Kenya',     flag: '🇰🇪', query: 'kenya movie swahili 2023 full', color: '#166534' },
  { key: 'ghana',     label: 'Ghana',     flag: '🇬🇭', query: 'ghana movie 2023 full', color: '#92400e' },
]
