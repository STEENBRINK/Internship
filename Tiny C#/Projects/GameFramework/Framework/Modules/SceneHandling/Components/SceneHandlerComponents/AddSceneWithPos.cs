using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    public struct AddSceneWithPos: IComponentData
    {
        public SceneReference sceneToLoad;
        public bool makeIndestructable;
        public float2 newPos;
    }
}