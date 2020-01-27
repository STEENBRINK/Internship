using Unity.Authoring.Core;
using Unity.Entities;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    public struct MySceneReferences: IBufferElementData
    {
        public SceneReference sceneReference;
        public bool makeInDestructable;
    }
}