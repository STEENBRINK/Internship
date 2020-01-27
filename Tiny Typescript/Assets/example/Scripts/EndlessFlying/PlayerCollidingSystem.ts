namespace game {
	/** System to handle the collision of objects with the player */
	export class PlayerCollidingSystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([ut.Entity, PlayerCollider, TimeInterval], (entity, playerCollider, timer) => {
				//Shield behaviour
				//Add fading after half of the shield duration
				if (playerCollider.ShieldActive && timer.Time >= (timer.Interval * 0.75) && !this.world.hasComponent(playerCollider.ShieldEntity, TimeInterval)) {
					this.world.usingComponentData(playerCollider.ShieldEntity, [TimeInterval], fadeTimer => {
						fadeTimer.Time = 0;
						fadeTimer.Interval = timer.Interval * 0.20;
					});
				}
				//Shield deactivation when time has passed
				if (playerCollider.ShieldActive && timer.Time >= timer.Interval) {
					playerCollider.ShieldActive = false;
					this.world.removeComponent(playerCollider.ShieldEntity, TimeInterval);
					EntityUtils.SetActive(this.world, playerCollider.ShieldEntity, false);
					this.world.usingComponentData(playerCollider.ShieldEntity, [ut.Core2D.Sprite2DRenderer], renderer => {
						renderer.color = new ut.Core2D.Color(renderer.color.r, renderer.color.g, renderer.color.b, 1);
					});
				}

				if (!CollisionUtils.IsColliding(this.world, entity)) { return; }

				let collisions = CollisionUtils.GetCollidingEntities(this.world, entity);

				let enemies = new Array<ut.Entity>();
				let coins = new Array<ut.Entity>();
				let shields = new Array<ut.Entity>();

				//Get all colliding entities, sorted into appropriate lists
				collisions.forEach(untity => {
					if (this.world.hasComponent(untity, Enemy)) { enemies.push(untity); }
					else if (this.world.hasComponent(untity, Coin)) { coins.push(untity); }
					else if (this.world.hasComponent(untity, Shield)) { shields.push(untity); }
				});

				//Shield collision behaviour
				shields.forEach(shield => {
					playerCollider.ShieldActive = true;
					EntityUtils.SetActive(this.world, playerCollider.ShieldEntity, true);
					timer.Time = 0;

					AudioUtils.StartAudio(this.world, shield, true, true);
					EntityUtils.DestroyEntity(this.world, shield, true);
				});

				//Enemy collision behaviour
				enemies.forEach(enemy => {
					//Player dies when shield is not active
					if (!playerCollider.ShieldActive) {
						EntityUtils.DestroyEntity(this.world, playerCollider.Animation, true);
						EntityUtils.SetActive(this.world, playerCollider.DeathAnimation, true);
						this.world.removeComponent(entity, PlayerCollider);
						this.world.removeComponent(EntityUtils.GetParentEntity(this.world, entity), PlayerInteraction);

						//Activate GameOverManager and pass on the score
						EntityUtils.SetActive(this.world, playerCollider.GameOverManager, true);
						this.world.usingComponentData(playerCollider.GameOverManager, [GameOverManager], gameOver => {
							gameOver.FinalScore = this.world.getComponentData(entity, ScoreManager).Score;
						});
					}

					//Enemy always dies
					this.world.removeComponent(enemy, ut.HitBox2D.Sprite2DRendererHitBox2D);
					this.world.usingComponentData(enemy, [Enemy], enemyData => {
						EntityUtils.SetActive(this.world, enemyData.Animation, false);
						EntityUtils.SetActive(this.world, enemyData.DeathAnimation, true);
					});
				});

				//Coin collision behaviour
				coins.forEach(coin => {
					//Add score
					this.world.usingComponentData(playerCollider.ScoreManager, [ScoreManager, TextReference], (scoreMgr, textRef) => {
						scoreMgr.Score += this.world.getComponentData(coin, Coin).Value;
						textRef.Value = scoreMgr.Score.toString();
					});
					AudioUtils.StartAudio(this.world, coin, true, true);
					EntityUtils.DestroyEntity(this.world, coin, true);
				});
			});
		}
	}
}
