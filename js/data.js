'use strict';
/* ============================================================
   DATA
   Every explorable body (planets, moon, dwarf planets, comet,
   asteroids, and the Andromeda Galaxy) plus the orbit/rotation
   speed constants and the Kepler-equation solver used to place
   them each frame. Edit BODIES to add/remove/tweak a body —
   nothing else in the app needs to change.
============================================================ */
/* ============================================================
   DATA
============================================================ */
const BODIES = [
  { id:"sun", name:"Sun", type:"Star", color:"#ffd27f",
    visualRadius:5.5, orbitRadius:0, orbitalPeriodYears:0.0001, dayLengthHours:609.12, axialTilt:7.25,
    numeric:{diameterKm:1392700, massKg:1.989e30, distanceAU:0, moonsCount:0, periodDays:0, lightMin:0},
    perspective:"Shrink the Sun to a basketball (24 cm) and Earth becomes a peppercorn 26 m away \u2014 with Neptune's peppercorn nearly two-thirds of a mile out.",
    textureType:"sun", rings:false,
    real:{ diameter:"1,392,700 km", mass:"1.989 \u00d7 10\u00b3\u2070 kg", distance:"Center of the system",
      orbitalPeriod:"\u2014", dayLength:"\u2248 25\u201335 Earth days (varies by latitude)", moons:"0 (hosts 8 planets)",
      temperature:"\u2248 5,500\u00b0C surface / \u2248 15,000,000\u00b0C core", discovered:"Known since antiquity" },
    facts:[
      "It contains about 99.86% of the mass of the entire Solar System.",
      "Roughly 1.3 million Earths could fit inside its volume.",
      "Light from its surface takes about 8 minutes 20 seconds to reach Earth.",
      "It's a fairly ordinary middle-aged star, around 4.6 billion years old." ],
    relevance:[
      "Drives Earth's climate and powers nearly all life through photosynthesis.",
      "Studied up close by missions like Parker Solar Probe and SOHO.",
      "Solar flares and coronal mass ejections can disrupt satellites and power grids.",
      "A long-term focus of research into fusion energy and space weather forecasting." ],
    structure:{ layers:[
      { name:"Core", color:"#fff2c8", outerFraction:0.2, desc:"Nuclear fusion turns hydrogen into helium here, at roughly 15 million\u00b0C \u2014 the source of nearly all the Sun's energy." },
      { name:"Radiative zone", color:"#ffcf66", outerFraction:0.7, desc:"Energy drifts outward as radiation in a random zig-zag; a single photon can take over 100,000 years to cross this layer." },
      { name:"Convective zone", color:"#ffb02e", outerFraction:0.93, desc:"Hot plasma rises and cooler plasma sinks in giant currents, like boiling water, carrying energy the rest of the way out." },
      { name:"Photosphere", color:"#fff6df", outerFraction:1.0, desc:"The visible \u201csurface,\u201d about 5,500\u00b0C, marked by sunspots and grainy granulation patterns." }
    ] } },

  { id:"mercury", name:"Mercury", type:"Terrestrial Planet", color:"#9c9284",
    visualRadius:0.42, orbitRadius:16, orbitalPeriodYears:0.241, dayLengthHours:1407.6, axialTilt:0.03, eccentricity:0.206,
    numeric:{diameterKm:4879, massKg:3.30e23, distanceAU:0.39, moonsCount:0, periodDays:88, lightMin:3.2},
    perspective:"On that basketball-Sun scale, Mercury would be a poppy seed about 10 m away.",
    textureType:"rocky-mercury", rings:false,
    real:{ diameter:"4,879 km", mass:"3.30 \u00d7 10\u00b2\u00b3 kg", distance:"57.9 million km (0.39 AU)",
      orbitalPeriod:"88 Earth days", dayLength:"1,407.6 hours (58.6 Earth days)", moons:"0",
      temperature:"-173\u00b0C to 427\u00b0C", discovered:"Known since antiquity" },
    facts:[
      "A year on Mercury is shorter than its day \u2014 it spins 3 times for every 2 orbits.",
      "It's not the hottest planet despite being closest to the Sun; Venus is hotter.",
      "Permanently shadowed polar craters may hold hidden water ice.",
      "Its cratered, cliff-covered surface looks a lot like our Moon's." ],
    relevance:[
      "Explored by NASA's Mariner 10 and MESSENGER missions.",
      "ESA/JAXA's BepiColombo is currently mapping its surface and magnetic field.",
      "Helps scientists study how rocky planets form so close to a star." ],
    structure:{ layers:[
      { name:"Core", color:"#8a6d3b", outerFraction:0.83, desc:"An unusually large iron core makes up about 85% of Mercury's radius, and part of it is still molten." },
      { name:"Mantle", color:"#9c9284", outerFraction:0.95, desc:"A comparatively thin silicate mantle surrounds the core." },
      { name:"Crust", color:"#b7ac9a", outerFraction:1.0, desc:"A cratered, rocky crust wrinkled by cliffs formed as the planet's interior cooled and shrank." }
    ] } },

  { id:"venus", name:"Venus", type:"Terrestrial Planet", color:"#e8c39e",
    visualRadius:0.9, orbitRadius:21, orbitalPeriodYears:0.615, dayLengthHours:-5832.5, axialTilt:177.4, eccentricity:0.007,
    numeric:{diameterKm:12104, massKg:4.87e24, distanceAU:0.72, moonsCount:0, periodDays:225, lightMin:6.0},
    perspective:"On that same scale, Venus would be a peppercorn about 19 m away.",
    textureType:"rocky-venus", rings:false,
    real:{ diameter:"12,104 km", mass:"4.87 \u00d7 10\u00b2\u2074 kg", distance:"108.2 million km (0.72 AU)",
      orbitalPeriod:"225 Earth days", dayLength:"5,832.5 hours (243 Earth days, retrograde)", moons:"0",
      temperature:"\u2248 465\u00b0C (hottest planet)", discovered:"Known since antiquity" },
    facts:[
      "A thick CO2 atmosphere traps heat in a runaway greenhouse effect.",
      "It rotates backwards compared to most planets in the Solar System.",
      "Surface pressure is about 92 times Earth's \u2014 like standing 900 m underwater.",
      "Often called Earth's twin because the two are close in size." ],
    relevance:[
      "First close-up images of another planet's surface came from Soviet Venera landers.",
      "NASA's Magellan mission mapped its surface in detail using radar.",
      "Studied as a real-world case of runaway climate change.",
      "JAXA's Akatsuki orbiter continues to study its dense atmosphere." ],
    structure:{ layers:[
      { name:"Core", color:"#8a6d3b", outerFraction:0.5, desc:"A likely iron-rich core, similar in relative size to Earth's, though scientists are still debating whether it's fully molten." },
      { name:"Mantle", color:"#c9895a", outerFraction:0.95, desc:"A thick silicate mantle fuels widespread volcanic activity across the surface." },
      { name:"Crust", color:"#e8c39e", outerFraction:1.0, desc:"A dry, volcanic crust hidden beneath thick clouds of sulfuric acid and crushing atmospheric pressure." }
    ] } },

  { id:"earth", name:"Earth", type:"Terrestrial Planet", color:"#3a86c8",
    visualRadius:0.95, orbitRadius:27, orbitalPeriodYears:1.0, dayLengthHours:23.93, axialTilt:23.44, eccentricity:0.017,
    numeric:{diameterKm:12742, massKg:5.97e24, distanceAU:1.0, moonsCount:1, periodDays:365.25, lightMin:8.3},
    perspective:"Earth would be a peppercorn about 26 m away \u2014 roughly the length of two school buses.",
    textureType:"rocky-earth", rings:false,
    real:{ diameter:"12,742 km", mass:"5.97 \u00d7 10\u00b2\u2074 kg", distance:"149.6 million km (1 AU)",
      orbitalPeriod:"365.25 days", dayLength:"23.93 hours", moons:"1 (the Moon)",
      temperature:"\u2248 15\u00b0C average", discovered:"Our home world" },
    facts:[
      "The only known planet with confirmed life.",
      "About 71% of its surface is covered by oceans.",
      "A magnetic field shields the surface from most solar radiation.",
      "The Moon helps stabilize Earth's axial tilt, giving us steady seasons." ],
    relevance:[
      "Home to more than 8 billion people.",
      "Hosts thousands of satellites used for GPS, communication, and weather forecasting.",
      "The International Space Station orbits about 400 km overhead.",
      "The baseline every other planet gets compared against." ],
    structure:{ layers:[
      { name:"Inner core", color:"#f2d9a0", outerFraction:0.19, desc:"A solid iron-nickel ball about 1,220 km in radius, hotter than the Sun's surface but held solid by immense pressure." },
      { name:"Outer core", color:"#e8a94a", outerFraction:0.55, desc:"Liquid iron and nickel; its churning flow generates Earth's protective magnetic field." },
      { name:"Mantle", color:"#b5651d", outerFraction:0.97, desc:"Thick, slowly-flowing hot rock that drives plate tectonics, earthquakes, and volcanoes." },
      { name:"Crust", color:"#3a7d44", outerFraction:1.0, desc:"The thin, rigid outer shell we live on \u2014 ocean floor and continents." }
    ] } },

  { id:"mars", name:"Mars", type:"Terrestrial Planet", color:"#c1440e",
    visualRadius:0.55, orbitRadius:33, orbitalPeriodYears:1.881, dayLengthHours:24.62, axialTilt:25.19, eccentricity:0.093,
    numeric:{diameterKm:6779, massKg:6.42e23, distanceAU:1.52, moonsCount:2, periodDays:687, lightMin:12.7},
    perspective:"Mars would be a pinhead about 39 m away on this same scale.",
    textureType:"rocky-mars", rings:false,
    real:{ diameter:"6,779 km", mass:"6.42 \u00d7 10\u00b2\u00b3 kg", distance:"227.9 million km (1.52 AU)",
      orbitalPeriod:"687 Earth days", dayLength:"24.62 hours", moons:"2 (Phobos & Deimos)",
      temperature:"\u2248 -63\u00b0C average", discovered:"Known since antiquity" },
    facts:[
      "Home to Olympus Mons, the largest volcano in the Solar System (~22 km high).",
      "The Valles Marineris canyon system stretches over 4,000 km.",
      "Ancient riverbeds and lakebeds suggest it was once wetter.",
      "Its red color comes from iron oxide \u2014 essentially rust \u2014 on the surface." ],
    relevance:[
      "Primary target of robotic explorers like Perseverance, Curiosity, and Viking.",
      "The leading candidate for future human colonization.",
      "Sample-return missions are searching for signs of past microbial life.",
      "A testbed for technology that makes resources from local materials." ],
    structure:{ layers:[
      { name:"Core", color:"#5c4a3a", outerFraction:0.5, desc:"An iron-rich core, partly liquid, taking up roughly half of Mars's radius \u2014 confirmed by seismic data from NASA's InSight lander." },
      { name:"Mantle", color:"#8a4a2e", outerFraction:0.94, desc:"A rocky silicate mantle, proportionally thicker than Earth's, that once fed giant volcanoes." },
      { name:"Crust", color:"#c1440e", outerFraction:1.0, desc:"A thick, iron-oxide-rich crust \u2014 the source of Mars's rusty red color." }
    ] } },

  { id:"jupiter", name:"Jupiter", type:"Gas Giant", color:"#d8ae7e",
    visualRadius:3.4, orbitRadius:48, orbitalPeriodYears:11.86, dayLengthHours:9.93, axialTilt:3.13, eccentricity:0.049,
    numeric:{diameterKm:139820, massKg:1.898e27, distanceAU:5.2, moonsCount:95, periodDays:4333, lightMin:43.3},
    perspective:"Jupiter would be a large marble (2.4 cm) about 134 m away \u2014 more than a football field's length.",
    textureType:"gas-jupiter", rings:false,
    real:{ diameter:"139,820 km", mass:"1.898 \u00d7 10\u00b2\u2077 kg", distance:"778.5 million km (5.2 AU)",
      orbitalPeriod:"11.86 Earth years", dayLength:"9.93 hours (fastest of any planet)", moons:"95+ confirmed (incl. Io, Europa, Ganymede, Callisto)",
      temperature:"\u2248 -110\u00b0C at the cloud tops", discovered:"Known since antiquity" },
    facts:[
      "The Great Red Spot is a storm larger than Earth that has raged for centuries.",
      "Its gravity helps shield the inner planets from many comets and asteroids.",
      "It has a faint ring system, discovered in 1979.",
      "Its moon Europa may hide a subsurface ocean beneath its icy crust." ],
    relevance:[
      "Visited by Pioneer, Voyager, Galileo, and Juno.",
      "The Europa Clipper mission is investigating whether Europa could support life.",
      "A natural laboratory for studying extreme magnetic fields and storms." ],
    structure:{ layers:[
      { name:"Core", color:"#8a6d3b", outerFraction:0.15, desc:"A dense mix of rock, metal, and ice \u2014 recent data suggests it's larger and more \u201cfuzzy\u201d than once thought, partly dissolved into the layer above." },
      { name:"Metallic hydrogen layer", color:"#c98a4a", outerFraction:0.8, desc:"Hydrogen squeezed so hard it behaves like a liquid metal, generating Jupiter's enormous magnetic field." },
      { name:"Molecular hydrogen layer", color:"#d8ae7e", outerFraction:0.97, desc:"Liquid hydrogen and helium that gradually thins out toward the cloud tops." },
      { name:"Atmosphere", color:"#e8d2ad", outerFraction:1.0, desc:"Bands of ammonia clouds swept into stripes and storms, including the centuries-old Great Red Spot." }
    ] } },

  { id:"saturn", name:"Saturn", type:"Gas Giant", color:"#e3c98f",
    visualRadius:2.9, orbitRadius:65, orbitalPeriodYears:29.45, dayLengthHours:10.7, axialTilt:26.73, eccentricity:0.052,
    numeric:{diameterKm:116460, massKg:5.68e26, distanceAU:9.5, moonsCount:146, periodDays:10757, lightMin:79.5},
    perspective:"Saturn would be a cherry tomato roughly 246 m away.",
    textureType:"gas-saturn", rings:true, ringColors:["#00000000","#c9a06a","#e6d3a0","#c9a06a","#00000000"],
    real:{ diameter:"116,460 km", mass:"5.68 \u00d7 10\u00b2\u2076 kg", distance:"1.43 billion km (9.5 AU)",
      orbitalPeriod:"29.45 Earth years", dayLength:"10.7 hours", moons:"146+ confirmed (largest: Titan)",
      temperature:"\u2248 -140\u00b0C", discovered:"Known since antiquity" },
    facts:[
      "It's less dense than water \u2014 it would float in a big enough bathtub.",
      "Its rings are made mostly of ice, with a little rock and dust.",
      "Its moon Titan has lakes and rivers of liquid methane.",
      "A hexagonal jet-stream storm swirls at its north pole." ],
    relevance:[
      "Extensively studied by the Cassini-Huygens mission from 1997 to 2017.",
      "Cassini landed the Huygens probe on Titan's surface in 2005.",
      "A key target in the search for habitable moon environments." ],
    structure:{ layers:[
      { name:"Core", color:"#8a6d3b", outerFraction:0.13, desc:"A dense core of rock, metal, and ice, roughly Earth-sized but far more massive." },
      { name:"Metallic hydrogen layer", color:"#c9a06a", outerFraction:0.6, desc:"Hydrogen under extreme pressure behaving like a liquid metal, powering Saturn's magnetic field." },
      { name:"Molecular hydrogen layer", color:"#e6d3a0", outerFraction:0.96, desc:"Liquid hydrogen and helium, thinning gradually toward the cloud tops." },
      { name:"Atmosphere", color:"#f2e6c4", outerFraction:1.0, desc:"Pale bands of ammonia clouds, with a bizarre hexagonal jet stream swirling at the north pole." }
    ] } },

  { id:"uranus", name:"Uranus", type:"Ice Giant", color:"#a9dce0",
    visualRadius:1.9, orbitRadius:80, orbitalPeriodYears:84.02, dayLengthHours:-17.24, axialTilt:97.77, eccentricity:0.047,
    numeric:{diameterKm:50724, massKg:8.68e25, distanceAU:19.2, moonsCount:27, periodDays:30688, lightMin:159.6},
    perspective:"Uranus would be a chickpea nearly 500 m away.",
    textureType:"ice-uranus", rings:true, ringColors:["#00000000","#7fa3a8","#a9c9cc","#7fa3a8","#00000000"],
    real:{ diameter:"50,724 km", mass:"8.68 \u00d7 10\u00b2\u2075 kg", distance:"2.87 billion km (19.2 AU)",
      orbitalPeriod:"84 Earth years", dayLength:"17.24 hours (retrograde)", moons:"27 known, named after Shakespeare & Pope characters",
      temperature:"\u2248 -195\u00b0C", discovered:"1781, by William Herschel" },
    facts:[
      "It rotates almost completely on its side, likely from an ancient collision.",
      "The first planet discovered with a telescope rather than known since antiquity.",
      "A faint ring system was discovered around it in 1977.",
      "Methane in its atmosphere gives it a pale blue-green color." ],
    relevance:[
      "Visited only once, by Voyager 2 in 1986.",
      "A priority target for a future flagship orbiter mission.",
      "Helps scientists model \"ice giant\" exoplanets, a very common type in the galaxy." ],
    structure:{ layers:[
      { name:"Core", color:"#5a6e6f", outerFraction:0.2, desc:"A small, dense core of rock and metal." },
      { name:"Icy mantle", color:"#7fa3a8", outerFraction:0.8, desc:"A hot, dense fluid of water, ammonia, and methane \u2014 not ice as we know it, but a slushy conducting layer that generates Uranus's odd, tilted magnetic field." },
      { name:"Atmosphere", color:"#a9dce0", outerFraction:1.0, desc:"Hydrogen and helium with a trace of methane, which absorbs red light and gives Uranus its pale blue-green color." }
    ] } },

  { id:"neptune", name:"Neptune", type:"Ice Giant", color:"#3f5ec4",
    visualRadius:1.85, orbitRadius:94, orbitalPeriodYears:164.8, dayLengthHours:16.11, axialTilt:28.32, eccentricity:0.010,
    numeric:{diameterKm:49244, massKg:1.02e26, distanceAU:30.1, moonsCount:16, periodDays:60177, lightMin:250.2},
    perspective:"Neptune would be a pea about 776 m away \u2014 almost half a mile.",
    textureType:"ice-neptune", rings:true, ringColors:["#00000000","#4a5fae","#6c7fce","#4a5fae","#00000000"],
    real:{ diameter:"49,244 km", mass:"1.02 \u00d7 10\u00b2\u2076 kg", distance:"4.5 billion km (30.1 AU)",
      orbitalPeriod:"164.8 Earth years", dayLength:"16.11 hours", moons:"16 known (largest: Triton, orbits backwards)",
      temperature:"\u2248 -200\u00b0C", discovered:"1846, by Johann Galle" },
    facts:[
      "Home to the fastest winds in the Solar System \u2014 up to 2,100 km/h.",
      "The first planet found through mathematical prediction rather than direct observation.",
      "Its moon Triton is likely a captured Kuiper Belt object.",
      "It has completed barely one full orbit since its discovery in 1846." ],
    relevance:[
      "Visited only once, by Voyager 2 in 1989.",
      "Studied to understand deep ice-giant atmospheres and weather.",
      "Triton is a candidate target for a future dedicated orbiter." ],
    structure:{ layers:[
      { name:"Core", color:"#3a4a7a", outerFraction:0.2, desc:"A small core of rock and metal, roughly Earth-sized." },
      { name:"Icy mantle", color:"#4a5fae", outerFraction:0.8, desc:"A hot, dense fluid of water, ammonia, and methane ices that generates Neptune's magnetic field and drives its internal heat." },
      { name:"Atmosphere", color:"#6c7fce", outerFraction:1.0, desc:"Hydrogen, helium, and methane, whipped by the fastest winds in the Solar System \u2014 up to 2,100 km/h." }
    ] } },

  { id:"pluto", name:"Pluto", type:"Dwarf Planet", color:"#cbb6a3",
    visualRadius:0.28, orbitRadius:106, orbitalPeriodYears:248, dayLengthHours:-153.3, axialTilt:122.53, eccentricity:0.248,
    numeric:{diameterKm:2377, massKg:1.31e22, distanceAU:39.5, moonsCount:5, periodDays:90582, lightMin:328.0},
    perspective:"Pluto would be a grain of sand a full kilometer away.",
    textureType:"dwarf-pluto", rings:false,
    real:{ diameter:"2,377 km", mass:"1.31 \u00d7 10\u00b2\u00b2 kg", distance:"\u2248 5.9 billion km average (39.5 AU)",
      orbitalPeriod:"248 Earth years", dayLength:"153.3 hours (retrograde)", moons:"5 (largest: Charon)",
      temperature:"\u2248 -225\u00b0C", discovered:"1930, by Clyde Tombaugh" },
    facts:[
      "Reclassified from planet to dwarf planet by the IAU in 2006.",
      "Features a heart-shaped glacier region called Tombaugh Regio.",
      "Its tilted, elliptical orbit briefly brought it closer than Neptune from 1979 to 1999.",
      "Charon is over half Pluto's size, so the two orbit a shared point between them." ],
    relevance:[
      "Explored up close by NASA's New Horizons flyby in 2015.",
      "A gateway object for studying the icy Kuiper Belt.",
      "Sparked ongoing scientific debate about the definition of \"planet\"." ],
    structure:{ layers:[
      { name:"Core", color:"#5c4a3a", outerFraction:0.7, desc:"A rocky core, possibly still warm enough to maintain a hidden liquid-water ocean where it meets the ice mantle above." },
      { name:"Mantle", color:"#7d8fa0", outerFraction:0.97, desc:"A mantle of water ice, likely with a slushy layer near its base." },
      { name:"Crust", color:"#cbb6a3", outerFraction:1.0, desc:"A crust of nitrogen, methane, and carbon monoxide ices, including the heart-shaped Tombaugh Regio glacier." }
    ] } },

  { id:"comet", name:"Halley's Comet", type:"Comet", color:"#cfe8ea",
    visualRadius:0.32, orbitRadius:80, eccentricity:0.89, orbitalPeriodYears:45, dayLengthHours:52.8, axialTilt:0,
    numeric:{diameterKm:11, massKg:2.2e14, distanceAU:17.85, moonsCount:0, periodDays:16436, lightMin:148.5},
    perspective:"At its real closest approach, Halley's Comet passes about 15 m from our basketball Sun \u2014 farther out than Venus \u2014 before swinging back over half a kilometer away.",
    textureType:"comet", rings:false, isComet:true,
    real:{ diameter:"\u2248 11 km (nucleus)", mass:"\u2248 2.2 \u00d7 10\u00b9\u2074 kg",
      distance:"0.59 AU (perihelion) to 35.1 AU (aphelion) \u2014 real orbit",
      orbitalPeriod:"76 Earth years (real); compressed here for a watchable pass", dayLength:"\u2248 52.8 hours (irregular, tumbling nucleus)", moons:"0",
      temperature:"Frozen far out; streams gas and dust near the Sun", discovered:"Recorded since antiquity; its return was predicted by Edmond Halley in 1705" },
    facts:[
      "Its tail always points away from the Sun, pushed by solar wind and radiation \u2014 it can even lead the comet as it recedes.",
      "Nicknamed a \"dirty snowball\": a mix of ice, dust, and rock that vaporizes as it nears the Sun.",
      "It last appeared in 1986 and won't return until 2061.",
      "This visualization compresses its real, extremely elongated 76-year orbit into a couple of minutes so a full pass is watchable." ],
    relevance:[
      "The first comet confirmed to be periodic, proving comets obey the same orbital laws as planets.",
      "Studied up close by the European Space Agency's Giotto probe during its 1986 flyby.",
      "A reminder that icy wanderers still cross the planets' paths today." ],
    structure:{ layers:[
      { name:"Nucleus", color:"#cfe8ea", outerFraction:1.0, desc:"A single \u201cdirty snowball\u201d of ice, dust, and rock. Sunlight vaporizes surface ice into the glowing coma and tail as it nears the Sun." }
    ], note:"Comets are small, unmelted leftovers from the Solar System's formation, so they never separated into a core, mantle, and crust the way planets did." } },

  { id:"vesta", name:"Vesta", type:"Asteroid", color:"#b3ac9e",
    visualRadius:0.15, orbitRadius:36.5, orbitalPeriodYears:3.63, dayLengthHours:5.34, axialTilt:27, eccentricity:0.089,
    textureType:"asteroid-vesta", rings:false, isAsteroid:true, squash:[1,0.88,1],
    numeric:{diameterKm:525, massKg:2.59e20, distanceAU:2.36, moonsCount:0, periodDays:1326, lightMin:19.6},
    perspective:"On the basketball-Sun scale, Vesta would be a speck of dust about 61 m away.",
    real:{ diameter:"525 km", mass:"2.59 \u00d7 10\u00b2\u2070 kg", distance:"353 million km (2.36 AU)",
      orbitalPeriod:"3.63 Earth years", dayLength:"5.34 hours", moons:"0",
      temperature:"\u2248 -60\u00b0C average", discovered:"1807, by Wilhelm Olbers" },
    facts:[
      "Vesta is one of the brightest asteroids and is occasionally visible to the naked eye from Earth.",
      "A colossal impact carved the Rheasilvia crater near its south pole \u2014 almost as wide as Vesta itself.",
      "Many meteorites found on Earth (the HED family) are thought to be fragments blasted off Vesta.",
      "It's the second-most-massive object in the asteroid belt, after Ceres." ],
    relevance:[
      "Visited by NASA's Dawn spacecraft in 2011\u20132012, its first stop before Ceres.",
      "Vesta meteorites give scientists direct samples of a large asteroid without a sample-return mission." ],
    structure:{ layers:[
      { name:"Core", color:"#8a6d3b", outerFraction:0.45, desc:"An iron-nickel core \u2014 Vesta is one of the few asteroids known to have fully melted and separated like a small planet." },
      { name:"Mantle", color:"#7a6a52", outerFraction:0.85, desc:"An olivine-rich rocky mantle." },
      { name:"Crust", color:"#b3ac9e", outerFraction:1.0, desc:"A basaltic crust, scarred by the giant Rheasilvia impact basin near its south pole." }
    ] } },

  { id:"ceres", name:"Ceres", type:"Dwarf Planet", color:"#8a8378",
    visualRadius:0.22, orbitRadius:38, orbitalPeriodYears:4.6, dayLengthHours:9.07, axialTilt:4, eccentricity:0.076,
    textureType:"asteroid-ceres", rings:false, isAsteroid:true,
    numeric:{diameterKm:940, massKg:9.1e20, distanceAU:2.77, moonsCount:0, periodDays:1680, lightMin:23.0},
    perspective:"On that same scale, Ceres would be a speck of dust about 71 m away.",
    real:{ diameter:"940 km", mass:"9.1 \u00d7 10\u00b2\u2070 kg", distance:"414 million km (2.77 AU)",
      orbitalPeriod:"4.6 Earth years", dayLength:"9.07 hours", moons:"0",
      temperature:"\u2248 -105\u00b0C average", discovered:"January 1, 1801, by Giuseppe Piazzi" },
    facts:[
      "Ceres was the very first asteroid ever discovered \u2014 and for decades was classified as a planet.",
      "It's the largest object in the asteroid belt, containing about a third of the belt's total mass.",
      "Bright spots inside Occator crater turned out to be salt deposits left behind by briny water.",
      "It likely holds a large reservoir of water ice, and maybe a leftover subsurface ocean." ],
    relevance:[
      "The only dwarf planet located in the inner Solar System.",
      "Orbited up close by NASA's Dawn spacecraft from 2015 until 2018.",
      "A key target for understanding how much water small worlds can hold onto." ],
    structure:{ layers:[
      { name:"Core", color:"#5c4a3a", outerFraction:0.7, desc:"A dense rocky core." },
      { name:"Icy mantle", color:"#5a7a8a", outerFraction:0.95, desc:"A thick layer of ice and hydrated minerals, likely with leftover pockets of brine \u2014 a relic of a former subsurface ocean." },
      { name:"Crust", color:"#8a8378", outerFraction:1.0, desc:"A crust of salts, ice, and rock, including the bright deposits inside Occator crater." }
    ] } },

  { id:"pallas", name:"Pallas", type:"Asteroid", color:"#6b6459",
    visualRadius:0.14, orbitRadius:39, orbitalPeriodYears:4.62, dayLengthHours:7.81, axialTilt:84, eccentricity:0.231,
    textureType:"asteroid-pallas", rings:false, isAsteroid:true, squash:[1,0.9,1.08],
    numeric:{diameterKm:512, massKg:2.04e20, distanceAU:2.77, moonsCount:0, periodDays:1687, lightMin:23.0},
    perspective:"Pallas would be a speck of dust about 71 m away on this same scale.",
    real:{ diameter:"512 km", mass:"2.04 \u00d7 10\u00b2\u2070 kg", distance:"414 million km (2.77 AU)",
      orbitalPeriod:"4.62 Earth years", dayLength:"7.81 hours", moons:"0",
      temperature:"\u2248 -105\u00b0C average", discovered:"1802, by Wilhelm Olbers" },
    facts:[
      "Pallas was the second asteroid ever discovered, just a year after Ceres.",
      "Its orbit is tilted about 34\u00b0 from the plane most planets and asteroids share \u2014 unusually steep.",
      "It's heavily cratered and roughly egg-shaped rather than round.",
      "No spacecraft has ever visited Pallas up close." ],
    relevance:[
      "Its steep, elongated orbit helps scientists study how the early Solar System's chaos scattered small bodies." ],
    structure:{ layers:[
      { name:"Interior", color:"#6b6459", outerFraction:1.0, desc:"A mix of rock and ice, likely with only a partial separation into distinct layers rather than a sharp core, mantle, and crust." }
    ], note:"Pallas is thought to be only partially differentiated, unlike the fully-melted Vesta." } },

  { id:"hygiea", name:"Hygiea", type:"Asteroid", color:"#4f4a44",
    visualRadius:0.12, orbitRadius:41, orbitalPeriodYears:5.56, dayLengthHours:13.8, axialTilt:20, eccentricity:0.117,
    textureType:"asteroid-hygiea", rings:false, isAsteroid:true,
    numeric:{diameterKm:434, massKg:8.32e19, distanceAU:3.14, moonsCount:0, periodDays:2031, lightMin:26.1},
    perspective:"Hygiea would be a speck of dust about 81 m away on this same scale.",
    real:{ diameter:"434 km", mass:"8.32 \u00d7 10\u00b9\u2079 kg", distance:"470 million km (3.14 AU)",
      orbitalPeriod:"5.56 Earth years", dayLength:"13.8 hours", moons:"0",
      temperature:"\u2248 -110\u00b0C average", discovered:"1849, by Annibale de Gasparis" },
    facts:[
      "Hygiea is the fourth-largest object in the asteroid belt.",
      "Its nearly spherical shape led some astronomers to argue it could qualify as a dwarf planet.",
      "It's a dark, carbon-rich body, reflecting only a small fraction of the sunlight that hits it.",
      "It orbits in the outer part of the main asteroid belt, beyond Ceres and Pallas." ],
    relevance:[
      "A test case for where the line between \"asteroid\" and \"dwarf planet\" should be drawn." ],
    structure:{ layers:[
      { name:"Interior", color:"#4f4a44", outerFraction:1.0, desc:"A dark, carbon-rich mix of rock, clay minerals, and ice, thought to have stayed largely unmelted since it formed." }
    ], note:"Hygiea is a primitive body \u2014 too small and cold to have separated into a distinct core, mantle, and crust." } },

  { id:"andromeda", name:"Andromeda Galaxy", type:"Spiral Galaxy", color:"#8fb4ff",
    visualRadius:16, orbitRadius:230, orbitalPeriodYears:5e12, dayLengthHours:7.0e9, axialTilt:0,
    isGalaxy:true,
    numeric:{diameterKm:2.08e18, massKg:2.98e42, distanceAU:1.58e11, moonsCount:200, periodDays:2.92e11, lightMin:1.3149e12},
    perspective:"On the basketball-Sun scale where Earth is a peppercorn 26 m away, Andromeda would be another basketball-sized swarm of stars roughly 6,000 km away \u2014 out past the edge of the model entirely.",
    real:{ diameter:"\u2248 220,000 light-years across", mass:"\u2248 1.5 trillion solar masses, including dark matter (\u2248 2.98 \u00d7 10\u2074\u00b2 kg)", distance:"\u2248 2.5 million light-years from the Sun",
      orbitalPeriod:"Not gravitationally bound to the Sun \u2014 falling toward the Milky Way at roughly 110 km/s", dayLength:"One full rotation takes about 800 million years", moons:"200+ satellite galaxies, including M32 and M110",
      temperature:"\u2014", discovered:"Known since antiquity as a faint smudge; first proven to lie outside the Milky Way by Edwin Hubble in 1925" },
    facts:[
      "It holds roughly one trillion stars \u2014 about twice as many as the Milky Way.",
      "It's the most distant object most people can see with the naked eye, even from 2.5 million light-years away.",
      "Andromeda and the Milky Way are approaching each other and will begin merging in about 4 billion years, into a galaxy sometimes nicknamed \u201cMilkomeda.\u201d",
      "The light reaching your eyes tonight left Andromeda before modern humans existed." ],
    relevance:[
      "The nearest large spiral galaxy, making it the best natural laboratory for studying how galaxies like our own are built.",
      "The Hubble Space Telescope has resolved over 100 million individual stars in its disk.",
      "Tracking its inbound velocity underpins predictions for the eventual Milky Way\u2013Andromeda merger." ],
    structure:{ layers:[
      { name:"Galactic core", color:"#fff6df", outerFraction:0.18, desc:"A dense central bulge of old stars surrounding a supermassive black hole roughly 100 million times the Sun's mass." },
      { name:"Spiral arms", color:"#9fc2ff", outerFraction:0.72, desc:"Sweeping lanes of gas and dust threaded with young blue star clusters, where most new stars are born." },
      { name:"Stellar halo", color:"#4a5578", outerFraction:1.0, desc:"A faint, sprawling halo of ancient stars and globular clusters enveloping the whole galaxy." }
    ] } }
];

const ORBIT_BASE = 0.319, ORBIT_EXP = 0.55;
const ROT_BASE = 1.347, ROT_EXP = 0.5;

/* Solve Kepler's equation M = E - e*sin(E) for the eccentric anomaly E via Newton-Raphson.
   Combined with x = a(cosE - e), z = a*sqrt(1-e^2)*sinE this gives an exact Keplerian
   ellipse with the Sun at a focus, and (since M is the mean anomaly and grows uniformly
   with time) automatically reproduces Kepler's second law: planets sweep faster near
   perihelion and slower near aphelion. */
function keplerE(M, e){
  M = ((M % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
  if(M > Math.PI) M -= Math.PI*2;
  let E = M + e*Math.sin(M);
  for(let i=0;i<10;i++){
    const f = E - e*Math.sin(E) - M;
    const fp = 1 - e*Math.cos(E);
    E -= f/fp;
  }
  return E;
}

