
namespace game {

	/** System that initiates and updates the gyroscope reading */
	export class GyroReadingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, GyroscopeReader], (entity, reader) => {
				if (reader.Initialized && !reader.IsMobile) { return; }
				if (reader.Initialized) {
					//Read data from HTML:
					let dataElement = document.getElementById("GyroData");
					let dataArray = dataElement.innerHTML.split("|").map(Number);
					reader.GyroData = new Vector2(dataArray[0], dataArray[1]);
					return;
				}

				// Set basic device info
				// maybetodo: move this info to new DeviceInformation ConfigComponent?
				reader.IsMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
				reader.IsiOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

				// Create elements to store data in
				let body = document.querySelector('body');

				let iOSElement = document.createElement("div");
				iOSElement.id = ("iOS");
				iOSElement.innerHTML = `${reader.IsiOS}`;
				iOSElement.setAttribute("style", "display: none;");
				body.appendChild(iOSElement);

				let vectorElement = document.createElement("div");
				vectorElement.id = ("GyroData");
				vectorElement.innerHTML = "";
				vectorElement.setAttribute("style", "display: none;");
				body.appendChild(vectorElement);


				// Create function that will run on "devicemotion" event
				function motion(event) {
					let isiOS: boolean = document.getElementById("iOS").innerHTML === "true";
					let newX: number;
					let newY: number;
					//there's difference between iOS devices and Android devices on some values
					let correctionX = isiOS ? 1 : -1;
					let correctionY = isiOS ? -1 : 1;

					//account for device orientation
					//the component should be usable in the sameway, regardless of the way the device is held
					switch (window.orientation) {
						case 0:
							newX = event.accelerationIncludingGravity.x * correctionX;
							newY = event.accelerationIncludingGravity.z * correctionY;
							break;
						case 180:
							newX = event.accelerationIncludingGravity.x * correctionX * -1;
							newY = event.accelerationIncludingGravity.z * correctionY;
							break;
						case 90:
							newX = event.accelerationIncludingGravity.y * correctionX * -1;
							newY = event.accelerationIncludingGravity.z * correctionY;
							break;
						case -90:
							newX = event.accelerationIncludingGravity.y * correctionX;
							newY = event.accelerationIncludingGravity.z * correctionY;
							break;
						//why even
						default:
							newX = 0;
							newY = 0;
							break;
					}
					//Set gyroData in HTML, to later be read by the component
					document.getElementById("GyroData").innerHTML = `${newX}|${newY}`;
				}

				//Set created function to run if the device is mobile device
				//Can't tilt your desktop ;)
				if ((window as any).DeviceMotionEvent && reader.IsMobile) {
					window.addEventListener("devicemotion", motion, false);
				}

				reader.Initialized = true;
			});
		}
	}
}
