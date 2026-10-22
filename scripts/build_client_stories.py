# -*- coding: utf-8 -*-
"""
Script to compile all 75 client oral history stories into prisma/data/client-stories.ts
"""
import json
import os

STORIES_RAW_PART1 = [
    {
        "id": 1,
        "speaker": "Kamla Devi",
        "age": 82,
        "location": "Varanasi, Uttar Pradesh",
        "region": "Varanasi, Uttar Pradesh",
        "language": "Hindi",
        "title": "A Hand's Width of Silk: Four Generations at the Loom",
        "slug": "kamla-devi-banarasi-silk-border",
        "topic": "Banarasi Handloom Weaving",
        "decade": "1950s",
        "start": 1950,
        "end": 1958,
        "duration": 345,
        "collection": "vanishing-professions",
        "themes": ["craft", "family", "work-and-livelihood", "womens-histories"],
        "keywords": ["banarasi silk", "handloom", "varanasi", "loom", "sari border", "four generations", "weaver pause"],
        "summary": "At 82, master Banarasi silk weaver Kamla Devi reflects on seventy-five years at the frame loom, explaining how four generations wove a single hand's width of cloth, and why the weaver's true signature lives in a thread pulled slightly tighter than the rest.",
        "text": """Tell me about your work.
I sat at a loom at seven years old, with my feet not yet reaching the pedals. My father put a wooden block under them. That is how I learned: block under the feet, hands doing what they were told. Seventy-five years of Banarasi silk. I have woven saris that brides wore into marriages in Delhi, Dubai, London. I have never once seen a photograph of any of them.
Did you ever wear one yourself?
Once. My own wedding sari, when I was fourteen. My mother-in-law sold it during a bad year. I did not cry. A weaver learns that cloth goes away. It is made to go away.
Then what do you want to leave?
Not a sari. Come, I will show you.
(She walks to a corner of the room, where a small frame loom stands.)
Everyone in my family has woven a border on this. A border is the edge of a sari, the part nobody looks at first and everyone remembers last. My grandmother wove a row of small mango leaves. My mother added peacocks. I added the lotus, and my husband, who never touched a loom, added a mistake in the third row that we never fixed, because it made us laugh.
It is only a hand's width of cloth, and it has four generations in it. I am almost at the end of the silk I had saved for this. When I die, I want my granddaughter, Pooja, to continue it. She works in an office in Noida now. She says she has forgotten everything. I tell her the hands remember even when the head forgets.
Is she willing?
She says she will try. She cried when I showed her where my part ends. I said, "Beta, don't cry, just begin where I stop." That is all I want. I don't want the cloth finished. If a thing is finished, nobody has a reason to come back to it.
I also want people to know that the weaver's name is not on the sari. The shop's name is there. The designer's name is there. But somewhere in a corner, inside a leaf or a petal, there is a place where a thread goes a little tighter than the others. That is me. If a woman in some faraway city ever runs her finger along a sari and feels a place that is slightly different, I would like her to pause for just a moment.
That is all. The pause."""
    },
    {
        "id": 2,
        "speaker": "Zubaida Begum",
        "age": 74,
        "location": "Lucknow, Uttar Pradesh",
        "region": "Lucknow, Uttar Pradesh",
        "language": "Urdu",
        "title": "Thirty-Two Stitches: The Muslin Dictionary of Chowk",
        "slug": "zubaida-begum-chikankari-thirty-two-stitches",
        "topic": "Chikankari White-on-White Embroidery",
        "decade": "1960s",
        "start": 1965,
        "end": 1969,
        "duration": 310,
        "collection": "womens-untold-histories",
        "themes": ["craft", "womens-histories", "education", "work-and-livelihood"],
        "keywords": ["chikankari", "lucknow", "chowk", "murri stitch", "bakhia", "muslin book", "embroidery"],
        "summary": "Chikankari needlework master Zubaida Begum recalls teaching thirty-two heritage stitches to neighborhood girls in Chowk, crafting a cloth book on muslin, and explaining why curiosity is a gift that holds the world together.",
        "text": """I do chikankari, the white-on-white embroidery. My eyes are going now, so what I tell you I tell from memory, not from sight.
How many stitches do you know?
Thirty-two. The old ones, anyway. Murri, phanda, jaali, bakhia, keel, hool. Every stitch has a name and a temper. Bakhia is shy, you have to coax it from behind the cloth. Jaali is proud, it wants to be seen as lace. When I was young, I thought learning these was the work. Now I know the work is teaching them.
Who did you teach?
Whoever came. In my lane, in Chowk, girls would sit on my veranda after school. I charged nothing. Some of them are grandmothers now and still send me pieces for opinions. But the truth is, most of my students left embroidery. It does not pay. A girl can earn more in a call centre in one week than I did in a month of threading.
Does that sadden you?
It did. Then I thought, why should a girl strain her eyes for a few hundred rupees? So I stopped being sad and started being practical.
I made a book. Not a printed one, a cloth one. A long strip of muslin, and on it, one by one, I stitched all thirty-two stitches, each with its name written in Urdu below. My nephew's wife says it is like a dictionary. I say it is more like a family tree, because the stitches too are related. Murri is the mother of many others.
I want that cloth book to go to the girl who is most curious, not the one who is most skilled. Skill can be built. Curiosity is a gift from Allah.
And if no one is curious?
Then it will sit in a trunk, and one day a great-granddaughter will open it and wonder who made this. And she will pick up a needle, perhaps to see how hard it is. And she will find out.
I have seen a flower take twelve stitches. Twelve small decisions, and you have something that was not there before. That is the only magic I trust.
My husband used to say, "Zubaida, you leave nothing but thread." I told him thread is what holds the world together, you fool."""
    },
    {
        "id": 3,
        "speaker": "Gurdev Singh",
        "age": 85,
        "location": "near Ludhiana, Punjab",
        "region": "Ludhiana, Punjab",
        "language": "Punjabi",
        "title": "Baskets to Lahore: Heirloom Seeds and Dussehri Mangoes",
        "slug": "gurdev-singh-dussehri-mangoes-lahore",
        "topic": "Heirloom Seeds & Cross-Border Friendship",
        "decade": "1970s",
        "start": 1971,
        "end": 1976,
        "duration": 360,
        "collection": "partition-memories",
        "themes": ["farming", "partition", "resilience", "community"],
        "keywords": ["ludhiana", "lahore", "partition", "dussehri mango", "bansi wheat", "heirloom seeds", "punjab"],
        "summary": "Punjab farmer Gurdev Singh speaks on preserving pre-Green Revolution bansi wheat varieties and sending a journey-ripened basket of Dussehri mangoes across the border to his boyhood friend Karim in Lahore every June since 1971.",
        "text": """I am a farmer. I will say it plainly because there is no shame in it, though my sons wanted me to say "agriculturist" to sound better.
What was farming like when you began?
Slow and kind. We used bullocks. We saved our own seed. I remember my father pressing wheat grains between his teeth to judge them, like a jeweller testing gold. Then came the Green Revolution, new seeds, fertiliser, tubewells. Everything grew more. I will not say it was wrong. We were hungry before it. But somewhere along the way, we forgot things.
What did you forget?
The old varieties. There was a wheat called bansi, a rice with a smell like rain on dust. My grandchildren have never tasted them. I kept a small plot, half an acre behind the house, where I grew these old seeds each year, only to keep them alive. People laughed at me. "Sardarji, there is no profit." I said, "Who said anything about profit?"
So the seeds are what you want to leave?
The seeds, yes, in cloth bags with names written on them. But also this.
(He points through the window to a mango tree.)
I planted that in 1971, the year my first son was born. A grafted dussehri. It fruited first when he was five. Every June since, I have sent a basket of mangoes to my friend Karim in Lahore. Not directly, of course. Through a cousin who travels, through a shopkeeper who knows a man. It takes weeks. The mangoes arrive soft, nearly spoiled, and Karim writes back that they are the best he has ever tasted. He is lying, and I love him for it.
We were boys together in a village that is now on the other side. We have met only twice in seventy years.
When I die, I want my sons to keep sending those mangoes. If the border is closed, send them through someone. If Karim is gone, send them to his children. I don't care how long it takes the basket to travel. A mango ripening in a long journey is a small argument against hatred.
And sit under that tree sometimes. Don't let it become firewood or a plot for a house. Sit there, eat, spit the seeds on the ground. Something will grow. That's the entire philosophy of my life. Throw seeds. Be patient. Send mangoes."""
    },
    {
        "id": 4,
        "speaker": "Meenakshi Ammal",
        "age": 79,
        "location": "Madurai, Tamil Nadu",
        "region": "Madurai, Tamil Nadu",
        "language": "Tamil",
        "title": "Love Spoken by the Shy: The Rasam of Madurai",
        "slug": "meenakshi-ammal-madurai-temple-mess-recipes",
        "topic": "Temple Mess Cooking & Culinary Memories",
        "decade": "1980s",
        "start": 1982,
        "end": 1988,
        "duration": 330,
        "collection": "grandmothers-kitchen",
        "themes": ["food", "family", "faith-and-ritual", "womens-histories"],
        "keywords": ["madurai", "temple mess", "rasam", "pongal", "heirloom cooking", "green notebook", "tamil nadu"],
        "summary": "Having fed ninety people a day for forty-one years at a mess near Madurai's Meenakshi temple, Meenakshi Ammal shares her green notebook filled not with measurements, but with human stories of grief, birth, and healing.",
        "text": """My daughters-in-law keep asking for measurements. "Amma, how much tamarind?" I say, "Enough." "How much salt?" "Until it is right." They find this very irritating.
You were a cook?
For forty-one years I cooked at a small mess near the Meenakshi temple. Rice, sambar, rasam, two vegetables, curd. Ninety people a day. We never closed, not even the day after my husband died. People were hungry, and hunger does not attend funerals.
What have you learned from feeding so many people?
That food is how love is spoken by people who are shy. In my house nobody said "I love you." My mother did not say it. My husband did not say it. But my mother would remember that I liked the burnt edge of the dosa and give it to me, always, without a word. That was the sentence.
And what would you like to leave behind?
I started a notebook, a school exercise notebook with a green cover. The first pages are in Tamil, the later ones in broken English because my grandson in America wanted to read it. But look at what I have written. Not measurements. Stories.
(She opens the notebook.)
"Rasam: Make this when someone is sick or sad. My mother made it the night my father left for the war. The pepper should be coarse so it makes you cry a little, and then you feel better."
"Pongal: Never stir with hurry. When my first child was born dead, I made pongal the next morning and stirred it for an hour because my hands needed something to do."
You see, a recipe is a promise: if you do this, you will be fed. I want my grandchildren to be promised that, even when I am not there. If they are lonely in some foreign city, they can open this notebook, pick a page, and cook. And in the cooking they will be sitting in my kitchen for an hour.
What about the missing measurements?
(She laughs.)
I left them out on purpose. A recipe you can follow exactly teaches you nothing. But a recipe that says "enough" teaches you to taste, to fail, to try again. They will ruin the first few attempts. Then, one day, the rasam will taste exactly like mine, and they will not know why they are crying. That is when I will be there."""
    },
    {
        "id": 5,
        "speaker": "Kuttappan Asari",
        "age": 81,
        "location": "Alappuzha, Kerala",
        "region": "Alappuzha, Kerala",
        "language": "Malayalam",
        "title": "Ninety Men, One Rhythm: Building the Snake Boats of Alappuzha",
        "slug": "kuttappan-asari-alappuzha-snake-boat-builder",
        "topic": "Traditional Vallam Boatbuilding",
        "decade": "1990s",
        "start": 1996,
        "end": 1999,
        "duration": 340,
        "collection": "vanishing-professions",
        "themes": ["craft", "community", "work-and-livelihood", "resilience"],
        "keywords": ["vallam", "snake boat", "alappuzha", "nehru trophy", "flood rescue", "boatbuilder", "kerala"],
        "summary": "Master boatbuilder Kuttappan Asari of Alappuzha describes carving hundred-foot vallam racing hulls, the 1996 flood where racing boats saved their village, and why an eleventh unfinished boat belongs to neighbourhood boys.",
        "text": """I have built eleven vallams, the long snake boats for the Nehru Trophy race. Each one is over a hundred feet, carved from a single type of wood, jointed with coconut-fibre rope and no nails. People think boatbuilding is about wood. It is about water. The wood only learns what the water teaches.
How do you learn a boat?
By listening. When I was a boy, my father made me sleep beside a half-built hull for one month. I thought he was mad. But I heard it settle at night, creak, adjust to the damp. A boat is alive before it ever touches the river.
What is your proudest moment?
Not the winning. Four of my boats have won, but that is the rowers' glory, not mine. My proudest moment is quieter. In 1996, a flood washed away half our village. We climbed onto roofs. And I saw my boats, the old racing vallams, being used to carry children and old women to dry land. Racing boats, doing rescue work. They were not built for it. But they did it without complaint.
Is that what you want to be remembered for?
I will tell you what I want to leave. My eleventh boat is still unfinished. It sits in my yard under a tarpaulin. Two of my apprentices are completing it. They are young, from the village, and they do not charge me anything because they say I taught them for free.
This boat has no owner yet. No village has bought it. I have said, when I die, let it be given to the boys of whichever neighbourhood has no boat. Let them name it. Let them lose a hundred races with it. Let them learn what it feels to ninety rowers to move as one body, which is the real lesson of the vallam. Ninety men, one rhythm. If one man is selfish, the boat goes sideways.
Do you want the boat named after you?
No, no. A name is like a rope. You tie it to a boat and it slows it down. Let it have a name from the children. Something silly, probably.
All I want is that, in the monsoon, when the backwater is high and the song begins, someone's grandfather will point and say, "That boat? The old Asari built her." And someone else will say, "Who?" And he will say, "Doesn't matter. Listen to her go."""
    },
    {
        "id": 6,
        "speaker": "Ganpat Shinde",
        "age": 80,
        "location": "Mumbai, Maharashtra",
        "region": "Mumbai, Maharashtra",
        "language": "Marathi",
        "title": "Every Box is a Trust: Forty-Four Years of Mumbai Dabbawalas",
        "slug": "ganpat-shinde-mumbai-dabbawala-ledger",
        "topic": "Mumbai Dabbawala System & City Life",
        "decade": "1980s",
        "start": 1980,
        "end": 1989,
        "duration": 315,
        "collection": "vanishing-professions",
        "themes": ["work-and-livelihood", "community", "resilience"],
        "keywords": ["dabbawala", "vile parle", "mumbai local", "tiffin box", "ledger", "railway network", "maharashtra"],
        "summary": "Ganpat Shinde reflects on forty-four years delivering tiffin lunchboxes without losing a single one, his cloth-bound ledger recording nine hundred families, and the squeaky bicycle bell that knows the monsoon streets.",
        "text": """Forty-four years, and I did not lose one tiffin. Not one. Please write that. My wife says I mention it too often. I say, it is the only medal I have.
Can you explain what a dabbawala does?
Every morning I collected lunch boxes from homes in Vile Parle, hundreds of them, made by wives and mothers. I took them to the station, sorted them with painted marks, put them on trains, handed them to other men who carried them to offices in Fort and Nariman Point. By one o'clock, a man in a glass office would open his box and eat his wife's cooking, hot, as if he had walked into his own kitchen. Then we took the empties back. Same route, reversed.
How did you never make a mistake?
Because every box was a person's trust. A mother had packed that. A wife had woken at five. You do not lose such a thing. We had no phones, no GPS. Only memory and respect. And the code: a few letters, a few numbers, a colour, a symbol. Anyone could read it. That was our genius. Not cleverness, but simplicity.
What do you think of how the world has changed?
Fast. The boys now carry mobile phones. They check apps. Fine, fine. But I worry they have forgotten that the work is not about delivery. It is about the quiet knowledge that someone, somewhere, is counting on you and will never say thank you.
What would you like to leave?
My ledger and my bicycle.
The ledger is a thick cloth-bound book. In it I wrote, every day for forty-four years, the names of the families I served. Not the codes, the actual names. Mrs. Kulkarni, third floor. The Fernandes family. Old Mr. Bhatia who gave me a coconut every Diwali. When someone died, I drew a small line next to the name. Not a cross, just a line, because I did not know their religion in every case and I did not want to be wrong.
There are more than nine hundred names in that book. I have asked my son to visit those buildings once a year, see which families remain, and read the names aloud. Not for money. Just to say, "Someone remembers you."
And the bicycle is for any young dabbawala who wants it. It has a squeaky bell. Don't fix it. That bell has rung through three decades of monsoon. It knows the way."""
    },
    {
        "id": 7,
        "speaker": "Dolly Mukherjee",
        "age": 84,
        "location": "Kolkata, West Bengal",
        "region": "Kolkata, West Bengal",
        "language": "Bengali",
        "title": "Tapes from the Last Row: Fifty-Three Years of Rabindrasangeet",
        "slug": "dolly-mukherjee-rabindrasangeet-cassettes-kolkata",
        "topic": "Rabindrasangeet & Music Education",
        "decade": "1970s",
        "start": 1972,
        "end": 1978,
        "duration": 320,
        "collection": "childhood-then-and-now",
        "themes": ["education", "community", "resilience"],
        "keywords": ["rabindrasangeet", "gariahat", "kolkata", "cassette tapes", "ekla cholo re", "music teacher", "bengal"],
        "summary": "Teaching Rabindrasangeet above a Gariahat pharmacy for fifty-three years, Dolly Mukherjee recorded 211 cassette tapes of nervous, back-row students singing their first unashamed notes, leaving proof of who they were before they learned to hide.",
        "text": """My real name is Dolon, but nobody has called me that since I was six. Even my husband, in his last years, said "Dolly, tea?" as though I were a doll made of porcelain.
You taught music for many years?
Fifty-three years, in a small room above a pharmacy in Gariahat. Rabindrasangeet mostly, some Nazrul. Hundreds of students. Some became famous, one even sings on television. But I will tell you a secret. My favourite students were never the talented ones.
Who were they?
The last row. The ones who sat at the back because they were afraid. A boy with a stammer who could sing without stuttering. A girl whose father had told her she had a voice like a crow. A middle-aged bank clerk who wanted to sing before his wife died. These people did not want fame. They wanted to open their mouths and not be ashamed.
Gurudev wrote songs for every human feeling. Grief, longing, the first rain, the last train. The words are simple but they are deep, like a pond that looks shallow until you step in. I told my students, "Do not perform the song. Let the song perform you."
What do you want to leave behind?
I have two hundred and eleven cassette tapes. Yes, cassettes. Recordings of my students, the last-row students especially, singing their very first song. Cracked voices, wrong notes, nervous breathing. I recorded all of them because I knew that one day each of them would want to hear who they were before they learned to hide.
I want those tapes to be digitised, if my nephew can manage it. And I want each student, or their families, to be given their own recording. Think of it. A man of sixty hearing himself at twelve, afraid, and brave anyway.
Is there a song you would want played at your funeral?
(She smiles.)
Not a sad one. Perhaps "Ekla Cholo Re", walk alone if no one answers your call. But in a way it is the opposite of loneliness. Because everyone who has ever been afraid has sung it at some point. When you walk alone, you walk with everybody who walked alone.
I would like that. To walk alone together."""
    },
    {
        "id": 8,
        "speaker": "Havaldar Hari Prasad Joshi",
        "age": 88,
        "location": "Almora, Uttarakhand",
        "region": "Almora, Uttarakhand",
        "language": "Kumaoni",
        "title": "A Forest of Banj Oak: Reviving the Dried Naula of Almora",
        "slug": "hari-prasad-joshi-almora-naula-spring",
        "topic": "Himalayan Water Commons & Oak Restoration",
        "decade": "1990s",
        "start": 1990,
        "end": 1999,
        "duration": 340,
        "collection": "vanishing-professions",
        "themes": ["resilience", "community", "farming"],
        "keywords": ["almora", "naula", "kumaon regiment", "oak saplings", "water spring", "himalayas", "uttarakhand"],
        "summary": "Kumaon Regiment veteran Havaldar Hari Prasad Joshi spent eleven post-retirement years digging hillside trenches and planting banj oak trees until his village naula spring trickled water again.",
        "text": """I served twenty-eight years in the Kumaon Regiment. Three wars, if you count the small one. I have a chest full of medals, which my wife kept polished long after she stopped believing in them.
What do you remember most from the army?
Not the battles. The waiting. Nights in the cold, a hundred men saying nothing, and from somewhere in the dark, someone humming a Kumaoni song. You would not believe how much strength comes from a hummed song at three in the morning.
And when you returned home?
I found that the village had a different kind of war. The naula, our spring, had dried up. The stone-lined water source where women gathered every morning, where my mother had carried water on her head, where I first saw my wife, it had gone dry. Trees had been cut on the slopes above. Roads had been built and the water had lost its way.
I was sixty then. People said, "Pension-wala ho gaya, now rest." But I could not rest while the women of my village walked three kilometres for water.
What did you do?
I did what a soldier does. I made a plan and I recruited. For eleven years, with the village boys, we dug trenches along the hillside to catch the rain. We planted oak, banj, which holds water in its roots like a patient grandmother. Every monsoon, we planted a hundred saplings. Many died. We planted again.
In the twelfth year, one morning in March, my granddaughter ran to me shouting. The naula was wet. Just a trickle, a thread of water, but wet.
I sat down on the stone steps and I wept like a child. I have never wept in any war.
Is the spring what you want to leave behind?
The spring, yes, and the trees. But more than that I want to leave a rule. Whoever drinks from the naula must plant one tree before the next monsoon. I have carved this on a slate near the steps. Not a law, a promise. Plant one. Just one.
When I die, do not give me a statue. Give me a hundred and one oak saplings. Medals tarnish. A forest does not need polishing."""
    },
    {
        "id": 9,
        "speaker": "Dr. Lalitha Rao",
        "age": 77,
        "location": "Bengaluru, Karnataka",
        "region": "Bengaluru, Karnataka",
        "language": "Kannada",
        "title": "A Chair and a Stethoscope: The Free Veranda Clinic",
        "slug": "dr-lalitha-rao-bengaluru-free-evening-clinic",
        "topic": "Community Medicine & Ethical Practice",
        "decade": "1980s",
        "start": 1988,
        "end": 1995,
        "duration": 310,
        "collection": "womens-untold-histories",
        "themes": ["womens-histories", "community", "resilience"],
        "keywords": ["physician", "bengaluru", "evening clinic", "medical ethics", "free clinic", "stethoscope", "karnataka"],
        "summary": "One of only four women in her medical college class, Dr. Lalitha Rao recounts fifty-one years as a general physician, running a signless free evening clinic for domestic workers behind her home, and passing on a habit of listening.",
        "text": """I was one of four women in my batch at medical college. We were not welcome. A professor once told me, "Madam, you are occupying the seat of a man who will actually practise." I have been practising for fifty-one years. I like to think I won that argument.
What kind of doctor were you?
A general physician. Fevers, sugar, blood pressure, children's coughs, the common griefs of the body. I never became a specialist. People find this unambitious. But I will tell you, the most important diagnosis in medicine is "I see you are afraid." Most patients who walk in need someone to look at them for more than ninety seconds.
Tell me about the clinic.
In 1988, I opened a small room behind my house. No signboard. If I put up a sign, I would have to charge fees and keep records and fill forms. Instead, word spread. Domestic workers, rickshaw drivers, women from the construction sites nearby. They came in the evenings, after my regular practice, and I treated them without charge.
I am not a saint. Please do not write that. I did it partly out of guilt, partly out of rebellion, and partly because it was the only time of day when I felt like a doctor and not a businesswoman.
Who runs it now?
That is the question that keeps me awake. My knees do not allow me to sit through long evenings anymore. I have a young doctor, Farah, who volunteers on Saturdays. And a retired nurse, Mary-akka, who has been with me thirty years and knows every patient's story better than I do.
What I want to leave is not the clinic. That is too heavy. A clinic needs money, licences, a landlord. What I want to leave is a habit. One evening a week, I want every doctor I have taught, and there are many, to set aside two hours and see anyone who walks in. No forms, no billing. Just a chair and a stethoscope.
I have sent a letter to all my former students. Fourteen have replied yes. Fourteen! In a country with a hundred and forty crore people, it is not a revolution. But a revolution is only a small habit that did not stop.
If you want to remember me, then on some evening, in some lane, in some city, sit down and ask a stranger, "What is troubling you?" And then listen to the whole answer."""
    },
    {
        "id": 10,
        "speaker": "Pema Dolkar",
        "age": 83,
        "location": "Hanu village, Ladakh",
        "region": "Hanu, Ladakh",
        "language": "Ladakhi",
        "title": "Forty Apricot Trees: Sowing Songs Across Himalayan Valleys",
        "slug": "pema-dolkar-hanu-ladakh-apricot-orchard",
        "topic": "Himalayan Oral Traditions & High-Altitude Orchards",
        "decade": "1970s",
        "start": 1974,
        "end": 1979,
        "duration": 320,
        "collection": "womens-untold-histories",
        "themes": ["farming", "womens-histories", "family", "faith-and-ritual"],
        "keywords": ["ladakh", "hanu village", "apricot orchard", "folk songs", "glacier water", "himalayan traditions"],
        "summary": "Pema Dolkar has watched sixty-eight apricot blossom seasons in high Ladakh. She recounts recording forty-three vanishing harvest and wedding songs for a visiting researcher so that silence between generations would not let them die.",
        "text": """At our height, the winters are long and the summers are short, and in between there is a month when everything is in a hurry. That is when the apricots ripen. I have watched sixty-eight such months.
Were you always in this village?
Yes. I went to Leh once, for a hospital visit. I did not like it, too many cars. My home is where my apricot orchard is. Forty trees, planted by my father and his father. When the blossoms open in April, the whole valley looks like it is wearing a veil.
How have things changed?
The snow is less. When I was a girl, the glaciers above us were thick like a quilt. Now they are thin, like old cloth. We have less water for the fields. The young people go to the city, to Delhi, Chandigarh, and some do not come back. This is not their fault. A village cannot hold everyone's dreams.
What will you leave behind?
Songs. Our village has many songs, for harvest, for weddings, for the first day of sowing, for when a yak calves. Nobody has written them down, they live in the mouths of old women. And old women, I will tell you honestly, do not live forever.
Last winter a student from a university came. A young woman, very polite. She asked if she could record me. I said, "What for?" She said, "So the songs are not lost." I thought it was a silly idea at first. Songs are not things you lose. They are things you sing.
But then I remembered my mother's lullaby. I can recall the tune but not the second verse. It is gone, because I never sang it to anyone. That is how a song dies, not in a fire, but in a silence between two generations.
So I sang for her. Seven days. Forty-three songs. She cried at one of them and I said, "Don't cry, it is a happy song." She said, "That is why."
Anything else you would like to leave?
The apricot stones. When the fruit is eaten, we crack the stones and take the kernel, which gives oil. My grandson says it is worth money now. Let him sell it. But keep forty trees. Always forty, whatever else you do.
And if someone climbs the road in April, when the blossoms are out, let them stop. Let them breathe. Let them think, "Somebody planted this long ago, for me." That is all a life is, really. Planting for a stranger."""
    },
    {
        "id": 11,
        "speaker": "Bhanwar Lal Bhat",
        "age": 79,
        "location": "Jaisalmer, Rajasthan",
        "region": "Jaisalmer, Rajasthan",
        "language": "Rajasthani",
        "title": "Strings You Cannot See: Sultan the Kathputli",
        "slug": "bhanwar-lal-bhat-jaisalmer-kathputli-puppeteer",
        "topic": "Kathputli Marionette Puppetry",
        "decade": "1960s",
        "start": 1963,
        "end": 1968,
        "duration": 315,
        "collection": "vanishing-professions",
        "themes": ["craft", "work-and-livelihood", "family"],
        "keywords": ["kathputli", "puppeteer", "jaisalmer", "bolti reed", "sultan puppet", "rajasthan folk art"],
        "summary": "Kathputli puppetry master Bhanwar Lal Bhat describes passing down wooden marionettes older than Indian independence, the squeaky bolti reed voice, and training his granddaughter Rekha in moving invisible strings.",
        "text": """I was born into a family of kathputli masters, puppeteers. My father could make a wooden doll dance so well that kings forgot to blink. This is not exaggeration. The old Maharawal once gave my grandfather a village for a performance. Now we get two hundred rupees and a tourist asks for a selfie.
Do you feel bitterness?
Sometimes. Then I remember that a puppet teaches patience, since you cannot control it by force. If you pull too hard, the string breaks. If you pull too gently, nothing happens. Fifty years of that, and you learn that this is also how to raise children.
What is the secret of the art?
The puppet has no legs. Did you know? Our kathputli have no legs. The puppeteer's fingers and the song do the walking. When the audience watches, they see the puppet dancing, but really, they are seeing the invisible. That is what I tell my grandchildren: the best things in life are done by strings you cannot see.
Tell me about your family's characters.
Anarkali, Amar Singh Rathore, the Rajasthani horseman, the snake charmer. I have one doll that is older than India's independence. His name is Sultan. His turban has been replaced seven times but his face is original. When I was seven, my grandfather let me hold his strings for the first time. I dropped them. He did not scold me. He said, "Sultan will wait."
What do you want to leave behind?
Sultan. And the voice.
A puppeteer talks in a strange squeaky whistle, made by a small reed held in the mouth. It is called a bolti. If you speak through it, a wooden doll seems alive. There are only four or five of us left who can do it properly. I am teaching my granddaughter. Everyone said girls cannot be puppeteers. I said, "The puppet does not know what gender is holding it."
When I die, I want Sultan to be carried at the front of my funeral procession, strings loose. And I want my granddaughter, Rekha, to make him bow once. Just once. And then she will have the puppet and the voice, and the crowd will hear my doll speak in my reed's whistle, and for a second, nobody will know whether I am alive.
That is the greatest compliment to a puppeteer. To be mistaken for someone who is still performing."""
    },
    {
        "id": 12,
        "speaker": "Bhaskar Rao",
        "age": 86,
        "location": "Hyderabad, Telangana",
        "region": "Hyderabad, Telangana",
        "language": "Telugu",
        "title": "The Late Messenger: Four Thousand Undelivered Telegrams",
        "slug": "bhaskar-rao-hyderabad-undelivered-telegrams",
        "topic": "Morse Code & Postal History",
        "decade": "1970s",
        "start": 1972,
        "end": 1978,
        "duration": 340,
        "collection": "vanishing-professions",
        "themes": ["community", "family", "work-and-livelihood"],
        "keywords": ["telegraph", "morse code", "hyderabad", "tin box", "undelivered letters", "postal history", "telangana"],
        "summary": "Bhaskar Rao operated the Morse telegraph for thirty-four years in Hyderabad. Instead of destroying returned, undeliverable cables, he preserved 4,062 telegrams in a tin box, spending retirement returning long-delayed messages to families.",
        "text": """I was a telegraph operator for thirty-four years. Dot, dash, dot. A language of clicks. Good news and bad news both arrived the same way, in the same rhythm. That was the cruel thing about the Morse key, it did not know whether it was announcing a birth or a death.
Did you read the telegrams as you sent them?
We had to. Not read like a novel, but decode. You cannot send what you do not understand. So yes, I knew before the family did. A mother's death, a job offer, an exam result, a wedding date. I once received a telegram at midnight that said, "Son safe, return tomorrow." I knew what the family would feel, joy so big it would knock the door down. I wanted to run to their house myself.
Was it a lonely job?
Strangely, no. I felt connected to everyone. I knew the secret heartbeat of a thousand families. And I developed a small habit.
(He fetches a battered tin box.)
Whenever a telegram was undeliverable, when the address was wrong, the person had moved, or the family had left, it would be returned to the office and eventually destroyed. But I could not destroy them. These were people's words. So I kept them. Four thousand and sixty-two telegrams.
Can I see one?
Of course. This one: "Amma gone. Come soon. Ravi." It never reached its destination. Somewhere, a man named Ravi believed his brother had been told, and his brother never came. I have wondered all my life what happened. Did they forgive each other?
What do you hope will become of the telegrams?
I want them returned. That is my dream. I have written to newspapers, to the post office, to anyone. I have a list of names and old addresses. If anyone, a child, a grandchild, a neighbour, recognises a name, I want to put the telegram in their hand. "Here. Someone wrote to you. It took sixty years, but here it is."
My daughter says it is impossible. Maybe. But I have sent eleven back already. One woman, ninety years old, read hers and said, "I waited for this news for decades. Thank you for being late."
That is what I want to be remembered as. The late messenger. The one who arrived, finally, at the right door."""
    },
    {
        "id": 13,
        "speaker": "Nirmala Sharma",
        "age": 81,
        "location": "New Delhi",
        "region": "Delhi",
        "language": "Hindi",
        "title": "The Key to Model Town: Lahore 1947 and a Bag of Almonds",
        "slug": "nirmala-sharma-partition-key-lahore",
        "topic": "Partition Displacement & Memory",
        "decade": "1940s",
        "start": 1947,
        "end": 1947,
        "duration": 335,
        "collection": "partition-memories",
        "themes": ["partition", "migration", "family", "resilience"],
        "keywords": ["partition 1947", "model town lahore", "house key", "mulberry tree", "refugee train", "chacha rahmat"],
        "summary": "Preserving the rusted fifteen-centimeter key her father used to lock their Model Town Lahore home in August 1947, Nirmala Sharma asks her grandchildren to lay the key on a Pakistani windowsill with thanks to a Muslim neighbor who risked his life to gift almonds.",
        "text": """I was eleven in 1947. People say "Partition" like it is one word, one event. For me it was a train, a night, and a key.
Would you like to tell me?
I will try. We lived in Model Town, Lahore. A big house, with a mulberry tree in the courtyard. One August evening my father came home grey in the face and said we had to leave. My mother packed a trunk. My brother cried because he could not take his kite. And my father, at the last moment, locked the front door and put the key in his pocket.
I remember thinking, why lock it? We are never coming back. Even a child could see that. But he locked it carefully, the way you lock a house when you are going for a holiday. I think it was the only way he could leave. By pretending.
What happened on the journey?
I will not speak of everything. Some things should stay in the dark. I will say that the train stopped for many hours, that we were afraid, that a Muslim neighbour, Chacha Rahmat, had put a bag of dried fruit in our trunk, though he himself was in danger. Hold on to that. In the middle of all the horror, there was a bag of almonds, and a man who risked something to give it.
And the key?
My father kept it his whole life. He died in a rented room in Karol Bagh, with the key in a small steel box beside his bed. Now I keep it. It is heavy, rusty, fifteen centimetres long. It opens nothing. The house must have been broken down, rebuilt, sold ten times.
I have asked my grandchildren: when I die, do not bury the key with me. Take it to Lahore. Many Indian families visit now, with visas. Find Model Town. Find the street, even if the house is gone. Put the key on the ground, or on a windowsill, anywhere. Not to reclaim. Only to return.
And if you meet anyone there, a child, an old man, a shopkeeper, tell them: "Nirmala from the mulberry house says she is sorry it ended this way. And thank you for the almonds."
Let the key finally unlock something. Not a door. A sentence that was never finished."""
    },
    {
        "id": 14,
        "speaker": "Mohammed Yusuf Mir",
        "age": 84,
        "location": "Srinagar, Jammu & Kashmir",
        "region": "Srinagar, Jammu & Kashmir",
        "language": "Kashmiri",
        "title": "Twelve Hundred Blossoms: The Chinar Leaf Papier-Mâché Box",
        "slug": "mohammed-yusuf-mir-srinagar-papier-mache-box",
        "topic": "Kashmiri Papier-Mâché Art",
        "decade": "1970s",
        "start": 1973,
        "end": 1978,
        "duration": 310,
        "collection": "vanishing-professions",
        "themes": ["craft", "resilience", "work-and-livelihood"],
        "keywords": ["papier mache", "srinagar", "chinar leaf", "squirrel hair brush", "kashmir craft", "heirloom box"],
        "summary": "Master craftsman Mohammed Yusuf Mir reflects on seventy-one years of papier-mâché in Srinagar, dedicating four patient years to an heirloom box painted with twelve hundred blossoms honoring lost friends and loved ones.",
        "text": """If you want to understand my life, look at a papier-mâché box. It begins as waste paper, torn, soaked, pounded to pulp. Then it is moulded, dried, polished, painted with a brush made of a single squirrel hair. When it is finished, it looks like jewellery. Ordinary things, transformed by patience.
How long have you been working in this craft?
Seventy-one years. My ustad was a bent old man who never praised me. For three years, I painted only one leaf over and over. When I finally got it right, he looked at it for a long time and said, "Now you can begin."
Kashmir has seen much trouble in your lifetime.
Yes. Curfews, strikes, fear. Many months when no tourists came, no orders, only silence. In those years, we ate less but we kept working. A craftsman does not stop because there is no market. A craftsman stops when the hands stop.
I will say this about the troubles: they did not make me bitter, but they made me quieter. In my workshop, I began to paint a particular design, the chinar leaf. The five-fingered leaf of our great trees, in autumn red. It is our symbol. When I paint a chinar leaf, I am not making a decoration. I am making a prayer.
What would you like to leave behind?
One box. Just one.
It is on that shelf, wrapped in muslin. It took me four years, working a little each day. Inside the lid is a design that has over twelve hundred tiny flowers, each different. Every flower is a person I loved, or a day I remember. One is for my wife, Haleema, who died in a cold winter. One is for my brother, who left for Pakistan and never wrote. One is for a tourist, a German boy, who bought a small box from me in 1974 and came back thirty years later with his own son.
I will not sell this box. It is not for money. I want it passed to whichever apprentice is most patient, not the most gifted. And I have told him, you may add to it. A flower for your own loves. Let it grow.
So the box will never be finished?
God willing, no. A finished thing is a dead thing. Kashmir has seen enough endings. I want to leave a beginning that keeps on beginning."""
    },
    {
        "id": 15,
        "speaker": "Chanda Bora",
        "age": 78,
        "location": "Dibrugarh, Assam",
        "region": "Dibrugarh, Assam",
        "language": "Sadri",
        "title": "Two Leaves and a Bud: Sixty-Three Jhumur Songs of the Tea Gardens",
        "slug": "chanda-bora-dibrugarh-tea-garden-jhumur-songs",
        "topic": "Tea Plantation Labor & Jhumur Chants",
        "decade": "1960s",
        "start": 1964,
        "end": 1969,
        "duration": 325,
        "collection": "womens-untold-histories",
        "themes": ["work-and-livelihood", "womens-histories", "community"],
        "keywords": ["assam tea", "dibrugarh", "jhumur songs", "sadri", "tea garden plucker", "female solidarity"],
        "summary": "Plucking tea leaves for forty-two years in Dibrugarh, Chanda Bora recalls singing Sadri jhumur verses with arms linked across morning bushes and passing sixty-three oral songs to her college granddaughter.",
        "text": """My grandmother was brought to the tea gardens in a cart, from a village in Jharkhand she could no longer name. The recruiters had promised her land and good wages. She got a one-room line house and a basket to tie around her head. That is how my family came to Assam. I was born in the garden, I worked in the garden, and I will probably be buried near it.
What was the work like?
Two leaves and a bud. That is the rule. You pick only the top, the youngest part of the plant. From six in the morning, in the rain, in the heat, with leeches on your ankles. My fingers moved so fast, people said they looked like birds. I plucked for forty-two years. I never once drank the tea I made. It was too expensive. We drank the broken leaves, the leftover dust.
Do you feel anger about that?
When I was young, yes. Now I feel something quieter. Tiredness, maybe. But also pride. Think of it: every cup of Assam tea in the world passed through hands like mine. We are invisible, but we are everywhere.
What do you want to leave behind?
Our songs. We sing jhumur in the garden, in the Sadri language. A line of women, arms linked, swaying, singing about everything: a lover who has gone to another garden, a cruel supervisor, a baby sick with fever, the moon above the shade trees. The songs are funny and sad at once. We learned that you can complain and laugh in the same breath, because otherwise the complaint is too heavy to carry.
My granddaughter, Anita, is the first in our family to finish college. She studies in Guwahati. When she visited last winter, I made her sit on the veranda and I sang her every jhumur I knew. Sixty-three songs. She wrote them in her notebook, spelling the Sadri words the way they sound. She said, "Aaye, why didn't anyone write these before?" I said, "Because we were busy picking."
Is there a song you want sung at the end?
Yes. A small one about a girl who ties her scarf at the garden gate, waiting for someone who is late. When it is my time, let the women of the garden sing it, arms linked, swaying.
And let someone, anyone, brew a cup of tea slowly, properly, and drink it thinking of the woman whose fingers plucked the leaves. I never got to taste the best of what I made. Let someone taste it for me."""
    },
    {
        "id": 16,
        "speaker": "Rustom Irani",
        "age": 82,
        "location": "Pune, Maharashtra",
        "region": "Pune, Maharashtra",
        "language": "English",
        "title": "Café Yazdani: Bun Maska, Chai, and the Chipped Corner Table",
        "slug": "rustom-irani-pune-cafe-yazdani-bun-maska",
        "topic": "Irani Café Culture & Parsi Heritage",
        "decade": "1960s",
        "start": 1961,
        "end": 1968,
        "duration": 315,
        "collection": "grandmothers-kitchen",
        "themes": ["food", "community", "migration"],
        "keywords": ["irani cafe", "cafe yazdani", "pune", "bun maska", "chai", "bentwood chairs", "everyone is a guest"],
        "summary": "Rustom Irani shares the story of Café Yazdani opened in Pune in 1910 by his grandfather from Yazd, leaving the secret bun recipe to his head cook of thirty years and protecting the chipped 1961 marble table where anyone may sit for four unhurried hours.",
        "text": """My grandfather came from Yazd, in Iran, in 1910. He had a few rupees, a samovar and a recipe. He opened a café on a corner in Pune and called it Café Yazdani. We Iranis have a saying: a good café is a country with no borders. Anyone can enter. Anyone can sit. A man with one rupee gets the same chair as a man with fifty.
What was the café like in your childhood?
Bentwood chairs, glass cases of biscuits, mirrors with advertisements for soaps long forgotten. Marble-topped tables, white and veined. A rule on the wall: No talking about politics. No gambling. No spitting. And of course, the bun maska, a soft bun with a thick slab of butter, dipped in sweet milky chai. Poets came, and policemen, and lovers pretending to be strangers.
How is it now?
Most of the old Irani cafés are gone. Rents are high, our children became engineers and moved abroad, and young people prefer places with Wi-Fi and fancy coffee. I do not blame them. But when a café closes, something larger closes. A place where nobody needed a reason to be.
Will yours survive?
(He sighs.)
I do not know. My son lives in Toronto. He says, "Papa, sell it." I tell him, "Sell what? The marble? The mirrors? The smell?" You cannot sell a smell.
Here is what I want to leave. First, the recipe for the bun and the chai. I have given it to my cook, Salim, who has worked for me for thirty years. He is not family by blood, but he has more of my grandfather in him than my own son. I have written in my will that he can use the Yazdani name.
Second, the table by the window. It has a chip on one corner where, in 1961, a drunk customer dropped a heavy glass. My father wanted to replace it. I said no. It tells a story. Whoever buys the café, I told Salim, you will keep that table. And you will let any old man sit there, order one tea, and stay four hours.
Third, the rule on the wall. Not the one about politics. I mean the one beneath it, in my grandfather's handwriting: Everyone is a guest.
I would like that, in some form, to continue. The idea that you do not have to earn your seat. You only have to arrive."""
    },
    {
        "id": 17,
        "speaker": "Kammini Amma",
        "age": 90,
        "location": "Kottayam, Kerala",
        "region": "Kottayam, Kerala",
        "language": "Malayalam",
        "title": "There You Are: Eleven Hundred Births by Kerosene Lamp",
        "slug": "kammini-amma-kottayam-traditional-midwife",
        "topic": "Traditional Midwifery & Maternal Care",
        "decade": "1960s",
        "start": 1962,
        "end": 1969,
        "duration": 340,
        "collection": "womens-untold-histories",
        "themes": ["womens-histories", "community", "family", "resilience"],
        "keywords": ["dai", "vayatatti", "midwife", "kottayam", "kerala", "birth register", "kerosene lamp"],
        "summary": "Midwife Kammini Amma delivered 1,104 infants across floodwaters in rural Travancore, recording each with drawn suns and moons in a thick register and welcoming every newborn with the words: 'There you are.'",
        "text": """I was a midwife. In my day, we were called dai or vayatatti. I trained under my aunt and delivered my first baby at sixteen, during a night of heavy rain, with a kerosene lamp held by a frightened father. The baby came out silent. I rubbed its back, hard, and it cried. That cry decided the rest of my life.
How many babies did you deliver?
Eleven hundred and four. I know because I counted. Every one. Not out of pride, but because I could not bear to forget any of them.
What was childbirth like in those days?
Dangerous. No hospital within twenty kilometres. Roads flooded. Sometimes the mother bled, sometimes the child was turned the wrong way. I lost some, God forgive me. Seven mothers and nineteen babies. I remember each of them too, in a different place in my heart. I light a lamp for them on Fridays.
Did you ever think of giving up?
Once. In 1962, a young woman died in my hands. Her husband stood in the doorway and said nothing, which was worse than any shouting. I told my aunt I was finished. She said, "Ammini, the world is not made better by the people who walk away from its worst nights." I stayed.
What do you want to leave behind?
(She points to a thick register with a cracked spine.)
This. In it I wrote the date, the family, the name of the child. In the early years I could not write well, so I used drawings, a small moon for a night birth, a sun for the day. Eleven hundred and four entries.
I have been told that many of these children are now grandparents. Some are doctors, some drivers. One became a minister, though I will not say which, he was a difficult delivery and has been difficult ever since.
I would like a small gathering after I go. Not a funeral feast, a different kind. Anyone whose name is in the register may come, and they will hear their own name read aloud, with their date of birth and the first sound they made. Some of them have never been told how they arrived. I would like them to know that the first face that ever saw them was an old woman's, wet with rain, saying, "There you are. There you are. You are here."
That is what I said to every one. There you are.
If you want to honour me, say it to someone who feels invisible."""
    },
    {
        "id": 18,
        "speaker": "Chandrakant Desai",
        "age": 77,
        "location": "Ahmedabad, Gujarat",
        "region": "Ahmedabad, Gujarat",
        "language": "Gujarati",
        "title": "Forty Crooked Kites: Uttarayan Winds Over Ahmedabad",
        "slug": "chandrakant-desai-ahmedabad-kite-maker",
        "topic": "Kite Crafting & Uttarayan Rooftop Culture",
        "decade": "1970s",
        "start": 1974,
        "end": 1979,
        "duration": 315,
        "collection": "festival-stories",
        "themes": ["craft", "festivals", "childhood"],
        "keywords": ["kite maker", "uttarayan", "ahmedabad", "patang", "bamboo", "cotton thread", "gujarat"],
        "summary": "Having crafted over a hundred thousand paper and bamboo kites for Gujarat terraces, kite maker Chandrakant Desai leaves forty handmade kites to underprivileged neighborhood children with the gentle advice to fly with cotton thread and let birds pass.",
        "text": """Every January, on Uttarayan, the whole of Gujarat goes to its rooftops. The sky fills with kites. Red, yellow, green. Shouts of "Kai po che!" when a rival string is cut. For me, it is the most beautiful day of the year. Also the most exhausting, because for the other three hundred and sixty-four days, I am making kites.
How do you make a kite?
Bamboo for the spine and the bow, thin tissue paper, a dab of glue made from rice. It sounds simple. But the balance, ah, the balance. A kite has to know which way to lean. If it is too stiff it will not climb. If it is too soft it will crumple. I have made a hundred thousand kites, and I still stand at my table with doubt in my fingers.
Do you fly them yourself?
Not anymore. My shoulder is gone. I sit on the terrace and watch the others fly. This is, I think, a kind of happiness I did not expect. The pleasure of making something you will never use. A kite maker is like a parent, building a thing so it can leave.
Is the tradition changing?
Yes. Factory kites from China, plastic ones, glass-coated string that cuts birds' wings and sometimes the throats of people on scooters. I do not like it. We used to use simple cotton thread with a bit of glue and rice powder. It was a gentle sport. Now it has become violent, competitive, loud. Some years I do not feel like celebrating.
What do you want to leave behind?
Forty kites. They are hanging from the ceiling of my workshop, painted by hand, all different. I have not sold any of them. On my final day, I want them given to forty children, children who have never owned a kite. Not rich ones. The boys who stand at the edge of rooftops watching others fly.
And I want a short instruction passed with each kite: Use cotton thread. Look up before you pull. Let the bird pass.
When the sky is full on Uttarayan, perhaps one of those kites will be flying. Small, wobbling, slightly crooked. I would like to be remembered by a crooked kite flown by a happy child. A perfect kite impresses people. A crooked one that flies anyway, that is the kind I trust."""
    },
    {
        "id": 19,
        "speaker": "Budhan Murmu",
        "age": 80,
        "location": "Dumka, Jharkhand",
        "region": "Dumka, Jharkhand",
        "language": "Santali",
        "title": "Which One is Kind, Dada? The Sacred Jaher Grove of Dumka",
        "slug": "budhan-murmu-dumka-santhal-sacred-grove",
        "topic": "Santhal Botanical Wisdom & Sacred Jaher Groves",
        "decade": "1970s",
        "start": 1970,
        "end": 1977,
        "duration": 340,
        "collection": "vanishing-professions",
        "themes": ["resilience", "community", "faith-and-ritual"],
        "keywords": ["santhal", "dumka", "sacred grove", "jaher", "herbal medicine", "mahua", "jharkhand"],
        "summary": "Santhal elder Budhan Murmu recounts learning the personalities of one hundred and forty forest medicinal plants from his grandfather and teaming up with his schooled grandson to map their sacred three-acre Jaher grove under a sal tree.",
        "text": """I cannot read or write. I say this first, not out of shame, but so you understand that what I carry is in my head and hands. I belong to the Santhal people. We have lived in these forests for longer than any government has existed.
What do you know that others do not?
I know which bark cures a fever, which leaf stops bleeding, which root helps a woman after childbirth. I know when the mahua will flower by the smell of the wind. I know that if the red ants build high, a big rain is coming. I know the names of one hundred and forty plants, in Santali, and I could tell you the story of each.
Where did you learn this?
From my grandfather, who walked me through the forest every morning when I was a boy. He never said "this is a medicine." He said, "This one is kind. This one is angry. This one is sleeping." The plants had personalities. That is how I remembered them.
What troubles you?
The forest is shrinking. Mines, roads, outsiders cutting wood. And a quieter loss: my grandchildren do not walk in the forest anymore. They have phones, they go to school, they want to be clerks. I am not against it. I paid for my grandson's schooling by selling two goats. But I look at his face when I say "mahua" and I see that the word is empty for him.
What would you like to leave?
A grove. Near our village there is a patch of forest, a jaher, a sacred grove, where we pray and where no tree is ever cut. It is only three acres. But in it grow nearly everything my people have ever needed. I have been telling the village council for years: this must be protected, written down, shown to the government. Now my grandson, the one with the schooling, is helping. He is using his new knowledge for our old knowledge. He drew a map. He wrote down plant names in a notebook. He said, "Dada, I will make it official." I said, "It was official before there were officials."
But I let him. Both languages can serve the same tree.
What I want in the end is simple. When I die, bury me inside the grove, under a sal tree. No stone. Let my body feed it. And let the children come on their school holidays and walk there. Not to learn medicine, but to ask the question I asked as a boy.
"Which one is kind, Dada? Which one is angry?"
And someone, I hope, will still have an answer."""
    },
    {
        "id": 20,
        "speaker": "Ramdhari Yadav",
        "age": 75,
        "location": "Patna, Bihar",
        "region": "Patna, Bihar",
        "language": "Bhojpuri",
        "title": "The Dented Brass Bell: Forty Years of Pulling Rickshaws in Patna",
        "slug": "ramdhari-yadav-patna-cycle-rickshaw-bell",
        "topic": "Urban Migrant Labor & Educational Sacrifices",
        "decade": "1970s",
        "start": 1973,
        "end": 1979,
        "duration": 330,
        "collection": "vanishing-professions",
        "themes": ["work-and-livelihood", "family", "resilience"],
        "keywords": ["rickshaw puller", "patna", "brass bell", "siwan", "migrant labor", "bihar", "education"],
        "summary": "Pulling a cycle-rickshaw through Patna streets for forty years, Ramdhari Yadav divided every rupee into four to educate his three children—a teacher, an engineer, and a nurse—passing down his dented brass bell as a reminder of carrying weight lightly.",
        "text": """Do not make me sound great. I was a rickshaw-puller. I carried people for forty years. That is the whole story.
I think there is more to it.
(He laughs.) All right. A little more.
I came to Patna at fifteen from a village near Siwan. There was a flood, and we lost our small field. My father said, "Go to the city. Pull a rickshaw. Send money." So I did. I slept under the rickshaw's hood for the first three years, in rain and cold. I ate sattu and chilli and a bit of onion. My legs became iron, my back became a bow.
What kind of passengers did you carry?
Everyone. Schoolchildren every morning, office babus, brides in red, old women going to the temple, drunk men going nowhere. A lawyer who always argued about the fare. A professor who read a book while I pedalled and never once looked up. Once, a woman in labour, and I raced through the lanes shouting like a madman until we reached the hospital. A boy was born that night. They named him Ramdhari. He is a government clerk now. He sends me sweets on my birthday.
What are you proudest of?
My three children. I never learned to read, but I made sure they did. Every rupee I earned, I split in four, one for food, one for rent, one for school, and one hidden under a brick in case of disaster. My eldest is a schoolteacher. My second is an engineer. My daughter is a nurse. When she wore her white uniform for the first time, I touched her feet. She said, "Papa, what are you doing?" I said, "I am touching the feet of someone I could not become."
What would you like to leave behind?
Only this.
(He holds up a small, dented brass bell.)
This was on my rickshaw for forty years. Every morning, before I began, I rang it once. It meant: I am here, I am ready, I will carry you safely. The sound has gone into the walls of Patna, I think.
I want my grandchildren to ring it, once, on the first day of any new work. A first exam, a first job, a first day at a new school. Just one ring. And they should remember that someone pulled a weight for them, so that they could ride lightly."""
    }
]

print(f"Loaded {len(STORIES_RAW_PART1)} stories for part 1")
