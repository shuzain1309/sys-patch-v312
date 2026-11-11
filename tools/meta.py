import glob, re
TITLE = "The Entire History of Germany in 60 Minutes"
SLUG = 'germany-entire-history'
THEME_TS = "{fps: 30, hue: 45, bg: '#10131f', fg: '#f6f4ec', accent: '#e2b84a', accent2: '#d9433a', narrator: 'narrator'}"

SEO = {
 "title": "Germany's Curse of the Middle: The Entire History of Germany in 60 Minutes",
 "titleOptions": [
  "The Entire History of Germany in 60 Minutes",
  "Why Germany Is Younger Than America (2,000 Years in 60 Minutes)",
  "Too Weak or Too Strong: The Curse That Shaped Germany"],
 "description": "Germany is younger than the United States, yet it has shaken Europe more than any other country. Why? Because it sits in the middle. This stick figure history explainer runs from the forest that stopped Rome to Charlemagne's elephant, Gutenberg and Luther, the Thirty Years' War, Frederick the Great, Bismarck, the Kaiser, hyperinflation, the Third Reich, the Berlin Wall and Germany today, tracking every time the country was either too weak or too strong.\n\nWhat you will learn: why Germany was weak and divided for 1,000 years, how it became strong in a single generation, why that scared everyone, and what the world is asking of Germany now.\n\nChapters:\n{{CHAPTERS}}\n\nSources and further reading: Tacitus, Germania; Peter H. Wilson, Heart of Europe; Christopher Clark, Iron Kingdom; Richard J. Evans, The Coming of the Third Reich; Frederick Taylor, The Berlin Wall; Nicholas Stargardt, The German War.\n\n{{CREDITS}}",
 "tags": ["history of germany", "german history", "germany explained", "entire history of germany", "germany in 60 minutes", "arminius", "charlemagne", "holy roman empire", "martin luther", "gutenberg", "thirty years war", "frederick the great", "bismarck", "kaiser wilhelm", "weimar republic", "berlin wall", "german reunification", "angela merkel", "stick figure history", "history explained"],
 "hashtags": ["#GermanHistory", "#Germany", "#History"],
 "categoryId": "27", "introLabel": "Intro", "thumbnailText": "TOO WEAK. TOO STRONG."
}

def L(hat, shirt, pants, skin, outfit, g, note, **k):
    d = {"hat": hat, "shirt": shirt, "pants": pants, "skin": skin, "outfit": outfit, "g": g, "era": k.pop('era', 'modern'), "note": note}
    d.update(k); return d
