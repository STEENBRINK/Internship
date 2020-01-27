using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;

namespace Modules.Spawner
{
    public struct Spawner: IComponentData
    {
        public uint ID;
        public SceneReference sceneReferenceToSpawn;
        public SpawnType spawnType;
        public bool isSpawningPaused;
        public bool isTriggered;
        public uint timerID;
        public TranslationType translationType;
        public float2 spawnPos;
        public float2 spawnOffset;
    }
}