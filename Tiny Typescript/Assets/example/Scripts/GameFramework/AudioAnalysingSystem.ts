namespace game {
	/** New System */
	export class AudioAnalysingSystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Audio.AudioSource, AudioFrequencyAnalyser], (entity, source, analyser) => {
				//Don't try to initialize or update
				if (!source.playing) { return; }

				//Update frequency data from html into componentData
				if (analyser.Initialized) {
					let dataElement = document.getElementById(entity.index.toString() + "v" + entity.version.toString());
					let dataArray = dataElement.innerHTML.split(",").map(Number);
					analyser.FrequencyData = dataArray;
					return;
				}

				//Initialization:
				let body = document.querySelector('body');

				// --- Canvas Rendering ---
				// let canvas = document.createElement("canvas");
				// canvas.id = "myCanvas";
				// canvas.setAttribute("style", "width: 100%; height: 120px; background: #002D3C; float: left;");
				// body.appendChild(canvas);
				// let originalCanvas = document.getElementById('UT_CANVAS');
				// originalCanvas.setAttribute("style", "touch-action: none; width: 1042px; height: 200px;");
				// let canvasCtx = canvas.getContext('2d');

				// Create element to store data in
				let htmlElement = document.createElement("div");
				htmlElement.id = (entity.index.toString() + "v" + entity.version.toString());
				htmlElement.innerHTML = "";
				htmlElement.setAttribute("style", "display: none;");
				body.appendChild(htmlElement);

				// Find audioSource belonging to this entity source
				let audioSystem = (ut as any)._AudioSystem;
				let trueSource = audioSystem.audioSources[entity.index];

				// Web Audio API
				// Create and connect nodes
				let audioCtx = audioSystem.audioContext;
				let analyserNode = audioCtx.createAnalyser();
				if (source.volume === 1) {
					trueSource.connect(analyserNode);
				} else {
					let gainNode = audioCtx.createGain();
					gainNode.gain.setValueAtTime(source.volume, 0);
					trueSource.connect(gainNode);
					gainNode.connect(analyserNode);
				}
				analyserNode.connect(audioCtx.destination);

				// Set up data storage
				let bufferLength = analyserNode.frequencyBinCount;
				let frequencyData = new Uint8Array(bufferLength);

				let domainStart = analyser.FrequencyDomain.x;
				let domainEnd = analyser.FrequencyDomain.y;

				// Create update method that will keep frequencyData updated each frame
				function updateFrame() {
					//Loop method
					requestAnimationFrame(updateFrame);

					// Store data from frequencyData in html element
					analyserNode.getByteFrequencyData(frequencyData);
					htmlElement.innerHTML = frequencyData.slice(domainStart, domainEnd).toString();

					// --- Canvas Rendering ---
					// canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
					// canvasCtx.fillStyle = "#FFFF00";
					// var bars = domainEnd;
					// for (var i = 0; i < bars; i++) {
					// 	var bar_x = i * 3;
					// 	var bar_width = 2;
					// 	var bar_height = -(frequencyData[i] / 2);
					// 	canvasCtx.fillRect(bar_x, canvas.height, bar_width, bar_height);
					// }
				}
				// Run method
				updateFrame();
				analyser.Initialized = true;
			});
		}


	}
}
