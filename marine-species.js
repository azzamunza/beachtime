// Marine species database for Perth region
// Includes fish, crabs, prawns, squid, crayfish, and other edible marine life

var marineSpeciesDatabase = [
    {
        id: 'black-bream',
        name: 'Black Bream',
        scientificName: 'Acanthopagrus butcheri',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NDk1ZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkJ88L3RleHQ+PC9zdmc+',
        basicInfo: 'Common estuarine species, highly regarded table fish. Size limit: 25cm. Bag limit: 4.',
        locations: ['Swan River', 'Canning River', 'Estuary'],
        bestTime: 'Early morning & dusk',
        bestTide: 'Incoming tide',
        bestSeason: 'Year-round, peak in Spring/Summer',
        rig: {
            description: '1-3kg spinning rod with 6-8lb line',
            hookSize: '1-4',
            sinkerWeight: '1/4-1/2 oz',
            leader: '4-6lb fluorocarbon'
        },
        bait: {
            primary: ['River prawns', 'Blue swimmer crab', 'Mussel', 'Bloodworms'],
            lures: ['Soft plastics (2-3 inch)', 'Small hard-body lures']
        },
        tactics: 'Target structure like pylons, jetties, and drop-offs. Work snags and oyster-covered pylons. Use berley to attract fish.',
        bestTimes: {
            tidePhase: 'Incoming to high',
            moonPhase: 'Any',
            weather: 'Calm to light winds'
        }
    },
    {
        id: 'tailor',
        name: 'Tailor',
        scientificName: 'Pomatomus saltatrix',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJjM2U1MCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjZg8L3RleHQ+PC9zdmc+',
        basicInfo: 'Aggressive predator with sharp teeth. Size limit: 25cm. Bag limit: 8.',
        locations: ['Beach', 'Perth Coast', 'Breakwater'],
        bestTime: 'Dawn & dusk',
        bestTide: 'Incoming tide',
        bestSeason: 'Autumn to Spring',
        rig: {
            description: '8-10ft surf rod with wire trace',
            hookSize: '1/0-3/0',
            sinkerWeight: '2-4 oz',
            leader: 'Wire trace (sharp teeth!)'
        },
        bait: {
            primary: ['Pilchards', 'Mullet', 'Herring'],
            lures: ['Metal slugs', 'Poppers', 'Stick baits']
        },
        tactics: 'Cast across sandbars and gutters. Schools often visible feeding on surface. Use wire trace to prevent bite-offs.',
        bestTimes: {
            tidePhase: 'Incoming',
            moonPhase: 'New & Full moon',
            weather: 'Moderate swell'
        }
    },
    {
        id: 'pink-snapper',
        name: 'Pink Snapper',
        scientificName: 'Chrysophrys auratus',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VjNzA2MyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkJ88L3RleHQ+PC9zdmc+',
        basicInfo: 'Prized table fish. Size limit: 41cm. Bag limit: 4.',
        locations: ['Perth Coast', 'Breakwater', 'Reef'],
        bestTime: 'Dawn, dusk & night',
        bestTide: 'High tide at dusk',
        bestSeason: 'Year-round',
        rig: {
            description: 'Surf rod 10-12ft with 30lb braid',
            hookSize: '4/0-6/0',
            sinkerWeight: '3-6 oz',
            leader: '20-30lb fluorocarbon'
        },
        bait: {
            primary: ['Fresh herring fillets', 'Squid', 'Pilchards', 'Octopus'],
            lures: ['Soft plastics (4-6 inch)', 'Jigs']
        },
        tactics: 'Target reef structure and deep channels. Fish near structure during tide changes. Use burley trail.',
        bestTimes: {
            tidePhase: 'High at dusk',
            moonPhase: 'New & Full moon',
            weather: 'Calm to moderate'
        }
    },
    {
        id: 'flathead',
        name: 'Dusky Flathead',
        scientificName: 'Platycephalus fuscus',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzdhNjg1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjJ88L3RleHQ+PC9zdmc+',
        basicInfo: 'Bottom dwelling ambush predator. Size limit: 40cm. Bag limit: 4.',
        locations: ['Swan River', 'Canning River', 'Estuary', 'Perth Coast'],
        bestTime: 'Day & dusk',
        bestTide: 'Outgoing tide',
        bestSeason: 'Spring to Autumn',
        rig: {
            description: 'Light spinning rod 2-4kg',
            hookSize: '1/0-3/0',
            sinkerWeight: '1/4-1 oz',
            leader: '10-15lb fluorocarbon'
        },
        bait: {
            primary: ['Live prawns', 'Whitebait', 'Pilchards'],
            lures: ['Soft plastics (3-5 inch)', 'Paddle tail swimbaits']
        },
        tactics: 'Drift sandy drop-offs and channels. Retrieve lures along bottom with slow hops.',
        bestTimes: {
            tidePhase: 'Outgoing',
            moonPhase: 'Any',
            weather: 'Calm to light winds'
        }
    },
    {
        id: 'mulloway',
        name: 'Mulloway (Jewfish)',
        scientificName: 'Argyrosomus japonicus',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzU1NmI2ZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpIg8L3RleHQ+PC9zdmc+',
        basicInfo: 'Large predator, trophy fish. Size limit: 50cm. Bag limit: 2.',
        locations: ['Swan River', 'Estuary', 'Perth Coast', 'Breakwater'],
        bestTime: 'Night',
        bestTide: 'High & changing tides',
        bestSeason: 'Autumn to Spring',
        rig: {
            description: 'Heavy gear 15-20lb with strong hooks',
            hookSize: '6/0-8/0',
            sinkerWeight: '3-8 oz',
            leader: '30-60lb'
        },
        bait: {
            primary: ['Live mullet', 'Whole squid', 'Fresh fish fillets'],
            lures: ['Large soft plastics', 'Swimbaits']
        },
        tactics: 'Fish deep channels, bridges, and structure at night. Use live bait near bottom.',
        bestTimes: {
            tidePhase: 'High or changing',
            moonPhase: 'New & Full moon',
            weather: 'Calm nights'
        }
    },
    {
        id: 'whiting',
        name: 'King George Whiting',
        scientificName: 'Sillaginodes punctatus',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QzZDNkMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjJw8L3RleHQ+PC9zdmc+',
        basicInfo: 'Excellent table fish. Size limit: 28cm. Bag limit: 12.',
        locations: ['Beach', 'Perth Coast'],
        bestTime: 'Morning',
        bestTide: 'Incoming tide',
        bestSeason: 'Autumn to Spring',
        rig: {
            description: 'Light spinning 1-3kg with running sinker',
            hookSize: '4-1',
            sinkerWeight: '1-2 oz',
            leader: '4-8lb'
        },
        bait: {
            primary: ['Beach worms', 'Sand worms', 'Prawns', 'Pippis'],
            lures: ['Small soft plastics']
        },
        tactics: 'Fish sandy patches and gutters. Use long casts with running sinker rig.',
        bestTimes: {
            tidePhase: 'Incoming',
            moonPhase: 'Any',
            weather: 'Calm to light winds'
        }
    },
    {
        id: 'herring',
        name: 'Australian Herring',
        scientificName: 'Arripis georgianus',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzgzYTU5NyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjJQ8L3RleHQ+PC9zdmc+',
        basicInfo: 'Schooling fish, great bait and table fish. No size/bag limits.',
        locations: ['Swan River', 'Canning River', 'Perth Coast', 'Estuary'],
        bestTime: 'All day',
        bestTide: 'High tide',
        bestSeason: 'Year-round',
        rig: {
            description: 'Light spin or float rig',
            hookSize: '6-10',
            sinkerWeight: 'Light or float',
            leader: '4-6lb'
        },
        bait: {
            primary: ['Maggots', 'Small prawn pieces', 'Bread'],
            lures: ['Tiny soft plastics', 'Micro jigs']
        },
        tactics: 'Burley up schools. Use small hooks and light line. Great fun on light tackle.',
        bestTimes: {
            tidePhase: 'High',
            moonPhase: 'Any',
            weather: 'Any'
        }
    },
    {
        id: 'baldchin-groper',
        name: 'Baldchin Groper',
        scientificName: 'Choerodon rubescens',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2FhNTUzOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkJ88L3RleHQ+PC9zdmc+',
        basicInfo: 'Reef dwelling fish. Size limit: 40cm. Bag limit: 2.',
        locations: ['Perth Coast', 'Reef', 'Breakwater'],
        bestTime: 'Day',
        bestTide: 'High tide',
        bestSeason: 'Year-round',
        rig: {
            description: 'Heavy surf gear with strong hooks',
            hookSize: '4/0-6/0',
            sinkerWeight: '4-8 oz',
            leader: '30-50lb'
        },
        bait: {
            primary: ['Blue swimmer crab', 'Octopus', 'Squid'],
            lures: ['Rarely taken on lures']
        },
        tactics: 'Fish near reef structure with heavy sinkers. Use fresh crab or octopus.',
        bestTimes: {
            tidePhase: 'High',
            moonPhase: 'Any',
            weather: 'Calm to moderate'
        }
    },
    {
        id: 'blue-swimmer-crab',
        name: 'Blue Swimmer Crab',
        scientificName: 'Portunus armatus',
        category: 'crab',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhNjFhZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpqA8L3RleHQ+PC9zdmc+',
        basicInfo: 'Popular edible crab. Size limit: 12.7cm carapace. Bag limit: 20 (males only in some areas).',
        locations: ['Swan River', 'Canning River', 'Estuary', 'Perth Coast'],
        bestTime: 'Night',
        bestTide: 'High & incoming',
        bestSeason: 'Summer & Autumn',
        rig: {
            description: 'Drop nets or scoop nets',
            hookSize: 'N/A',
            sinkerWeight: 'Net weights',
            leader: 'N/A'
        },
        bait: {
            primary: ['Fish frames', 'Chicken necks', 'Pilchards'],
            lures: []
        },
        tactics: 'Use drop nets with fish bait. Check regulations for seasonal closures and size limits. Measure carapace width.',
        bestTimes: {
            tidePhase: 'High or incoming',
            moonPhase: 'Any',
            weather: 'Calm nights'
        }
    },
    {
        id: 'prawns',
        name: 'Western King Prawn',
        scientificName: 'Melicertus latisulcatus',
        category: 'prawn',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0YTQ2MCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpkQ8L3RleHQ+PC9zdmc+',
        basicInfo: 'Delicious eating. Recreational net fishing allowed. Check local regulations.',
        locations: ['Swan River', 'Canning River', 'Estuary'],
        bestTime: 'Night',
        bestTide: 'Incoming tide',
        bestSeason: 'Summer to Autumn',
        rig: {
            description: 'Scoop net or haul net',
            hookSize: 'N/A',
            sinkerWeight: 'N/A',
            leader: 'N/A'
        },
        bait: {
            primary: ['Light attraction'],
            lures: []
        },
        tactics: 'Use scoop nets at night with light. Wade in shallow waters. Check size and bag limits.',
        bestTimes: {
            tidePhase: 'Incoming',
            moonPhase: 'Darker nights',
            weather: 'Calm, warm nights'
        }
    },
    {
        id: 'squid',
        name: 'Southern Calamari',
        scientificName: 'Sepioteuthis australis',
        category: 'squid',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzdhNGE2NiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpkI8L3RleHQ+PC9zdmc+',
        basicInfo: 'Excellent table squid. No size/bag limits. Use jigs only.',
        locations: ['Swan River', 'Perth Coast', 'Estuary', 'Breakwater'],
        bestTime: 'Dawn, dusk & night',
        bestTide: 'High & changing',
        bestSeason: 'Spring to Autumn',
        rig: {
            description: 'Light rod with squid jig',
            hookSize: 'Squid jig 2.5-3.5',
            sinkerWeight: 'N/A',
            leader: '8-12lb'
        },
        bait: {
            primary: [],
            lures: ['Squid jigs (various colors)', 'Prawn-style jigs']
        },
        tactics: 'Cast and retrieve jigs with jerky motion. Target weed beds and structure. Night fishing with lights.',
        bestTimes: {
            tidePhase: 'High or changing',
            moonPhase: 'Any',
            weather: 'Calm'
        }
    },
    {
        id: 'rock-lobster',
        name: 'Western Rock Lobster',
        scientificName: 'Panulirus cygnus',
        category: 'crayfish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2M0NGUzZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpJ48L3RleHQ+PC9zdmc+',
        basicInfo: 'Premium seafood. Size limit: 77mm carapace. Strict seasonal closures. License required.',
        locations: ['Perth Coast', 'Reef'],
        bestTime: 'Night',
        bestTide: 'Any',
        bestSeason: 'Nov 15 - Jun 30 (check current regulations)',
        rig: {
            description: 'Dive gear or pots (license required)',
            hookSize: 'N/A',
            sinkerWeight: 'N/A',
            leader: 'N/A'
        },
        bait: {
            primary: ['Fish frames for pots'],
            lures: []
        },
        tactics: 'Freediving or SCUBA at night. Check for berried females (must release). Strict regulations - check before fishing.',
        bestTimes: {
            tidePhase: 'Any',
            moonPhase: 'Darker nights',
            weather: 'Calm seas for diving'
        }
    },
    {
        id: 'octopus',
        name: 'Southern Keeled Octopus',
        scientificName: 'Octopus berrima',
        category: 'octopus',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzhhNWQ2ZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfmZk8L3RleHQ+PC9zdmc+',
        basicInfo: 'Good eating. Bag limit: 10. Use jigs or gaffs.',
        locations: ['Perth Coast', 'Reef', 'Breakwater'],
        bestTime: 'Day & night',
        bestTide: 'Low tide (easier to spot)',
        bestSeason: 'Spring to Autumn',
        rig: {
            description: 'Heavy rod with octopus jig or gaff',
            hookSize: 'Octopus jig',
            sinkerWeight: 'Variable',
            leader: 'Heavy'
        },
        bait: {
            primary: ['Live crab'],
            lures: ['Octopus jigs', 'Crab-style lures']
        },
        tactics: 'Target rocky areas and reef. Use jigs or gaffs. Clean immediately for best eating quality.',
        bestTimes: {
            tidePhase: 'Low (for spotting)',
            moonPhase: 'Any',
            weather: 'Calm for visibility'
        }
    },
    {
        id: 'sand-crab',
        name: 'Sand Crab',
        scientificName: 'Ovalipes australiensis',
        category: 'crab',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QzYjhhYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfpqA8L3RleHQ+PC9zdmc+',
        basicInfo: 'Edible crab, often used as bait. Check local size/bag limits.',
        locations: ['Beach', 'Perth Coast'],
        bestTime: 'Low tide',
        bestTide: 'Low tide',
        bestSeason: 'Year-round',
        rig: {
            description: 'Hand collection or pump',
            hookSize: 'N/A',
            sinkerWeight: 'N/A',
            leader: 'N/A'
        },
        bait: {
            primary: [],
            lures: []
        },
        tactics: 'Dig in sandy areas at low tide. Look for breathing holes. Great bait for other species.',
        bestTimes: {
            tidePhase: 'Low',
            moonPhase: 'Any',
            weather: 'Any'
        }
    },
    {
        id: 'garfish',
        name: 'Southern Garfish',
        scientificName: 'Hyporhamphus melanochir',
        category: 'fish',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzg3Y2VlYiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjoM8L3RleHQ+PC9zdmc+',
        basicInfo: 'Delicate table fish. Size limit: 23cm. Bag limit: 40.',
        locations: ['Swan River', 'Canning River', 'Estuary', 'Perth Coast'],
        bestTime: 'Morning & evening',
        bestTide: 'High tide',
        bestSeason: 'Spring to Autumn',
        rig: {
            description: 'Ultra-light float rig',
            hookSize: '10-14',
            sinkerWeight: 'Minimal',
            leader: '2-4lb'
        },
        bait: {
            primary: ['Maggots', 'Small bread pieces'],
            lures: ['Tiny flies']
        },
        tactics: 'Use float rig with minimal weight. Burley with bread. Very light line and small hooks.',
        bestTimes: {
            tidePhase: 'High',
            moonPhase: 'Any',
            weather: 'Calm'
        }
    }
];

// Location type definitions with landscape characteristics
var locationTypes = {
    'Swan River': { type: 'river', landscape: 'river', birds: ['swan', 'pelican', 'cormorant'] },
    'Canning River': { type: 'river', landscape: 'river', birds: ['swan', 'heron', 'cormorant'] },
    'Estuary': { type: 'estuary', landscape: 'estuary', birds: ['pelican', 'tern', 'cormorant'] },
    'Perth Coast': { type: 'coast', landscape: 'beach', birds: ['seagull', 'pelican', 'tern'] },
    'Beach': { type: 'beach', landscape: 'beach', birds: ['seagull', 'sandpiper', 'tern'] },
    'Breakwater': { type: 'breakwater', landscape: 'breakwater', birds: ['seagull', 'cormorant', 'tern'] },
    'Reef': { type: 'reef', landscape: 'breakwater', birds: ['seagull', 'tern'] },
    'Lake': { type: 'lake', landscape: 'lake', birds: ['swan', 'duck', 'heron'] }
};

// Map location to appropriate species
function getSpeciesForLocation(locationType) {
    return marineSpeciesDatabase.filter(species => 
        species.locations.some(loc => loc === locationType || locationTypes[locationType]?.type === loc)
    );
}
