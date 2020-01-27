using Unity.Authoring.Core;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    [HideInInspector]
    public struct ScenesToLoad: IBufferElementData
    {
        public SceneReference sceneReference;
        public bool makeIndestrucktable;
        public float2 pos;
        public float2 offset;
        public bool setPos;
        public bool setOffset;
    }
}