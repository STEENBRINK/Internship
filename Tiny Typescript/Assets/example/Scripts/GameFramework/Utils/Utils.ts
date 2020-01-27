namespace game {
	export class RangeUtils {
		/**
		 * This function creates a Range from the provided Vector2.
		 * @param range The values from which you want to create a range.
		 */
		public static CreateRange(range: Vector2): Range {
			let mathRange = new ut.Math.Range();
			mathRange.start = range.x;
			mathRange.end = range.y;
			return (mathRange as unknown) as Range;
		}

		/**
		 * This function reads the values of the provided Range object and returns them as a Vector2.
		 * @param range The Range object from which you want to read the values.
		 */
		public static ReadRange(range: Range): Vector2 {
			let mathRange = (range as unknown) as ut.Math.Range;
			return new Vector2(mathRange.start, mathRange.end);
		}
	}

	/** ABDUL - ABDUL - ABDUL - ABDUL
	 *
	 * ZZZZZOOZ$$7II?I??I???II??????????IIIIII7$ZZZ$$$$ZOZ$777777$777777777$$$77777$$$$
	 * ZZZZZZOOOOOOOOOOZZZZZZZZZZZZZZZZZZZZZZZZ77?=~~+IZO$I+=~=?7$$$$$$$$$77777IIIIIIII
	 * ZZZZZZZZZZ88DDNDZZOZ7III???????????+++++===~::=IZZ$I=~:::~=====~~~~::~~~~~::::::
	 * ZZZZZZ$7?I$Z8DND7I77?+++??++==+???++=~~~~~~~::=?ZZ7+:,,,::?7$7??II+~:+I7I?++++~:
	 * OOZZZ$$I+?I7Z8DOI???+++????+==???++=~~:~~===+=+7$ZI=,,,,,:IZ8O7$OZI=~+7$7????+~:
	 * OOOOZ$$7?+II$ZOZ?+??++++??++==+?+++=~~~=++IZDZ$DZZ$+:,,,,:IZOZ77ZZI=~+7$7?+??+~:
	 * OOOOZ$$7?+?I7$Z$?+++++++???+==+++++=~=+ZZO8D8D8D8MOO=~:,,~I$Z$II$7?~:+77I?+++=~:
	 * 888OZZ$7?+??I$Z$?+++=~~~====~~~=====$$ONND8D8M8DNDNND8=~::~=+=~~~~:,,:~=~~::::,,
	 * 8888OZ7I+++?I7$7+=++=~~~==========?7O8DNNNMMDNNNNNMNNDOI=::::::::::::::::,,,,,,,
	 * 8888Z7?+==++++++==++====??IIIIIIIIZZOODNMNMNNNNMMMMMNMNDO?~~=++++++++++++++++=~:
	 * 8OZ$I?+===+++==~~==+==~==+++++++IZ88DN8NNNMMDNDNMNMMDNMNND+~~=++++++++===++++=~:
	 * OZ7I?+====+++==~~=====~~======++ONDND88D88D8OOZ88DDDNNNMMNI=:~~~~~~~~~~~~~~~~~::
	 * D8Z7??+++++++++==+++++++++++++7ZDDDO?????+??I7ZO8ZZOZO8DMMZ7=~~~~~~=======~~~::,
	 * NN8Z?+++++++++++++????????????I8NDZ==~~:~~====I$7I????7IONDO7777777II???++=~:::,
	 * MMDZ+~~~~:~~~~~~~~~~~~~~~~~~~=$8MD+~~~::~~~~~~======++++?DDOOOOOOZZ77II7I?====++
	 * NNDZ=~~::::::::::::::::::::::~7NN8=~~~::::::~~~~~~~~=++++?D87III?????+??III7$$ZZ
	 * DNDZ+~~~=++++=====~~~~:::::::~ZNNZ+=~~::::::~~:::~~~~=+++?NDI+====++?I$$ZZOOOO88
	 * NNDO+~~~?$ZZZZZZZ$$$7?~:::~~~=ZMDZ+=:~~~~~==============?7NNI?++I7ZZZZOOOOO8888O
	 * MNDO+~~~?$OOOOZZZZZZZ7~::::~::~M7DDMMDDDNNND$7I77Z8ND8OO?INMZ$$ZO88888888888DD88
	 * NDO$+~:~?$ZZZZZZZZZZ$I~:::::::I7DZ?OO$77Z8O8ONMMNO88$$OO$MM8?$OOOO888888888DDDDD
	 * $I??=~~~?7ZZZZZZZZZZ$I~::::::,+~8?=?IZOZZO8O7N~+DNDNMNDZIOD7Z$8888888888DDDDDDDN
	 * II77IIIIIIII77$$ZZZZ$I~::::::,=?8+~=I=??IIIID::~D$ZZZ$7?+DN?78888DDD8DDDNNNNNNNN
	 * ZONNNNNDD8$$$ZZZOOZZ$I~::::::::=?+==~=ZZ$$ZD~::~+NI???++O+87DDDDDDNDDDDNNNNNMMMM
	 * ODNMMMMMMNOZZZ$$ZOZ$I?=~~~~~~~===$~~~~==I$+~~:~=??O$77I?+?=?DDNDNNNNNNNNMMMMMMNN
	 * ZZZZZZZOOOZ$OOZ$77II??????????II:$+=+?Z87??I+=++?+$$$I++?I?DDNNNNNNNNNNMMMMMMMN8
	 * D8OOOZZZZZ$$ZZ$7IIII77$$$$$$II$$$7++?$N888D88Z78ND8888IIIIDNNNNNNNNNNNMMMMMMNNND
	 * 888OOOOOOOZZ$$77$$$ZZZZZZZZ$II$$$$??IZMDNZ$ZDNNND8Z8NN7II7ODNNNNNNNNNMMMMMMNNNNN
	 * 88888DDD8OZ$$$$$$$ZZOOOOOOZ$I7ZZZZ7II7N7++?I+II7$OZ$ONZ$$I7ZNMMMNNNNNMMMNNDDD88D
	 * NNNMMMNDOZ$$$$$$ZZOOOOOOOOOZ77ZZZZIZ77ZO?+=+??IIII7$88$$$7778DNNNNNMMNNMNNDDDDDD
	 * MMMMNN8OZZZZZZZZOO88888OOOZ$77$$7?+$$77OI++IODD8$77OOZZZ$$$$ZO8888DDNNNMMNNDD888
	 * MND8OZ88OZZOZZZZZZZZ$$$777IIIIIII~=+Z7IOZZ7I$$Z$$$ODOZZOZ$$OOOO88DDDDDDD88OZZ$$$
	 * D8OZZO88$$77777777777777$$$$$$$$===+?777OOOZZZ$O88DD8?I7$7$OOOO8DDD88OZZ$$77$777
	 * 7777$$ZZ$$$$ZZZZZZZZZZOZOOZZ?,:~=~=+??IZZD88888DDD8$II7$ZZOOOOZOOOOOZZ$$$$$$$$$$
	 * $$ZZOOOOOOO8888888888OO8O7..,,~~====+?II7$ZONNND8ZI7?O88888888OZZZZ$$$$$$$$$$$$$
	 * ZZZO8888888888888OOOZO?.,.,,,,~==~==++???I77$ZZZ$7III:888O8888OZZ$$$$$$$$$$$$$$$
	 * NDOOOOOOOOOOOOOOZO7,....,,,,,,,:=~===++???II7$$$7II?+O,IOZOOOOOOZ$$$$$$$$$$$$$$$
	 * NND8888888OOOO+.......,,,,,,,,::::~++++??????IIIII??+I+,,.88888OZ$$$$$$$$$$$$$$$
	 * 8DNDDDDD888~......,,,,,,,,,,:,,,:::~:~+??I??IIIIII???I~,:,..+DZZ$$$$$$$$$$77777$
	 * O8NNDDDDD~....,,,,,,,,,,,:,:,...,,~:~~~~=+I77I7III7+~~:,,,,,.,:7I??III??????++++
	 * Z8NNNNDI....,,,,,,,,::::::,,.,.....,,:==~===~===+====~,...,,,,.,.~~~~~~~~~~~::::
	 * Z8NMNN.....,.,,,,,,:::~~:,...,......,,,:=+==~==+==~~:,,.....::,,,,,+++++==~~~~~~
	 * ODMMN,.,,,,,,,,,:,::::~:,,...,.......,,,,,~=++++==::,,,,,,,,,:,,,,,.$777II?+++++
	 * DNMM..,,,,,,::,,::::::::,...,,...,..,,,.,,,:~~~~~:,,,,,,,,,,,.:::,,,.?++++======
	 * OOO7.,,,,,:::~,,::::~:~:,....,,,,,.....,.,,,,:::,,,,,,,,,,,,...:::::,,==========
	 * ???,,,,,,::::~~::~:~:~:,.....,,,..........,,.,~:,,,,,,,,,,,.....:::::,==========
	 * ??.,,,::::~:::~::~~=~:,.,.....,,.............,,,,,,,,,,,,,,.....:~:~::~=========
	 * ?+,,::::::::::~=:~~~:~,.......,,,...........,:,,.,,,,,,,,.,....,,::~::,~========
	 * ?,,,:,::::~~~~==:~~~:,,,,,....,,,...........,,.,,,.,,,,,,,,.,..,,:::::,:========
	 * :,,,,:::::~:~~~+:~~~,.,,,,....,,,........,,,,,,,,,..,.,,........,,:::::~========
	 * ,,,,:::::::~~~~=:~=~..,,,.....,,,..........,,,,,,,..,,,,..,.......:::~~~~=======
	 * ,,::::::::~~~=~~:~~:,,,.......,,,,......,,,,,,,,,,...,,,...,...,..,~~~~~:=======
	 *	 */
	export class ABDUL {
		/** Prints our glorious leader in your console
		 * This is definitely what you want to do every other line of code!
		 */
		static PrintAbdul() {
			console.log("ZZZZZZO88DDDOOO$77777IIIIII???+=~:~IZZI=::~++++===~~~=~~~~~:");
			console.log("ZZZZ$7?7ZDNDII7+++??+=+??++=~~~~~:~?Z$+:,,:=7$I?I?~~I7?+++=:");
			console.log("OOOZ$7+?7Z8O???+++??+=+?++=~~~=+?$$OZ7=,,,:+ZO$$Z7==7$I+?+=:");
			console.log("OOOZ$7+?I$Z$++++++??+=++++=~=$7ZOD88N8O~:,:+ZO77$I~=I$I+++=:");
			console.log("88OZ$7++?7Z$+++=~~===~~====$$NDDDNDDDMNN+~:~==~~~~,:~=~::::,");
			console.log("888Z7?=+?I7I+=+=~~=++++++?OODNDDNDMMNNNMDZ=:::~~:::::::::::,");
			console.log("8OZI+==+++=~~=+=~=++????7DDD8DDMNNNMMNMNNNN?~=++++++++++++=:");
			console.log("O$I++==++==~~===~~====++8NN8DD8D8OO8D8DNNMN8=~~~~~~~~~~~~~::");
			console.log("D8$?+++????++???????++ION8I==~==+?7OZ7I77$MNZ++++++++===~::,");
			console.log("MNZ=~~~~~~~~~~~=======?8NZ~~::~~~~=+++++++ZD8OZZZZ77II?=~~~~");
			console.log("NNZ=~:::::::::::::::::=ND?~~~:::::~:~~~=+++DDI??++++?II7$ZOO");
			console.log("NNZ=~~?777III??+~::::~=N8I=:::::~~~~~~~~=+?8N?==+?I7ZOOO8888");
			console.log("MNO=~~7ZOOOOZZZ$+:::~~~MZIO8D8D8$I+?I$O$77?8M7I7O888O8888D88");
			console.log("D8$=:~IZZZZZZZZ$=::::,I78+O$77OO8ONM8O8$ZOZM8?8OO8888888DDDD");
			console.log("???===?77$$$ZZZ$=::::,++O=:+?7ZO7D:~OO$7ZO?ZII888888DDDDDDNN");
			console.log("$8D888O$7$ZZZZZ$=::::,,?7=~?Z++=7~:~N7?++?OO7DNDDDDDDNNNNNMM");
			console.log("8NMMMMM8ZZ$$ZZ$?=~~~~~==7=~~==$7~~:=?O$77??I?DNDNNNNNNMMMMMN");
			console.log("OZZZZZZ$$OZ7III??II7I?I7+++?O8778I??$$$$??+=DNNNNNNNNMMMMNN8");
			console.log("88OOOOOZZ$77$$ZZZZZZ$I$$$I?7ND8$ZNDNDZ8NOIIZDNNNNNNNMMMMNNDN");
			console.log("88DDNDOZ$$$$$ZOOOOOZ$7$ZZ?IIO$+++I7$Z$$88$7IZNMMNNNMMMNDD88D");
			console.log("MMMMN8Z$$$$$ZO888OOOZ7$ZZ~$77O++IZ$Z77Z8$O$77ODDNNNNNMMNDDDD");
			console.log("ND8ZO8ZZOZZZZZZ$$777IIII?~+$IOZ7I$Z$$ZDOZOZ$OOO88DDDDD8OZZ$$");
			console.log("OZ$ZOO$777777777$$$$$$$$~=+?Z788OOZ88DDI?7$$OOO8888OZZ$$$$$7");
			console.log("77$$ZZZZOOOOOOOOO8OO~.:~~==??IZDDD88NO7IZZOO88OZOZZZ$$$$$$$$");
			console.log("$ZO88888888888OOOI..,,:====+?III$ZZZ77I~888888OZZ$$$$$$$$$$$");
			console.log("N8OOOOOOOOOOZ:...,,,,:,,===++???I777II??7.OOOOOO$$$$$$$$$$$$");
			console.log("DND888888+.....,,,,,,,,::::++????II7I???$:,.ID8OZ$$$$$$$$$$$");
			console.log("ODNDDDZ....,,,,,,,,,:...,::~~~=?777III+~~,,,,,.7IIII?????+++");
			console.log("ODNND....,,,,,,:::::.,.....::=====+++=+:,...,,,,.=~~~~~:::::");
			console.log("8NMM,,.,.,,,,:::::,..,......,,,~=====~:,,,,,,::,,,.777I?+++=");
			console.log("NMM.,,,,,:,,::::::,..,,..,.,,.,,:~~~~,,,,,,,,.,:,,,~++++====");
			console.log("ZZ=.,,::,::,:~::~:...,,,,,......,,::..,,,,,,,..,:::.========");
			console.log("??.,,:::::~:~~~:~,,...,,.....,..,,,,,,,,,,,.....::~::=======");
			console.log("+,,:::::::~=:~~~,.....,,,........,,,,,,,,,,,...,:~~:,~======");
			console.log(":,,::::~~~~=~~~,,,,...,,.......,,,..,,,,,,.,.,,,,:::,:======");
		}
	}
}