Y = '#f0d2b6'; D = '#6b4430'
M, F = 'm', 'f'
BIBLE = {"looks": {
 # --- narrator: the conical-hat guide from the reference video
 "narrator": L("conical", "#efe6cc", "#c9b88a", "#f6dcc0", "tunic", M, "Narrator: conical straw hat, red scarf, tunic. Same guide in every era.", extra="scarf", ec="#c0392b", hair="short", hc="#5a4632"),
 # --- ch1 forest
 "arminius": L("none", "#5a6a3a", "#4a3a28", Y, "tunic", M, "Arminius: Germanic noble in green tunic and cloak, long fair hair. Generic.", era="ancient", hair="long", hc="#c9a45a", facial="full", fc="#c9a45a", cape="#5a4a30"),
 "flavus": L("helmet", "#8a2a2a", "#6a2020", Y, "armor", M, "Flavus: Roman auxiliary officer in red, helmet. Generic.", era="ancient", facial="stache", fc="#6a4a2a", trim="#e2b84a"),
 "varus": L("crest", "#8a2a2a", "#6a2020", Y, "armor", M, "Varus: Roman governor-general with crested helmet. Generic.", era="ancient", facial="none", trim="#e2b84a", cape="#8a2a2a"),
 "augustus": L("laurel", "#efe9dc", "#efe9dc", Y, "toga", M, "Augustus: elderly emperor in white toga and laurel. Generic.", era="ancient", hair="short", hc="#d8d8d8", toga="#efe9dc", trim="#8a2b9a"),
 "legionary": L("helmet", "#8a2a2a", "#6a2020", Y, "armor", M, "Roman legionary. Generic.", era="ancient", trim="#e2b84a"),
 "germanic": L("none", "#7a5a3a", "#4a3a28", Y, "tunic", M, "Germanic warrior in fur-trimmed brown tunic, wild hair. Generic.", era="ancient", hair="wild", hc="#b08a4a", facial="full", fc="#b08a4a"),
 # --- ch2-3 medieval
 "charlemagne": L("crown", "#2a4a8a", "#1f3a6a", Y, "robe", M, "Charlemagne: blue robe, red cloak, gold crown, long moustache and beard. Generic.", era="medieval", hair="long", hc="#8a6a3a", facial="full", fc="#8a6a3a", cape="#9a2a2a", trim="#e2b84a"),
 "pope": L("mitre", "#f4f1e6", "#d9d4c5", Y, "robe", M, "A pope in white robe and mitre. Generic.", era="medieval", facial="long", fc="#d8d8d8", trim="#e2b84a"),
 "otto": L("crown", "#7a2a2a", "#5a1f1f", Y, "robe", M, "Otto, first Holy Roman Emperor: red robe, crown, full beard. Generic.", era="medieval", facial="full", fc="#6a4a2a", cape="#2a2a4a", trim="#e2b84a"),
 "henry_penitent": L("none", "#9a9a94", "#7a7a74", Y, "robe", M, "Henry IV as a penitent: plain grey sackcloth, barefoot, in the snow. Generic.", era="medieval", hair="short", hc="#6a4a2a", facial="stache", fc="#6a4a2a", bare=True),
 "friar": L("none", "#5a4630", "#4a3a28", Y, "robe", M, "Medieval friar in brown habit. Generic.", era="medieval", hair="bald", facial="none"),
 "piper": L("cavalier", "#c0392b", "#e2b84a", Y, "robe", M, "Pied Piper: half red, half yellow cloak, feathered hat. Generic.", era="medieval", facial="goatee", fc="#6a4a2a", trim="#e2b84a"),
 "peasant_m": L("straw", "#7a6a4a", "#4a3a28", Y, "tunic", M, "German peasant man in straw hat. Generic.", era="medieval", facial="stache", fc="#6a4a2a"),
 "peasant_f": L("bun", "#7a5a8a", "#5a3a6a", Y, "dress", F, "German peasant woman, plum dress, hair bun. Generic.", era="medieval", hc="#5a3a28", trim="#f0d9a8"),
 "child_de": L("none", "#d9a05a", "#4a3a28", Y, "tunic", M, "Child in a simple tunic. Generic.", era="medieval", hair="short", hc="#b08a4a"),
 # --- ch4 gutenberg + luther
 "gutenberg": L("top", "#7a1f1f", "#5a1414", Y, "robe", M, "Gutenberg: tall brown hat, maroon robe, full beard. Matches the reference stick figure.", era="medieval", facial="full", fc="#5a3a28", trim="#e2b84a"),
 "fust": L("top", "#1f1f27", "#15151b", Y, "robe", M, "Johann Fust, lender: tall black hat, black robe, gold trim. Generic.", era="medieval", facial="goatee", fc="#3a2a20", trim="#e2b84a"),
 "tetzel": L("none", "#e9e4d4", "#2a2a30", Y, "robe", M, "Johann Tetzel: white Dominican habit, black cloak, round and cheerful. Generic.", era="medieval", hair="bald", facial="stache", fc="#6a4a2a", cape="#2a2a30"),
 "luther_monk": L("none", "#2a2a30", "#1f1f25", Y, "robe", M, "Luther as a young monk: black Augustinian robe, bald tonsure. Generic.", era="medieval", hair="bald", facial="none", trim="#d8d8d8"),
 "junker_jorg": L("beret", "#6a4a2a", "#4a3320", Y, "coat", M, "Luther in hiding as Junker Jorg: knight's coat, black beret, full beard. Generic.", era="medieval", facial="full", fc="#4a3320", trim="#2a2a30"),
 "devil": L("none", "#6a1a1a", "#4a1010", "#b33a2e", "robe", M, "The devil (Luther's inkwell legend): red skin, dark robe, wild hair. Cartoon.", era="medieval", hair="wild", hc="#1f1f25", facial="goatee", fc="#1f1f25"),
 "katharina": L("bun", "#5a6a9a", "#3a456a", Y, "dress", F, "Katharina von Bora: blue dress, white cap. Generic.", era="medieval", hc="#6a4a2a", trim="#f4f1e6"),
 # --- ch5 thirty years war
 "landsknecht": L("cavalier", "#9a2a2a", "#e2b84a", Y, "coat", M, "Landsknecht mercenary: slashed red-and-gold doublet, feathered hat. Generic.", era="medieval", facial="stache", fc="#4a3320", trim="#e2b84a"),
 "cardinal": L("biretta", "#b3202a", "#8a1a22", Y, "robe", M, "Cardinal Richelieu: scarlet robe and biretta, pointed beard. Generic.", era="medieval", facial="goatee", fc="#2a2a30", trim="#f4f1e6"),
 "swedish_king": L("cavalier", "#2a4a9a", "#1f3a7a", Y, "coat", M, "Gustavus Adolphus: blue coat, yellow trim, feathered hat. Generic.", era="medieval", facial="stache", fc="#b08a4a", trim="#f2c230"),
 "bohemian": L("cavalier", "#3a3a4a", "#2a2a35", Y, "coat", M, "Bohemian noble in dark coat and feathered hat. Generic.", era="medieval", facial="goatee", fc="#3a2a20", trim="#c0392b"),
 "regent": L("cavalier", "#4a2a2a", "#3a1f1f", Y, "coat", M, "Habsburg regent in dark red coat, ruff and hat. Generic.", era="medieval", facial="stache", fc="#2a2a30", trim="#d8d8d8"),
 # --- ch6-7 prussia
 "soldier_king": L("tricorn", "#1f2a4d", "#f4f1e6", Y, "coat", M, "Frederick William I, the Soldier King: Prussian blue coat, tricorn, stern. Generic.", era="medieval", facial="none", trim="#d8b24a", shoes="#1a1a1a"),
 "frederick": L("tricorn", "#1f2a4d", "#f4f1e6", Y, "coat", M, "Frederick the Great: Prussian blue coat, grey star, tricorn, thin and clever. Generic.", era="medieval", facial="none", trim="#d8b24a"),
 "giant_guard": L("bearskin", "#1f2a4d", "#f4f1e6", Y, "coat", M, "Potsdam Giant: very tall grenadier in blue coat and tall hat. Draw at s:1.35.", era="medieval", facial="stache", fc="#6a4a2a", trim="#d8b24a"),
 "maria_theresa": L("diadem", "#3a6a5a", "#2a4f43", Y, "dress", F, "Maria Theresa: green court dress, small crown. Generic.", era="medieval", hair="bob", hc="#6a4a2a", trim="#e2b84a"),
 "napoleon": L("bicorne", "#1f3a7a", "#f4f1e6", Y, "coat", M, "Napoleon: blue coat, bicorne worn sideways, hand in coat. Generic.", era="medieval", facial="none", trim="#d8b24a"),
 "grimm": L("none", "#5a4a3a", "#3a3028", Y, "coat", M, "A Brother Grimm: brown coat, wispy hair, holding a book. Generic.", era="medieval", hair="parted", hc="#5a4a3a", facial="stache", fc="#5a4a3a", glasses=True),
 # --- ch8-9 empire
 "bismarck": L("pickelhaube", "#e9e4d4", "#d9d4c5", Y, "coat", M, "Bismarck: white cuirassier coat, spiked helmet, bald, thick moustache. Generic.", facial="stache", fc="#8a7a5a", trim="#d8b24a", hair="bald"),
 "wilhelm_i": L("pickelhaube", "#1f2a4d", "#3a3f5a", Y, "coat", M, "Wilhelm I: blue uniform, spiked helmet, white side-whiskers. Generic.", facial="full", fc="#e0e0e0", trim="#d8b24a"),
 "wilhelm_ii": L("pickelhaube", "#8a9aa8", "#5a6a78", Y, "coat", M, "Kaiser Wilhelm II: pale blue-grey uniform, spiked helmet, upturned moustache. Generic.", facial="stache", fc="#6a4a2a", trim="#d8b24a", cape="#d8d8d8"),
 "virchow": L("none", "#2b2d33", "#1f2028", Y, "coat", M, "Rudolf Virchow: black coat, round glasses, goatee. Generic.", hair="parted", hc="#8a8a8a", facial="goatee", fc="#8a8a8a", glasses=True),
 "zimmermann": L("none", "#2b2d33", "#1f2028", Y, "coat", M, "Arthur Zimmermann: dark suit, thin moustache, glasses. Generic.", hair="bald", facial="stache", fc="#8a8a8a", glasses=True),
 "lenin": L("none", "#3a3a3a", "#2a2a2a", Y, "coat", M, "Lenin: dark coat, bald with pointed beard. Generic.", hair="bald", facial="goatee", fc="#7a4a2a"),
 "tsar": L("peaked", "#4a5a3a", "#3a4a2a", Y, "coat", M, "Tsar Nicholas II: green field uniform, peaked cap, soft beard. Generic.", facial="full", fc="#6a4a2a", trim="#d8b24a"),
 "george_v": L("peaked", "#1f2a4d", "#151d3a", Y, "coat", M, "King George V: navy naval uniform, peaked cap, trimmed beard. Generic.", facial="goatee", fc="#6a5a4a", trim="#d8b24a"),
 "ulbricht": L("none", "#5a5a62", "#3a3a42", Y, "coat", M, "Walter Ulbricht: grey suit, pointed goatee, thin glasses. Generic.", hair="bald", facial="goatee", fc="#9a9a9a", glasses=True),
 "adenauer": L("none", "#2b2d33", "#1f2028", Y, "coat", M, "Konrad Adenauer: elderly, dark suit, bald, calm. Generic.", hair="bald", facial="none"),
 "brandt": L("none", "#3a3f4a", "#2a2f3a", Y, "coat", M, "Willy Brandt: dark overcoat, parted hair. Generic.", hair="parted", hc="#6a5a4a"),
 "landser": L("stahlhelm", "#6b7260", "#4a5040", Y, "coat", M, "German soldier in steel helmet and field-grey coat. Generic.", trim="#3a3f33"),
 "tommy": L("helmet", "#8a7a4a", "#6a5a3a", Y, "coat", M, "British soldier in a khaki coat, shallow helmet. Generic.", trim="#6a5a3a"),
 # --- ch10-12 interwar and war
 "hitler_sil": L("none", "#16161c", "#16161c", "#16161c", "coat", M, "SILHOUETTE ONLY: solid black figure, no face, no uniform detail, no insignia, never saluting. Stands in for Hitler.", hair="parted", hc="#16161c"),
 "hindenburg": L("pickelhaube", "#3a3f4a", "#2a2f3a", Y, "coat", M, "Hindenburg: elderly field marshal, grey coat, spiked helmet, big white moustache. Generic.", facial="stache", fc="#e0e0e0", trim="#d8b24a"),
 "papen": L("top", "#2b2d33", "#1f2028", Y, "coat", M, "Franz von Papen: top hat, dark tailcoat, thin smile. Generic.", hair="parted", hc="#8a8a8a", facial="stache", fc="#8a8a8a", trim="#d8d8d8"),
 "einstein": L("none", "#4a4a52", "#2f3038", Y, "coat", M, "Einstein: grey jumper, wild white hair, moustache. Generic.", hair="wild", hc="#e0e0e0", facial="stache", fc="#e0e0e0"),
 "dancer": L("none", "#c0392b", "#2a2a30", Y, "dress", F, "1920s Berlin cabaret dancer: red dress, bob. Generic.", hair="bob", hc="#2a2a30", trim="#e2b84a"),
 "citizen_m": L("none", "#6a6a74", "#3a3a44", Y, "coat", M, "Ordinary German man in grey coat. Generic.", hair="short", hc="#5a4a3a"),
 "citizen_f": L("bun", "#8a6a7a", "#5a3a4a", Y, "dress", F, "Ordinary German woman, mauve dress. Generic.", hc="#6a4a2a", trim="#f0d9a8"),
 "owens": L("none", "#f4f4f4", "#f4f4f4", D, "tunic", M, "Jesse Owens: white athletics kit, short hair. Generic.", hair="short", hc="#1f1a17", trim="#c0392b"),
 "luz_long": L("none", "#f4f4f4", "#f4f4f4", Y, "tunic", M, "Luz Long: white athletics kit, blond hair. Generic.", hair="short", hc="#e2c260", trim="#1f1f27"),
 "sophie": L("none", "#3a3a4a", "#2a2a35", Y, "dress", F, "Sophie Scholl: dark dress, short bob. Generic.", hair="bob", hc="#4a3320", trim="#d8d8d8"),
 "officer_de": L("peaked", "#6b7260", "#4a5040", Y, "coat", M, "German staff officer: peaked cap, field-grey coat. Generic.", facial="none", trim="#c0392b"),
 # --- ch13-16 postwar and now
 "pilot_us": L("cap", "#6a7a4a", "#4a5a30", Y, "coat", M, "Gail Halvorsen: US pilot in olive jacket and cap. Generic.", trim="#d8d8d8"),
 "schabowski": L("none", "#4a4a52", "#35353d", Y, "coat", M, "Gunter Schabowski: grey suit, glasses, receding hair. Generic.", hair="short", hc="#8a8a8a", glasses=True),
 "reporter": L("none", "#7a6a55", "#4a4035", Y, "coat", M, "Reporter in a trench coat with a notebook. Generic.", hair="short", hc="#4a3a2a", glasses=True),
 "vopo": L("peaked", "#6b7260", "#4a5040", Y, "coat", M, "East German border guard: grey-green coat, peaked cap. Generic.", trim="#3a3f33"),
 "stasi": L("bowler", "#6a6a6e", "#3a3a3e", Y, "coat", M, "Stasi officer in a grey raincoat and dark hat. Generic.", facial="none", glasses=True),
 "merkel": L("none", "#2a8a7a", "#2a2a35", Y, "coat", F, "Angela Merkel: teal blazer, short bob, calm. Generic.", hair="bob", hc="#8a6a4a", trim="#d8d8d8"),
 "merz": L("none", "#2b2d42", "#2b2d42", Y, "coat", M, "Friedrich Merz: dark suit, white hair, tall. Generic.", hair="short", hc="#d8d8d8"),
 "sikorski": L("none", "#2f3138", "#2a2b33", Y, "coat", M, "Radoslaw Sikorski: dark suit, red tie, short hair, glasses. Generic.", hair="short", hc="#6a5a4a", glasses=True),
 "diplomat": L("none", "#4a4a52", "#35353d", Y, "coat", M, "Diplomat in a grey suit. Generic.", hair="short", hc="#6a5a4a"),
 "dissident": L("none", "#5a6a7a", "#3a4450", Y, "coat", M, "East German protester in a blue jacket. Generic.", hair="short", hc="#6a4a2a"),
 "poland_pm": L("none", "#c0392b", "#8a2a22", Y, "coat", F, "Polish citizen in red jacket. Generic.", hair="bob", hc="#6a4a2a"),
 "nl_citizen": L("none", "#e2903a", "#8a5a22", Y, "coat", F, "Dutch citizen in orange jacket. Generic.", hair="bob", hc="#d9b86a"),
 "fr_citizen": L("none", "#2d5fb4", "#1f4585", Y, "dress", F, "French citizen in blue dress, hair in a bun. Generic.", hair="bob", hc="#4a3320"),
}, "factions": {
 "Germani": {"c": "#5a6a3a", "c2": "#c9a227", "kind": "barbarian"}, "Rome": {"c": "#8a2a2a", "c2": "#e2b84a", "kind": "legion"},
 "Franks": {"c": "#2a4a8a", "c2": "#e2b84a", "kind": "generic"}, "Saxons": {"c": "#7a5a3a", "c2": "#d8d8d8", "kind": "barbarian"},
 "Empire": {"c": "#e2b84a", "c2": "#1f1f27", "kind": "generic"}, "Mercenaries": {"c": "#9a2a2a", "c2": "#e2b84a", "kind": "generic"},
 "Sweden": {"c": "#2a4a9a", "c2": "#f2c230", "kind": "generic"}, "Prussia": {"c": "#1f2a4d", "c2": "#f4f1e6", "kind": "guard"},
 "France": {"c": "#2a4a9a", "c2": "#f4f1e6", "kind": "napoleonic"}, "Austria": {"c": "#e8e4d6", "c2": "#c8102e", "kind": "generic"},
 "Russia": {"c": "#3f7a4a", "c2": "#d8b24a", "kind": "rifleman"}, "Reich": {"c": "#6b7260", "c2": "#d8b24a", "kind": "rifleman"},
 "Allies": {"c": "#3b6fb6", "c2": "#f4f1e6", "kind": "rifleman"}, "Wehrmacht": {"c": "#6b7260", "c2": "#1f1f27", "kind": "rifleman"},
 "Soviets": {"c": "#a8242c", "c2": "#f2c230", "kind": "rifleman"}, "Bundeswehr": {"c": "#4a5a3a", "c2": "#d8b24a", "kind": "rifleman"}}}

