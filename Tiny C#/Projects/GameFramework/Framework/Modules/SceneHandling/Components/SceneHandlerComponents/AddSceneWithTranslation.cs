using Modules.Spawner;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    public struct AddSceneWithTranslation: IComponentData
    {
        public SceneReference sceneToLoad;
        public bool makeIndestructable;
        public TranslationType translationType;
        public float2 pos;
        public float2 offset;
    }
}