VOICE = {'king': 'm', 'banker': 'm', 'woman': 'f'}  # the only voice tags the TTS knows; gender is enforced against the look's `g`

# ---- photo candidates (Wikimedia Commons; PD / CC0 / CC BY only). Only ids actually used by a scene are emitted.
def P(id, q, must, alt): return {"id": id, "q": q, "must": must, "alt": alt}
PH = [
 P("hermann_monument", "Hermannsdenkmal Detmold monument", ["hermann"], "The Hermann Monument, Detmold"),
 P("kalkriese_mask", "Kalkriese Roman cavalry helmet mask", ["kalkriese", "mask"], "Roman face mask found at Kalkriese"),
 P("charlemagne", "Charlemagne Durer portrait", ["karl", "charlemagne"], "Charlemagne"),
 P("aachen_chapel", "Aachen Cathedral Palatine Chapel interior", ["aachen"], "The Palatine Chapel, Aachen"),
 P("gutenberg", "Johannes Gutenberg portrait engraving", ["gutenberg"], "Johannes Gutenberg"),
 P("gutenberg_bible", "Gutenberg Bible page", ["gutenberg", "bible"], "A page of the Gutenberg Bible"),
 P("luther_cranach", "Martin Luther Lucas Cranach portrait", ["luther"], "Martin Luther, by Lucas Cranach"),
 P("wartburg", "Wartburg castle Eisenach", ["wartburg"], "The Wartburg"),
 P("magdeburg_1631", "Sack of Magdeburg 1631 engraving", ["magdeburg"], "The sack of Magdeburg, 1631"),
 P("frederick_great", "Frederick the Great Anton Graff portrait", ["friedrich", "frederick"], "Frederick the Great"),
 P("frankfurt_parliament", "Paulskirche Frankfurt Parliament 1848", ["paulskirche", "frankfurt"], "The Frankfurt Parliament, 1848"),
 P("bismarck", "Otto von Bismarck portrait", ["bismarck"], "Otto von Bismarck"),
 P("kaiser_proclamation", "Proclamation of the German Empire Anton von Werner", ["proklamation", "proclamation", "kaiser"], "The proclamation of the German Empire, 1871"),
 P("wilhelm_ii", "Kaiser Wilhelm II portrait", ["wilhelm"], "Kaiser Wilhelm II"),
 P("zimmermann_telegram", "Zimmermann Telegram", ["zimmermann"], "The Zimmermann Telegram, 1917"),
 P("versailles_signing", "Signing of the Treaty of Versailles Orpen", ["versailles", "orpen"], "Signing the Treaty of Versailles, 1919"),
 P("inflation_1923", "German hyperinflation 1923 banknotes", ["inflation", "banknote", "notgeld"], "Hyperinflation, 1923"),
 P("reichstag_fire", "Reichstag fire 1933", ["reichstag"], "The Reichstag fire, 1933"),
 P("berlin_ruins_1945", "Berlin ruins 1945", ["berlin", "ruins"], "Berlin in ruins, 1945"),
 P("candy_bomber", "Berlin Airlift Halvorsen candy bomber", ["airlift", "halvorsen", "berlin"], "The Berlin Airlift"),
 P("wall_1961", "Berlin Wall construction August 1961", ["wall"], "Building the Berlin Wall, 1961"),
 P("brandenburg_1989", "Brandenburg Gate Berlin Wall November 1989", ["wall", "brandenburg"], "The Wall falls, 1989"),
 P("merkel", "Angela Merkel portrait", ["merkel"], "Angela Merkel"),
 P("bundestag", "Bundestag plenary hall Reichstag building", ["bundestag", "reichstag"], "The Bundestag"),
 P("sikorski", "Radoslaw Sikorski portrait", ["sikorski"], "Radoslaw Sikorski"),
]
_used = set()
for f in glob.glob('ch/ch*.txt'): _used |= set(re.findall(r'photos/(\w+)\.jpg', open(f, encoding='utf8').read()))
PHOTOS = [p for p in PH if p['id'] in _used]

MUSIC_KEYS = ["modern_tension", "conspiracy", "ceremony", "wonder", "organ_church", "tragic", "imperial_march", "revolution_tension", "march_tense", "war_dread", "cabaret_1920s", "conspiracy", "tragic", "cold_war_tension", "hope_piano", "modern_tension", "wonder"]
